import { Logger } from '@dollarsign/logger';
import { Consumer, MessageControl, ProducerService, SendOptions } from '@dollarsign/nestjs-amqp';
import { delay } from '@dollarsign/utils';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly producer: ProducerService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async sendMessage1(): Promise<string> {
    const name = 'default';
    const options: SendOptions = {
      message_id: new Date().getTime(),
    };
    const message = { name };
    const result = await this.producer.send('demo1', message, options);
    return `Send message to ${name} connection: ${result}`;
  }

  async sendMessage2(): Promise<string> {
    const name = 'amqp';
    const options: SendOptions = {
      message_id: new Date().getTime(),
      connectionName: name,
      group_id: 'A',
    };
    const message = { name };
    const result = await this.producer.send('demo2', message, options);
    return `Send message to ${name} connection: ${result}`;
  }

  @Consumer('demo1', { parallelMessageProcessing: 1, concurrency: 2 })
  async receiveMessage1(data: unknown, control: MessageControl): Promise<void> {
    const { message_id } = control.message;
    this.logger.trace(`Received message from amqp1 id: ${message_id}`, data);
    await delay(3000);
  }

  @Consumer('demo2', { connectionName: 'amqp', parallelMessageProcessing: 1, concurrency: 2 })
  async receiveMessage2(data: unknown, control: MessageControl): Promise<void> {
    const { message_id } = control.message;
    this.logger.trace(`Received message from amqp2 id: ${message_id}`, data);
    await delay(3000);
    control.accept();
  }
}
