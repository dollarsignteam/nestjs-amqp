import { DEFAULT_CONNECTION_NAME } from '../constants';
import { ActiveMQModuleOptions } from '../interfaces';

const defaultConnection = `${DEFAULT_CONNECTION_NAME}Connection`;

function getConnectionName(name: string): string {
  return name ? `${name}Connection` : defaultConnection;
}

export function getConnectionToken(connection?: ActiveMQModuleOptions | string): string {
  if (typeof connection === 'string') {
    return getConnectionName(connection.trim());
  }
  return getConnectionName(connection?.name?.trim());
}
