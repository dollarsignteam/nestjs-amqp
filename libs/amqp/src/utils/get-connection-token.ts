import { DEFAULT_CONNECTION_NAME } from '../constants';
import { ActiveMQModuleOptions } from '../interfaces';

const defaultConnection = `${DEFAULT_CONNECTION_NAME}_CONNECTION`;

function getConnectionName(name: string): string {
  return name ? `${name}_CONNECTION`.toUpperCase() : defaultConnection;
}

export function getConnectionToken(connection?: ActiveMQModuleOptions | string): string {
  if (typeof connection === 'string') {
    return getConnectionName(connection.trim());
  }
  return getConnectionName(connection?.name?.trim());
}
