import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  AwaitableSender,
  AwaitableSenderOptions,
  Connection,
  ConnectionOptions,
  Delivery,
  EventContext,
  Message,
  Receiver,
  ReceiverEvents,
  ReceiverOptions,
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

  async sendMessage() {
    const address = 'demo';
    const senderName = 'sender-1';
    const senderOptions: AwaitableSenderOptions = {
      name: senderName,
      target: { address },
    };

    const sender = await this.createSender(senderOptions);

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < 5; i++) {
      const message: Message = {
        body: `Hello World - ${i}`,
        message_id: i,
        group_id: 'DEMO',
      };
      // eslint-disable-next-line no-await-in-loop
      const delivery: Delivery = await sender.send(message);
      this.logger.verbose(
        `[${this.connection.id}] await sendMessage -> Delivery id: ${delivery.id}, settled: ${delivery.settled}`,
      );
    }
    await sender.close();
    this.logger.debug('sendMessage: end');
  }

  async receiveMessage(name: string) {
    const address = 'demo';
    const receiverName = name;
    const receiverOptions: ReceiverOptions = {
      name: receiverName,
      source: { address },
      // onMessage: async (ctx) => {
      //   this.logger.debug(`message ${name}: ${ctx.message.message_id}`);
      //   await delay(5000);
      //   ctx.delivery.reject();
      // },
      // onSettled: (ctx) => {
      //   this.logger.debug(ctx);
      // },
      // onError: (ctx) => {
      //   this.logger.error(ctx.error);
      // },
    };
    const receiver = await this.createReceiver(receiverOptions);
    receiver.on(ReceiverEvents.message, async (context: EventContext) => {
      this.logger.verbose(
        `ReceiverEvents, ${name}: ${context.message.message_id} begin`,
      );
      await new Promise((r) => setTimeout(r, 2000));
      this.logger.debug(
        `ReceiverEvents, ${name}: ${context.message.message_id} end`,
      );
    });
    this.logger.debug(`receiveMessage ${name}: init`);
  }

  async onModuleInit() {
    this.connection = await this.createConnection(this.connectionOptions);
    await this.receiveMessage('received-1');
    await this.receiveMessage('received-2');
    await this.sendMessage();

    // this.connection.on('error', (err) => {
    //   const payload = JSON.stringify(err);
    //   this.logger.error(`❌ Event[error] ${payload}`);
    // });

    // this.connection.on('connection_error', (ctx) => {
    //   if (ctx.error) {
    //     const payload = JSON.stringify(ctx.error);
    //     this.logger.error(`❌ Event[connection_error] ${payload}`);
    //   }
    // });

    // this.connection.on('protocol_error', (err) => {
    //   this.logger.error(`❌ Event[protocol_error] ${err}`);
    // });

    // this.connection.on('disconnected', (ctx) => {
    //   if (ctx.error) {
    //     this.logger.warn(`⚠️ Event[disconnected] ${ctx.error}`);
    //   }
    // });

    // this.connection.on('message', (context) => {
    //   this.logger.log(context.message.body);
    // });

    // this.connection.once('sendable', (context) => {
    //   context.sender.send({ body: 'Hello World!' });
    // });

    // this.connection.open_receiver('demo');
    // this.connection.open_sender('demo');
  }
}
