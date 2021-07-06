import { Logger } from '@dollarsign/logger';
import { Consumer, MessageControl, ProducerService, SendOptions } from '@dollarsign/nestjs-amqp';
import { Injectable } from '@nestjs/common';

const sleep = (ms: number): Promise<void> => new Promise(r => setTimeout(r, ms));

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(private readonly producer: ProducerService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async sendMessage1(): Promise<string> {
    const name = 'amqp1';
    const options: SendOptions = {
      message_id: new Date().getTime(),
      connectionName: name,
    };
    const message = { name };
    const result = await this.producer.send('demo', message, options);
    return `Send message to ${name} connection: ${result}`;
  }

  async sendMessage2(): Promise<string> {
    const name = 'amqp2';
    const options: SendOptions = {
      message_id: new Date().getTime(),
      connectionName: name,
      group_id: 'A',
    };
    const message = { name };
    const result = await this.producer.send('demo', message, options);
    return `Send message to ${name} connection: ${result}`;
  }

  @Consumer('demo', { connectionName: 'amqp1', parallelMessageProcessing: 1, concurrency: 2 })
  async receiveMessage1(data: unknown, control: MessageControl): Promise<void> {
    const { message_id } = control.message;
    this.logger.info(`Received message from amqp1 id: ${message_id}`, data);
    await sleep(5000);
    throw new Error('CUSTOM ERROR');
    // control.accept();
  }

  @Consumer('demo', { connectionName: 'amqp2', parallelMessageProcessing: 1, concurrency: 2 })
  async receiveMessage2(data: unknown, control: MessageControl): Promise<void> {
    const { message_id } = control.message;
    this.logger.info(`Received message from amqp2 id: ${message_id}`, data);
    await sleep(5000);
    control.accept();
  }
}
