class FWorker {
 manualProduct() {
   console.log('manualProduct')
 }
}
class

class WorkShop {
  private worker: FWorker = new FWorker();

  produce() {
    this.worker.manualProduct();
  }
}

class Factory {
  start() {
    const workShop = new WorkShop();
    workShop.produce();
  }
}

const factory = new Factory();
factory.start();
