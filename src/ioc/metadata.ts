import 'reflect-metadata';

class MetaDataExample {
  text: string | undefined;

  constructor() {
    this.text = '0000000';
  }
}

const exp = new MetaDataExample();

Reflect.defineMetadata('type', 'Example', exp);
Reflect.defineMetadata('type', 'String', exp, 'text');
Reflect.defineMetadata('text', '11111', exp);

console.log(exp.text);
console.log(Reflect.getMetadata('text', exp));


