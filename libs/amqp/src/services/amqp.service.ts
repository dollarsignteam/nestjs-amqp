import { Injectable } from '@nestjs/common';
import { Connection, ConnectionEvents, EventContext } from 'rhea-promise';

import { AMQPModuleOptions } from '../interfaces';
import { getConnectionToken, getLogger, parseURL } from '../utils';

@Injectable()
export class AMQPService {
  private static readonly logger = getLogger(AMQPService.name);

  public static async createConnection(options: AMQPModuleOptions): Promise<Connection> {
    const connectionToken = getConnectionToken(options);
    this.logger.info(`Connection creating: ${connectionToken}`);
    if (!options) {
      throw new Error(`Invalid connection options: ${connectionToken}`);
    }
    const { connectionUri, connectionOptions } = options;
    const connection = new Connection({
      ...(!!connectionUri ? parseURL(connectionUri) : {}),
      ...connectionOptions,
    });
    connection.on(ConnectionEvents.connectionOpen, (ctx: EventContext) => {
      this.logger.info(`Connection opened: ${connectionToken}`, ctx.connection.id);
    });
    connection.on(ConnectionEvents.connectionError, (ctx: EventContext) => {
      const error = [`Connection error: ${connectionToken}`];
      ctx.error?.message && error.push(ctx.error.message);
      this.logger.error(...error);
    });
    connection.on(ConnectionEvents.disconnected, (ctx: EventContext) => {
      const error = [`Connection closed by peer: ${connectionToken}`];
      ctx.error?.message && error.push(ctx.error.message);
      this.logger.warn(...error);
    });
    try {
      await connection.open();
    } catch (err) {
      const { message } = err as Error;
      this.logger.error(`Connection error: ${connectionToken}`, message);
    }
    return connection;
  }
}