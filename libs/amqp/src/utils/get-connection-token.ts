import { DEFAULT_CONNECTION_NAME } from '../constants';
import { AMQPModuleOptions } from '../interfaces';

function getConnectionName(name: string): string {
  return name ? `${name}:connection`.toLowerCase().replace(/\s+/g, '-') : DEFAULT_CONNECTION_NAME;
}

export function getConnectionToken(connection?: AMQPModuleOptions | string): string {
  if (typeof connection === 'string') {
    return getConnectionName(connection.trim());
  }
  return getConnectionName(connection?.name?.trim());
}
