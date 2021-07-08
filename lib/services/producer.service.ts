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
    const { connectionName, ...rest } = options || {};
    try {
      const sender: AwaitableSender = await this.getSender(target, connectionName);
      const messageToSend: Message = {
        body: jsonStringify(message),
        durable: true,
        ...rest,
      };
      if (!messageToSend.message_id) {
        messageToSend.message_id = getID();
      }
      const delivery = await sender.send(messageToSend);
      const { settled } = delivery;
      if (!settled) {
        this.logger.warn(`Send message failed: ${target}`, message);
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
        onError: (context: EventContext) => {
          const senderError = context.sender && context.sender.error;
          const connection = context.connection;
          if (senderError) {
            this.logger.debug(">>>>> [%s] An error occurred for sender '%s': %O.", connection.id, producerToken, senderError);
          }
        },
        onSessionError: (context: EventContext) => {
          const sessionError = context.session && context.session.error;
          const connection = context.connection;
          if (sessionError) {
            this.logger.debug(">>>>> [%s] An error occurred for session of sender '%s': %O.", connection.id, producerToken, sessionError);
          }
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
