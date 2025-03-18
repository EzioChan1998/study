interface Producer {
  produce: () => void;
}

class FWorker implements Producer {
 manualProduct() {
   console.log('manualProduct');
 }

 produce() {
   this.manualProduct();
 }
}

class Machine implements Producer{
  autoProduct() {
    console.log('autoProduct');
  }

  produce() {
    this.autoProduct();
  }
}

class WorkShop {
  private producer: Producer;

  constructor(producer: Producer) {
    this.producer = producer;
  }

  produce() {
    this.producer.produce();
  }
}

class Factory {
  start() {
    const producer:Producer = new Machine();
    const workShop = new WorkShop(producer);
    workShop.produce();
  }
}

const factory = new Factory();
factory.start();
