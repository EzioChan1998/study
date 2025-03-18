import 'reflect-metadata';

class ValidateExample {
  @validate
  print(val: string) {
    console.log(val);
  }
}

function validate(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const parameterTypes = Reflect.getMetadata('design:paramtypes', target, propertyKey);
  console.log(parameterTypes)
}

const validateExample = new ValidateExample();
validateExample.print('test');
