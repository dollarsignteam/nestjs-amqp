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
    await this.recevier(sessionConsumer, 'recevier-5');
    setTimeout(async () => {
      await this.sender(sessionProducer, 'sender-1');
      await this.sender(sessionProducer, 'sender-2');
    }, 2000);
  }

  private async recevier(sessionConsumer: Session, name: string) {
    const receiver = await sessionConsumer.createReceiver({
      name,
      source: {
        address: 'demo.*',
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
      }, 2000);
    });

    this.logger.debug(`${name} is open: ${receiver.isOpen()}`);
    receiver.addCredit(1);
  }

  private async sender(sessionProducer: Session, name: string) {
    const sender = await sessionProducer.createAwaitableSender({
      name,
      target: {
        address: `demo.${name}`,
      },
    });
    await sender.send(this.getMessage(`${name}`, 'A'));
    await sender.send(this.getMessage(`${name}`, 'A'));
  }

  getMessage(body: string, group_id: string): Message {
    const message_id = generate_uuid();
    return {
      message_id,
      group_id,
      body: `${body}`,
      durable: true,
    };
  }
}
