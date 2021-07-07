import { AMQPModuleOptions } from '../interfaces';
import { getToken } from './get-token';

/**
 * @param connection - connection name or module options
 * @returns connection token
 */
export function getConnectionToken(connection?: AMQPModuleOptions | string): string {
  const name = typeof connection === 'string' ? connection : connection?.name;
  const connectionName = name?.trim() || 'default';
  const nameToken = getToken(connectionName);
  return `${nameToken}:connection`;
}
