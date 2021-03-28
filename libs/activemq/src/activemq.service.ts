import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  AwaitableSender,
  AwaitableSenderOptions,
  Connection,
  ConnectionOptions,
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
    this.logger.verbose('on module init!');
    this.connection = await this.createConnection(this.connectionOptions);
    this.logger.verbose(`connection is open: ${this.connection.isOpen()}`);
    const sessionProducer = await this.connection.createSession();
    const sessionConsumer = await this.connection.createSession();
    await this.recevier(sessionConsumer, 'recevier-1');
    await this.recevier(sessionConsumer, 'recevier-2');
    await this.recevier(sessionConsumer, 'recevier-3');
    await this.recevier(sessionConsumer, 'recevier-4');
    await this.sender(sessionProducer);
  }

  private async recevier(sessionConsumer: Session, name: string) {
    const receiver = await sessionConsumer.createReceiver({
      name,
      source: {
        address: 'demo-1',
      },
      autoaccept: false,
      credit_window: 0,
    });
    receiver.on(ReceiverEvents.message, (ctx) => {
      this.logger.debug(`${name} ${ctx.message.group_id} ${ctx.message.body}`);
      setTimeout(() => {
        ctx.delivery.accept();
        this.logger.verbose(
          `${name} ${ctx.message.group_id} ${ctx.message.body}: accept`,
        );
        receiver.addCredit(1);
      }, 3000);
    });

    this.logger.debug(`${name} is open: ${receiver.isOpen()}`);
    receiver.addCredit(1);
  }

  private async sender(sessionProducer: Session) {
    const sender = await sessionProducer.createAwaitableSender({
      name: 'sender-1',
      target: {
        address: 'demo-1',
      },
    });
    this.logger.debug(`sender is open: ${sender.isOpen()}`);
    await sender.send(this.getMessage(1, 'A'));
    await sender.send(this.getMessage(2, 'A'));
    await sender.send(this.getMessage(3, 'A'));
    await sender.send(this.getMessage(4, 'A'));
    await sender.send(this.getMessage(5, 'B'));
    await sender.send(this.getMessage(6, 'A'));
    await sender.send(this.getMessage(7, 'B'));
    await sender.send(this.getMessage(8, 'C'));
    await sender.send(this.getMessage(9, 'D'));
    await sender.send(this.getMessage(10, 'E'));
    await sender.send(this.getMessage(11, 'A'));
    await sender.send(this.getMessage(12, 'B'));
    await sender.send(this.getMessage(13, 'B'));
    await sender.send(this.getMessage(14, 'B'));
  }

  getMessage(body: number, group_id: string): Message {
    const message_id = generate_uuid();
    return {
      message_id,
      group_id,
      body: `${body}`,
      // durable: true,
    };
  }
}
