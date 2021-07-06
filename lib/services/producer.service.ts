import { jsonStringify } from '@dollarsign/utils';
import { Injectable } from '@nestjs/common';
import { AwaitableSender, CreateAwaitableSenderOptions, Message } from 'rhea-promise';

import { CreateSenderOptions, SendOptions } from '../interfaces';
import { getLogger, getProducerToken } from '../utils';
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
  public async send<T>(target: string, message: T, options?: SendOptions): Promise<boolean> {
    const { connectionName } = options || {};
    try {
      const sender: AwaitableSender = await this.getSender(target, connectionName);
      const messageToSend: Message = {
        body: jsonStringify(message),
        ...options,
      };
      const delivery = await sender.send(messageToSend);
      if (delivery.settled) {
        return true;
      }
      this.logger.warn(`Send message failed: ${target}`, message);
    } catch (error) {
      this.logger.error(`Send message failed: ${target} ${(error as Error)?.message}`, message);
    }
    return false;
  }

  /**
   * @param target - name of the queue
   * @param connectionName - connection name
   * @returns sender
   */
  private async getSender(target: string, connectionName: string): Promise<AwaitableSender> {
    let sender: AwaitableSender;
    const producerToken = getProducerToken(connectionName);
    if (this.senders.has(producerToken)) {
      sender = this.senders.get(producerToken);
    } else {
      const senderOptions: CreateAwaitableSenderOptions = {
        name: producerToken,
        target: {
          address: target,
          capabilities: ['queue'],
        },
      };
      const createSenderOptions: CreateSenderOptions = {
        connectionName,
        senderOptions,
      };
      sender = await this.amqpService.createSender(createSenderOptions);
      this.senders.set(producerToken, sender);
    }
    return sender;
  }
}
