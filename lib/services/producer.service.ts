import { jsonStringify } from '@dollarsign/utils';
import { Injectable } from '@nestjs/common';
import { AwaitableSender, CreateAwaitableSenderOptions, Message } from 'rhea-promise';

import { CreateSenderOptions, DeliveryStatus, SendOptions } from '../interfaces';
import { ErrorMessage, getID, getLogger, getProducerToken } from '../utils';
import { AMQPService } from './amqp.service';

@Injectable()
export class ProducerService {
  private readonly logger = getLogger();
  private readonly senders: Map<string, AwaitableSender>;

  constructor(private readonly amqpService: AMQPService) {
    this.senders = new Map<string, AwaitableSender>();
  }

  /**
   * @param target - name of the queue
   * @param body - message body
   * @param options - send options
   * @returns state of send
   */
  public async send<T>(target: string, body: T, options?: SendOptions): Promise<DeliveryStatus> {
    const { connectionName, ...messageOptions } = options || {};
    try {
      const sender = await this.getSender(target, connectionName);
      const msg: Message = {
        durable: true,
        message_id: getID(),
        body: jsonStringify(body),
        ...messageOptions,
      };
      const delivery = await sender.send(msg);
      const { settled } = delivery;
      if (!settled) {
        this.logger.warn(`Send to ${target} failed message id: ${msg.message_id}`, body);
      }
      return {
        delivery,
        status: settled,
      };
    } catch (error) {
      const errorMessage = ErrorMessage.fromError(error);
      const connectionClosed = errorMessage.includes(`Cannot read property 'address' of undefined`);
      const msg = connectionClosed ? 'connection closed' : errorMessage;
      this.logger.error(`Send message error: ${target} ${msg}`, body);
      return {
        error,
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
