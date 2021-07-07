import { getConnectionToken } from './get-connection-token';
import { getToken } from './get-token';

/**
 * @param source - source name
 * @param connectionName - connection name
 * @returns consumer token
 */
export function getConsumerToken(source: string, connectionName?: string): string {
  const connectionToken = getConnectionToken(connectionName);
  const sourceToken = getToken(source);
  return `${sourceToken}:consumer:${connectionToken}`;
}
