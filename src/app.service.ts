import { ProducerService } from '@dollarsign/nestjs-amqp';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(private readonly producer: ProducerService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async sendMessage(): Promise<string> {
    await this.producer.send('demo', { foo: 'bar' }, { connectionName: 'amqp1' });
    return 'Hello World!';
  }
}
