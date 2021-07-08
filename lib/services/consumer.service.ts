import { parseJSON } from '@dollarsign/utils';
import { Injectable } from '@nestjs/common';
import { EventContext, Receiver, ReceiverOptions } from 'rhea-promise';

import { ConsumerMetadata, MessageControl } from '../domain';
import { CreateReceiverOptions } from '../interfaces';
import { getLogger } from '../utils';
import { AMQPService } from './amqp.service';

@Injectable()
export class ConsumerService {
  private readonly logger = getLogger(ConsumerService.name);
  private readonly receivers: Map<string, Receiver>;
  private readonly parallelMessageCount = 1;
  private readonly concurrency = 1;

  constructor(private readonly amqpService: AMQPService) {
    this.receivers = new Map<string, Receiver>();
  }

  public async consume<T>(consumer: ConsumerMetadata, callback: (object: T, control: MessageControl) => Promise<void>): Promise<void> {
    const { source, options, consumerToken } = consumer;
    const credits = options?.parallelMessageProcessing || this.parallelMessageCount;
    const concurrency = options?.concurrency || this.concurrency;
    const messageHandler = async (context: EventContext): Promise<void> => {
      const control: MessageControl = new MessageControl(context);
      const { message_id, body } = context.message;
      this.logger.silly(`Incoming message id: ${message_id}`, { source });
      const objectLike = body instanceof Buffer ? body.toString() : body;
      const object = parseJSON<T>(objectLike);
      try {
        const startTime = new Date();
        await callback(object, control);
        const durationInMs = new Date().getTime() - startTime.getTime();
        this.logger.silly(`Handling message id: ${message_id} finished in ${durationInMs / 1000} seconds`);
        if (!control.isHandled) {
          control.accept();
        }
      } catch (error) {
        const { message } = error as Error;
        this.logger.error(`An error occurred message id: ${message_id}`, { error, source });
        control.reject(message);
      }
    };
    const concurrent = new Array(concurrency).fill(null).map((_, i) => i + 1);
    for await (const index of concurrent) {
      const consumerName = `${consumerToken}-${index}`;
      await this.getReceiver(consumer, consumerName, credits, messageHandler);
    }
  }

  private async getReceiver(
    consumer: ConsumerMetadata,
    consumerName: string,
    credits: number,
    messageHandler: (context: EventContext) => Promise<void>,
  ): Promise<Receiver> {
    const { source, connectionToken } = consumer;
    if (this.receivers.has(consumerName)) {
      return this.receivers.get(consumerName);
    }
    const onError = (context: EventContext): void => {
      const { error } = context?.receiver || {};
      this.logger.error('Receiver error', { name: consumerName, source, error });
    };
    const receiverOptions: ReceiverOptions = {
      source,
      name: consumerName,
      onError: onError.bind(this),
      onMessage: messageHandler.bind(this),
      autoaccept: false,
      credit_window: 0,
    };
    const createOptions: CreateReceiverOptions = {
      credits,
      connectionToken,
      receiverOptions,
    };
    const receiver = await this.amqpService.createReceiver(createOptions);
    this.receivers.set(consumerName, receiver);
    return receiver;
  }
}
