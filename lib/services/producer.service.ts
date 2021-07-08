import { jsonStringify } from '@dollarsign/utils';
import { Injectable } from '@nestjs/common';
import { AwaitableSender, CreateAwaitableSenderOptions, EventContext, Message } from 'rhea-promise';

import { CreateSenderOptions, DeliveryStatus, SendOptions } from '../interfaces';
import { getLogger, getProducerToken } from '../utils';
import { getID } from '../utils/get-id';
import { AMQPService } from './amqp.service';

@Injectable()
export class ProducerService {
  private readonly logger = getLogger(ProducerService.name);
  private readonly senders: Map<string, AwaitableSender>;

  constructor(private readonly amqpService: AMQPService) {
    this.senders = new Map<string, AwaitableSender>();
  }

  /**
   * @param target - name of the queue
   * @param message - message body
   * @param options - send options
   * @returns state of send
   */
  public async send<T>(target: string, message: T, options?: SendOptions): Promise<DeliveryStatus> {
    const { connectionName, ...messageOptions } = options || {};
    try {
      const sender = await this.getSender(target, connectionName);
      const msg: Message = {
        durable: true,
        message_id: getID(),
        body: jsonStringify(message),
        ...messageOptions,
      };
      const delivery = await sender.send(msg);
      const { settled } = delivery;
      if (!settled) {
        this.logger.warn(`Send to ${target} failed message id: ${msg.message_id}`, message);
      }
      return {
        delivery,
        status: settled,
      };
    } catch (error) {
      const err = error as Error;
      const connectionClosed = err.message.includes(`Cannot read property 'address' of undefined`);
      const errorMessage = connectionClosed ? 'connection closed' : err.message;
      this.logger.error(`Send message error: ${target} ${errorMessage}`, message);
      return {
        error: err,
        status: false,
      };
    }
  }

  /**
   * @param target - name of the queue
   * @param connectionName - connection name
   * @returns sender
   */
  private async getSender(target: string, connectionName: string): Promise<AwaitableSender> {
    const producerToken = getProducerToken(target, connectionName);
    if (this.senders.has(producerToken)) {
      return this.senders.get(producerToken);
    }
    const senderOptions: CreateAwaitableSenderOptions = {
      name: producerToken,
      target: {
        address: target,
        capabilities: ['queue'],
      },
    };
    const createOptions: CreateSenderOptions = {
      connectionName,
      senderOptions,
    };
    const sender = await this.amqpService.createSender(createOptions);
    this.senders.set(producerToken, sender);
    return sender;
  }
}
