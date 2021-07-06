import { ProducerService } from '@dollarsign/nestjs-amqp';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(private readonly producer: ProducerService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async sendMessage1(): Promise<string> {
    const result = await this.producer.send('demo', { foo: 'bar' }, { connectionName: 'amqp1' });
    return `Send message to amqp1 connection: ${result}`;
  }

  async sendMessage2(): Promise<string> {
    const result = await this.producer.send('demo', { foo: 'bar' }, { connectionName: 'amqp2' });
    return `Send message to amqp2 connection: ${result}`;
  }
}
