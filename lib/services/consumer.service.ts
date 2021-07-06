import { parseJSON } from '@dollarsign/utils';
import { Injectable } from '@nestjs/common';
import { EventContext, Receiver, ReceiverOptions } from 'rhea-promise';

import { MessageControl } from '../domain';
import { ConsumerOptions, CreateReceiverOptions } from '../interfaces';
import { getConsumerToken, getLogger } from '../utils';
import { AMQPService } from './amqp.service';

const PARALLEL_MESSAGE_COUNT = 1;

@Injectable()
export class ConsumerService {
  private readonly logger = getLogger(ConsumerService.name);
  private readonly receivers: Map<string, Receiver>;

  constructor(private readonly amqpService: AMQPService) {
    this.receivers = new Map<string, Receiver>();
  }

  public async consume<T>(
    queueName: string,
    callback: (object: T, control: MessageControl) => Promise<void>,
    options: ConsumerOptions,
  ): Promise<void> {
    // get receiver
    const initialCredit = !!options && options.parallelMessageProcessing ? options.parallelMessageProcessing : PARALLEL_MESSAGE_COUNT;

    const messageValidator = async (context: EventContext, control: MessageControl): Promise<void> => {
      this.logger.verbose(`incoming message on queue '${queueName}'`);

      const body = context.message.body;
      const objectLike = body instanceof Buffer ? body.toString() : body;
      const object = parseJSON<T>(objectLike);

      try {
        // run callback function
        const startTime = new Date();
        await callback(object, control);
        const durationInMs = new Date().getTime() - startTime.getTime();
        this.logger.log(`handling '${queueName}' finished in ${durationInMs} (ms)`);

        // handle auto-accept when message is otherwise not handled
        if (!control.isHandled()) {
          control.accept();
        }
      } catch (error) {
        this.logger.error(`error in callback on queue '${queueName}': ${error.message}`, error);

        // can't process callback, need to reject message
        control.reject(error.message);
      }

      this.logger.verbose(`handled message on queue '${queueName}'`);
    };

    const messageHandler = async (context: EventContext): Promise<void> => {
      const control: MessageControl = new MessageControl(context);

      messageValidator(context, control).catch(error => {
        this.logger.error(`unexpected error happened during message validation on '${context.receiver.address}': ${error.message}`, error);
        control.reject(error.message);
      });
    };
    await this.getReceiver(queueName, options?.connectionName, initialCredit, messageHandler);
  }

  private async getReceiver(
    queueName: string,
    connectionName: string,
    credit: number,
    messageHandler: (context: EventContext) => Promise<void>,
  ): Promise<Receiver> {
    let receiver: Receiver;
    if (this.receivers.has(queueName)) {
      receiver = this.receivers.get(queueName);
    } else {
      const consumerToken = getConsumerToken(connectionName);
      const onError = (context: EventContext): void => {
        this.logger.error(
          `receiver errored: ${JSON.stringify({
            source: context.receiver.address,
            error: context.receiver.error,
          })}`,
        );
      };
      const receiverOptions: ReceiverOptions = {
        name: consumerToken,
        onError: onError.bind(this),
        onMessage: messageHandler.bind(this),
        source: queueName,
        autoaccept: false,
        credit_window: 0,
      };
      const options: CreateReceiverOptions = {
        connectionName,
        credits: credit,
        receiverOptions,
      };
      receiver = await this.amqpService.createReceiver(options);
      this.receivers.set(queueName, receiver);
    }
    return receiver;
  }
}
