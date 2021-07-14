import { Logger } from '@dollarsign/logger';
import { Consumer, MessageControl, ProducerService, SendOptions } from '@dollarsign/nestjs-amqp';
import { delay } from '@dollarsign/utils';
import { Injectable } from '@nestjs/common';

import { SimpleMessage } from './interfaces';

@Injectable()
export class AppService {
  private readonly delayTime = 2000;
  private readonly logger = new Logger({
    name: AppService.name,
    displayFilePath: false,
  });

  constructor(private readonly producer: ProducerService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async sendMessage(): Promise<string> {
    const body = { timestamp: new Date().toISOString() };
    const result = await this.producer.send<SimpleMessage>('demo1', body);
    const status = result.status ? 'success' : 'failed';
    return `Send to demo1 of default connection: ${status}`;
  }

  async sendMessageWithOptions(): Promise<string> {
    const index = Math.floor(Math.random() * 100) % 2;
    const groups = ['GroupA', 'GroupB'];
    const options: SendOptions = {
      connectionName: 'custom',
      group_id: groups[index],
      message_id: new Date().getTime(),
    };
    const body = { timestamp: new Date().toISOString() };
    const result = await this.producer.send<SimpleMessage>('demo2', body, options);
    const status = result.status ? 'success' : 'failed';
    return `Send to demo2 of custom connection: ${status}`;
  }

  async sendError(): Promise<string> {
    const message = { timestamp: new Date().toISOString() };
    const result = await this.producer.send<SimpleMessage>('demo3', message);
    const status = result.status ? 'success' : 'failed';
    return `Send to demo3 of default connection: ${status}`;
  }

  @Consumer('demo1')
  async receiveMessage(body: SimpleMessage): Promise<void> {
    this.logger.info('Received from demo1', body);
    await delay(this.delayTime);
  }

  @Consumer('demo2', { connectionName: 'custom', concurrency: 2 })
  async receiveMessageWithOptions(body: SimpleMessage, control: MessageControl): Promise<void> {
    const { message_id, group_id } = control.message;
    this.logger.info(`Received from demo2 id: ${message_id}, ${group_id}`, body);
    await delay(this.delayTime);
    control.accept();
  }

  @Consumer('demo3')
  async receiveError(body: SimpleMessage): Promise<void> {
    this.logger.info('Received from demo3', body);
    await delay(this.delayTime);
    throw new Error(`Created at ${body.timestamp}`);
  }
}
