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
    const options: SendOptions = {
      message_id: new Date().getTime(),
    };
    const message = { now: new Date().toISOString() };
    const result = await this.producer.send('demo1', message, options);
    return `Send message to demo1 of default connection: ${result}`;
  }

  async sendMessage2(): Promise<string> {
    const options: SendOptions = {
      message_id: new Date().getTime(),
      connectionName: 'custom',
      group_id: 'A',
    };
    const message = { now: new Date().toISOString() };
    const result = await this.producer.send('demo2', message, options);
    return `Send message to demo2 of custom connection: ${result}`;
  }

  @Consumer('demo1', { parallelMessageProcessing: 1, concurrency: 2 })
  async receiveMessage1(data: unknown, control: MessageControl): Promise<void> {
    const { message_id } = control.message;
    this.logger.trace(`Received message from demo1 id: ${message_id}`, data);
    await delay(2000);
  }

  @Consumer('demo2', { connectionName: 'custom', concurrency: 2 })
  async receiveMessage2(data: unknown, control: MessageControl): Promise<void> {
    const { message_id } = control.message;
    this.logger.trace(`Received message from demo2 id: ${message_id}`, data);
    await delay(2000);
    control.accept();
  }
}
