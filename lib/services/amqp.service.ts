import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { hostname } from 'os';
import { AwaitableSender, Connection, ConnectionEvents, Container, EventContext, Receiver, ReceiverEvents, SenderEvents } from 'rhea-promise';

import { AMQPModuleOptions, CreateReceiverOptions, CreateSenderOptions } from '../interfaces';
import { getConnectionToken, getLogger, parseURL } from '../utils';

@Injectable()
export class AMQPService {
  private static readonly logger = getLogger(AMQPService.name);

  constructor(private readonly moduleRef: ModuleRef) {}

  /**
   * @param options - module options
   * @returns connection
   */
  public static async createConnection(options: AMQPModuleOptions): Promise<Connection> {
    const connectionToken = getConnectionToken(options);
    this.logger.silly(`Connection creating: ${connectionToken}`);
    if (!options) {
      throw new Error(`Invalid connection options: ${connectionToken}`);
    }
    const { connectionUri, connectionOptions } = options;
    const container = new Container({
      id: `${connectionToken}:${hostname()}:${new Date().getTime()}`.toLowerCase(),
    });
    const connection = container.createConnection({
      ...(!!connectionUri ? parseURL(connectionUri) : {}),
      ...connectionOptions,
    });
    connection.on(ConnectionEvents.connectionOpen, (context: EventContext) => {
      this.logger.silly(`Connection opened: ${connectionToken}`, context.connection.id);
    });
    connection.on(ConnectionEvents.connectionError, (context: EventContext) => {
      const error = [`Connection error: ${connectionToken}`];
      context?.error?.message && error.push(context.error.message);
      this.logger.error(...error);
    });
    connection.on(ConnectionEvents.disconnected, (context: EventContext) => {
      const error = [`Connection closed by peer: ${connectionToken}`];
      context?.error?.message && error.push(context.error.message);
      this.logger.warn(...error);
    });
    connection.on(ConnectionEvents.connectionClose, (context: EventContext) => {
      const error = `Connection closed: ${connectionToken}`;
      if (context?.error) {
        this.logger.error(error);
      } else {
        this.logger.warn(error);
      }
    });
    try {
      await connection.open();
    } catch (err) {
      const { message } = err as Error;
      this.logger.error(`Connection open failed: ${connectionToken}`, message);
    }
    return connection;
  }

  /**
   * @param options - create sender options
   * @returns sender
   */
  public async createSender(options: CreateSenderOptions): Promise<AwaitableSender> {
    const { connectionName, senderOptions } = options;
    const connectionToken = getConnectionToken(connectionName);
    const connection = this.moduleRef.get<Connection>(connectionToken, { strict: false });
    const sender = await connection.createAwaitableSender(senderOptions);
    sender.on(SenderEvents.senderOpen, (context: EventContext) => {
      AMQPService.logger.silly(`Sender opened: ${context?.sender?.name}`);
    });
    sender.on(SenderEvents.senderClose, (context: EventContext) => {
      AMQPService.logger.warn(`Sender closed: ${context?.sender?.name}`);
    });
    sender.on(SenderEvents.senderError, (context: EventContext) => {
      AMQPService.logger.error(`Sender error: ${context?.sender?.name}`, {
        error: context?.sender?.error,
      });
    });
    sender.on(SenderEvents.senderDraining, (context: EventContext) => {
      AMQPService.logger.silly(`Sender requested to drain its credits by remote peer: ${context?.sender?.name}`);
    });
    return sender;
  }

  public async createReceiver(options: CreateReceiverOptions): Promise<Receiver> {
    const { connectionToken, credits, receiverOptions } = options;
    const connection = this.moduleRef.get<Connection>(connectionToken, { strict: false });
    const receiver = await connection.createReceiver(receiverOptions);
    receiver.addCredit(credits);
    receiver.on(ReceiverEvents.receiverOpen, (context: EventContext) => {
      AMQPService.logger.debug(`Receiver opened: ${JSON.stringify({ source: context?.receiver?.address })}`);
      const currentCredits = context.receiver.credit;
      if (currentCredits < credits) {
        AMQPService.logger.silly('Receiver does not have credits, adding credits');
        context.receiver.addCredit(credits - currentCredits);
      }
    });
    receiver.on(ReceiverEvents.receiverClose, (context: EventContext) => {
      AMQPService.logger.debug(`receiver closed: ${JSON.stringify({ queue: context?.receiver?.address })}`);
    });
    receiver.on(ReceiverEvents.receiverDrained, (context: EventContext) => {
      AMQPService.logger.debug(`remote peer for receiver drained: ${JSON.stringify({ queue: context?.receiver?.address })}`);
    });
    receiver.on(ReceiverEvents.receiverFlow, (context: EventContext) => {
      AMQPService.logger.debug(`flow event received for receiver: ${JSON.stringify({ queue: context?.receiver?.address })}`);
    });
    receiver.on(ReceiverEvents.settled, (context: EventContext) => {
      AMQPService.logger.debug(`message has been settled by remote: ${JSON.stringify({ queue: context?.receiver?.address })}`);
    });
    AMQPService.logger.silly('Receiver created', { credits: receiver?.credit, source: receiver?.source, name: receiver?.name });
    return receiver;
  }
}
