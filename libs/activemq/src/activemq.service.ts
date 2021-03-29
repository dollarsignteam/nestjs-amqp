import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  AwaitableSender,
  AwaitableSenderOptions,
  Connection,
  ConnectionEvents,
  ConnectionOptions,
  EventContext,
  generate_uuid,
  Message,
  Receiver,
  ReceiverEvents,
  ReceiverOptions,
  Session,
} from 'rhea-promise';

@Injectable()
export class ActiveMQService implements OnModuleInit {
  private readonly logger = new Logger(ActiveMQService.name);

  private readonly connectionOptions: ConnectionOptions;

  private connection: Connection;

  constructor() {
    this.connectionOptions = {
      hostname: 'localhost',
      port: 5672,
      username: 'user',
      password: 'pass',
      reconnect: true,
    };
  }

  async createConnection(options: ConnectionOptions): Promise<Connection> {
    const connection = new Connection(options);
    connection.on(ConnectionEvents.connectionOpen, () => {
      this.logger.log(`ConnectionEvents: connectionOpen`);
    });
    connection.on(ConnectionEvents.settled, () => {
      this.logger.warn(`ConnectionEvents: settled`);
    });
    connection.on(ConnectionEvents.connectionClose, () => {
      this.logger.warn(`ConnectionEvents: connectionClose`);
    });
    connection.on(ConnectionEvents.connectionError, () => {
      this.logger.warn(`ConnectionEvents: connectionClose`);
    });
    connection.on(ConnectionEvents.disconnected, () => {
      this.logger.warn(`ConnectionEvents: disconnected`);
    });
    connection.on(ConnectionEvents.error, () => {
      this.logger.warn(`ConnectionEvents: error`);
    });
    connection.on(ConnectionEvents.protocolError, () => {
      this.logger.warn(`ConnectionEvents: protocolError`);
    });
    return connection.open();
  }

  async createSender(
    options: AwaitableSenderOptions,
  ): Promise<AwaitableSender> {
    return this.connection.createAwaitableSender(options);
  }

  async createReceiver(options: ReceiverOptions): Promise<Receiver> {
    return this.connection.createReceiver(options);
  }

  async onModuleInit() {
    this.connection = await this.createConnection(this.connectionOptions);
    this.logger.verbose(`connection is open: ${this.connection.isOpen()}`);
    const sessionProducer = await this.connection.createSession();
    const sessionConsumer = await this.connection.createSession();
    await this.receiver(sessionConsumer, 'receiver-1');
    await this.receiver(sessionConsumer, 'receiver-2');
    await this.receiver(sessionConsumer, 'receiver-3');
    await this.receiver(sessionConsumer, 'receiver-4');
    await this.receiver(sessionConsumer, 'receiver-5');
    setTimeout(async () => {
      await this.sender(sessionProducer, 'sender-1');
    }, 2000);
  }

  private async receiver(sessionConsumer: Session, name: string) {
    const receiver = await sessionConsumer.createReceiver({
      name,
      source: {
        address: 'demo',
      },
      autoaccept: false,
      credit_window: 0,
    });
    receiver.on(ReceiverEvents.receiverOpen, (ctx: EventContext) => {
      this.logger.log(`ReceiverEvents: receiverOpen`);
      ctx.receiver.addCredit(1);
    });
    receiver.on(ReceiverEvents.settled, () => {
      this.logger.error(`ReceiverEvents: settled`);
    });
    receiver.on(ReceiverEvents.receiverFlow, () => {
      this.logger.error(`ReceiverEvents: receiverFlow`);
    });
    receiver.on(ReceiverEvents.receiverError, () => {
      this.logger.error(`ReceiverEvents: receiverError`);
    });
    receiver.on(ReceiverEvents.receiverDrained, () => {
      this.logger.error(`ReceiverEvents: receiverDrained`);
    });
    receiver.on(ReceiverEvents.receiverClose, () => {
      this.logger.error(`ReceiverEvents: receiverClose`);
    });
    receiver.on(ReceiverEvents.message, (ctx) => {
      this.logger.verbose(
        `${name} ${ctx.message.group_id} ${ctx.message.body}`,
      );
      setTimeout(() => {
        ctx.delivery.accept();
        this.logger.error(
          `${name} ${ctx.message.group_id} ${ctx.message.body}: Done`,
        );
        receiver.addCredit(1);
      }, 2000);
    });
    if (!receiver.hasCredit()) {
      receiver.addCredit(1);
    }
    this.logger.debug(`${name} is open: ${receiver.isOpen()}`);
  }

  public async sender(sessionProducer: Session, name: string) {
    const sender = await sessionProducer.createAwaitableSender({
      name,
      target: {
        address: `demo`,
        capabilities: ['queue'],
      },
    });
    await sender.send(this.getMessage(`${name} 1`, 'A'));
    await sender.send(this.getMessage(`${name} 2`, 'A'));
    await sender.send(this.getMessage(`${name} 3`, 'A'));
    await sender.send(this.getMessage(`${name} 4`, 'B'));
    await sender.send(this.getMessage(`${name} 5`, 'B'));
    await sender.close();
  }

  getMessage(body: string, group_id: string): Message {
    const messageId = generate_uuid();
    return {
      message_id: messageId,
      group_id,
      body: `${body}`,
      durable: true,
      group_sequence: 1024,
    };
  }
}
