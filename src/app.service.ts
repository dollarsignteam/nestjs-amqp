import { Logger } from '@dollarsign/logger';
import { Consumer, MessageControl, ProducerService } from '@dollarsign/nestjs-amqp';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
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

  @Consumer('demo', { connectionName: 'amqp1' })
  receiveMessage(data: unknown, control: MessageControl): void {
    this.logger.success(`Received message from amqp1`, data);
    control.accept();
  }
}
