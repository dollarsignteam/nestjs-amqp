import { jsonStringify } from '@dollarsign/utils';
import { Injectable } from '@nestjs/common';
import { AwaitableSender, CreateAwaitableSenderOptions, Message } from 'rhea-promise';

import { SendOptions } from '../interfaces';
import { getLogger } from '../utils';
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
    const sender: AwaitableSender = await this.getSender(target);
    const messageToSend: Message = {
      body: jsonStringify(message),
      ...options,
    };
    const delivery = await sender.send(messageToSend);
    if (!delivery.sent) {
      this.logger.warn(`Send message failed: ${target}`, message);
    }
    return delivery.sent;
  }

  /**
   * @param target - name of the queue
   * @returns sender
   */
  private async getSender(target: string): Promise<AwaitableSender> {
    let sender: AwaitableSender;
    if (this.senders.has(target)) {
      sender = this.senders.get(target);
    } else {
      const options: CreateAwaitableSenderOptions = {
        target: {
          address: target,
          capabilities: ['queue'],
        },
      };
      sender = await this.amqpService.createSender(options, '');
      this.senders.set(target, sender);
    }
    return sender;
  }
}
