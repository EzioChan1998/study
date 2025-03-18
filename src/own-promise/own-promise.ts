
enum STATUS {
  PENDING = 'pending',
  FULFILLED = 'fulfilled',
  REJECTED = 'rejected'
}

type resolveType<T> = (value: T) => void;
type rejectType = (reason?: any) => void;

function isFunction(func: unknown):func is Function {
  return func instanceof Function;
}

class OwnPromise<T = unknown> {
  status: STATUS;
  result: T | undefined;
  private resolveQueue: Array<Function> = [];
  private rejectQueue: Array<Function> = [];
  private finallyQueue: Array<Function> = [];

  constructor(resolver:(resolve:resolveType<T>, reject:rejectType) => void) {
    if(typeof resolver !== 'function') {
      throw new TypeError('resolver must be a function');
    }

    this.status = STATUS.PENDING;

    const resolve:resolveType<T> = (value: T) => {
      if(this.status !== STATUS.PENDING) return;

      setTimeout(() => {
        this.result = value;
        this.status = STATUS.FULFILLED;

        for (const fn of this.resolveQueue) {
          fn(this.result);
        }
        for (const fn of this.finallyQueue) {
          fn();
        }
      });
    };
    const reject:rejectType = (reason?: any) => {
      if(this.status !== STATUS.PENDING) return;

      setTimeout(() => {
        this.result = reason;
        this.status = STATUS.REJECTED;

        for (const fn of this.rejectQueue) {
          fn(this.result);
        }
      });
    };

    try {
      resolver(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: (value:T) => TResult1 | undefined | null,
    onrejected?:(value:any) => TResult2 | undefined | null
  ):OwnPromise<TResult1 | TResult2> {
    const _onfulfilled = isFunction(onfulfilled) ? onfulfilled : (value:T) => value as unknown as TResult1;
    const _onrejected = isFunction(onrejected) ? onrejected : (reason:any) => { throw reason };

    if(this.status === STATUS.PENDING) {
      const resolveQueue = this.resolveQueue;
      const rejectQueue = this.rejectQueue;
      const promise =  new OwnPromise<TResult1 | TResult2>((resolve, reject) => {
        resolveQueue.push(function (innerValue:T) {
          try {
            const value = _onfulfilled(innerValue);
            // resolve(value as TResult1);
            doThenFunction(promise, value as TResult1, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });

        rejectQueue.push(function (innerValue: T) {
          try {
            const value = _onrejected(innerValue);
            // resolve(value as TResult2);
            doThenFunction(promise, value as TResult2, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      });
      return promise;
    } else {
      const innerValue = this.result as T;
      const isFulfilled = this.status === STATUS.FULFILLED;
      const promise =  new OwnPromise<TResult1 | TResult2>((resolve, reject) => {
        try {
          const value = isFulfilled
            ? _onfulfilled(innerValue)
            : _onrejected(innerValue);
          // resolve(value as TResult1 | TResult2);
          doThenFunction(promise, value as TResult1 | TResult2, resolve, reject);
        } catch (error) {
          reject(error);
        }
      });
      return promise;
    }
  }

  catch<TResult = never>(onrejected?:(value:any) => TResult | undefined | null) {
    return this.then(undefined, onrejected);
  }

  finally(onfinally?: (() => void) | undefined) {
    const _onfinally = isFunction(onfinally) ? onfinally : () => {};
    if(this.status === STATUS.PENDING) {

      const finallyQueue = this.finallyQueue;
      const promise = new OwnPromise<T>((resolve, reject) => {
        finallyQueue.push(function () {
          try {
            _onfinally();
            doThenFunction(promise, undefined as T, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      });


      return promise;
    } else {
      const promise =  new OwnPromise<T>((resolve, reject) => {
        try {
          _onfinally();
          doThenFunction(promise, undefined as T, resolve, reject);
        } catch (error) {
          reject(error);
        }
      });
      return promise;
    }
  }

  static resolve<U>(value?: U):OwnPromise<Awaited<U>> {
    if(value instanceof OwnPromise) {
      return value;
    }

    return new OwnPromise<Awaited<U>>(resolve => {
      resolve(value as Awaited<U>);
    });
  }

  static reject(reason?: any) {
    return new OwnPromise((_ , reject) => {
      reject(reason);
    });
  }

  static all<T = unknown>(promises: Array<OwnPromise<T> | T>) {
    let resArr = [];
    let count = 0;
    return new OwnPromise<T[]>((resolve, reject) => {
      promises.forEach((item, index) => {
        OwnPromise.resolve(item).then(res => {
          resArr[index] = res;
          count = count + 1;
          if(count === promises.length) resolve(resArr);
        }, reject);
      });
    });
  }

  static race<T = unknown>(promises: Array<OwnPromise<T> | T>) {
    return new OwnPromise<T>((resolve , reject) => {
      for (const promise of promises) {
        OwnPromise.resolve(promise).then(resolve, reject);
      }
    });
  }

  static allSettled<T>(promises: Array<OwnPromise<T> | T>) {
    return new OwnPromise<{ value: T; status: STATUS.FULFILLED | STATUS.REJECTED; }[]>((resolve , reject) => {
      let count = 0;
      let resArr: { value: T; status: STATUS.FULFILLED | STATUS.REJECTED; }[] = [];

      function processResult(res: T, index: number, status: STATUS.FULFILLED | STATUS.REJECTED) {
        count = count + 1;
        resArr[index] = { value: res, status };
        if(count === promises.length) resolve(resArr);
      }

      promises.forEach((promise, index) => {
        OwnPromise.resolve(promise).then(res => {
          processResult(res, index, STATUS.FULFILLED);
        }, (err) => {
          processResult(err, index, STATUS.REJECTED);
        });
      });
    });
  }
}

function doThenFunction<T = unknown>(promise:OwnPromise<T>, value: T | OwnPromise<T>, resolve:resolveType<T>, reject:rejectType) {
  // 判断循环引用
  if(promise === value) {
    reject(new TypeError('Chaining cycle detected for promise'));
    return;
  }

  if(value instanceof OwnPromise) {
    value.then(function (res) {
      doThenFunction(promise, res, resolve, reject);
    }, function (reason) {
      reject(reason);
    });

    return;
  }

  resolve(value as T);
}

export default OwnPromise;

// const originLog = console.log;
// console.log = function (...params) {
//   const div = document.createElement('pre');
//   div.innerHTML = params.map((item) => {
//     if(item instanceof Function) {
//       console.log(item.toString());
//       return item.toString();
//     }
//     if(item instanceof Object) return JSON.stringify(item);
//     return String(item);
//   }).join('   ');
//   div.style.borderBottom = '1px solid blue';
//   div.style.padding = '8px 16px';
//   document.body.appendChild(div);
//   originLog.call(this, ...params);
// }

// let p = OwnPromise.reject(3)
// setTimeout(console.log, 0, p)
// p.then(undefined, e => setTimeout(console.log, 0, 3))
// setTimeout(console.log, 0, OwnPromise.reject(OwnPromise.resolve(1)))

// let p = OwnPromise.resolve(1);
// setTimeout(console.log,0, p === OwnPromise.resolve(p))
// setTimeout(console.log,0, p === OwnPromise.resolve(OwnPromise.resolve(p)));
//
// const p2 = new OwnPromise<string>((resolve) => {
//   setTimeout(() => {
//     resolve('str')
//   }, 3000)
// })
//
// const p3 = new OwnPromise<string>((resolve, reject) => {
//   setTimeout(() => {
//     reject('wrong string')
//   }, 4000)
// })
//
// OwnPromise.all([p2, '2', '3', 1]).then(res => {
//   console.log(res)
// }).catch((err) => {
//   console.log(err)
// })

// const p1 = new OwnPromise((resolve, reject) => {
//   setTimeout(() => {
//     resolve(function () { return 'xixixixi' })
//   }, 1000)
// })
// const p2 = new OwnPromise((resolve, reject) => {
//   setTimeout(() => {
//     resolve(2)
//   }, 1100)
// })
// const p3 = new OwnPromise((resolve, reject) => {
//   setTimeout(() => {
//     reject(3)
//   }, 1200)
// })
//
// OwnPromise.allSettled([p1, p2, p3]).then(res => console.log(res))

OwnPromise.resolve(1)
  .then((res) => {return String(res)})
  .then((res) => { res.at(1) })
  .finally(() => { console.log('ajajja'); throw new Error('error') })
  .catch((e) => { console.log(e) })
  .finally(() => { console.log(3); return 'test' })
  .then((res) => {console.log(4, res)})
