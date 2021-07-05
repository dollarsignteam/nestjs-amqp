import { ProducerService } from '@dollarsign/nestjs-amqp';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(private readonly producer: ProducerService) {}

  async getHello(): Promise<string> {
    await this.producer.send('demo', { foo: 'bar' }, { connectionName: 'amqp1' });
    return 'Hello World!';
  }

  message(): void {
    //
  }
}
