import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { hostname } from 'os';
import { AwaitableSender, Connection, ConnectionEvents, Container, CreateAwaitableSenderOptions, EventContext, SenderEvents } from 'rhea-promise';

import { AMQPModuleOptions } from '../interfaces';
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
    this.logger.info(`Connection creating: ${connectionToken}`);
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
      this.logger.info(`Connection opened: ${connectionToken}`, context.connection.id);
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
   * @param options - sender options
   * @param connectionName - connection name
   * @returns sender
   */
  public async createSender(options: CreateAwaitableSenderOptions, connectionName?: string): Promise<AwaitableSender> {
    const connectionToken = getConnectionToken(connectionName);
    const connection = this.moduleRef.get<Connection>(connectionToken);
    const sender = await connection.createAwaitableSender(options);
    sender.on(SenderEvents.senderOpen, (context: EventContext) => {
      AMQPService.logger.info(`Sender opened: ${connectionToken}`, context.sender.address);
    });
    sender.on(SenderEvents.senderClose, (context: EventContext) => {
      AMQPService.logger.warn(`Sender closed: ${connectionToken}`, context.sender.address);
    });
    sender.on(SenderEvents.senderError, (context: EventContext) => {
      AMQPService.logger.error(`Sender errored: ${connectionToken}`, {
        name: context.sender.address,
        error: context.sender.error,
      });
    });
    sender.on(SenderEvents.senderDraining, (context: EventContext) => {
      AMQPService.logger.log(`Sender requested to drain its credits by remote peer: ${connectionToken}`, context.sender.address);
    });
    return sender;
  }
}
