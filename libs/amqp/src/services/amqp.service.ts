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
      const error = [`Connection closed: ${connectionToken}`];
      if (context?.error) {
        this.logger.error(...error);
      } else {
        this.logger.warn(...error);
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
}
