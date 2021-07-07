import { getConnectionToken } from './get-connection-token';

/**
 * @param connectionName - connection name
 * @returns producer token
 */
export function getProducerToken(connectionName?: string): string {
  const connectionToken = getConnectionToken(connectionName);
  return `producer:${connectionToken}`;
}
