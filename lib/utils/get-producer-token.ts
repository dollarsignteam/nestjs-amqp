import { getConnectionToken } from './get-connection-token';
import { getToken } from './get-token';

/**
 * @param target - target name
 * @param connectionName - connection name
 * @returns producer token
 */
export function getProducerToken(target: string, connectionName?: string): string {
  const connectionToken = getConnectionToken(connectionName);
  const targetToken = getToken(target);
  return `${targetToken}:producer:${connectionToken}`;
}
