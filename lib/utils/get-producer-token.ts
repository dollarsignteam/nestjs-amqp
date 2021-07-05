import { getConnectionToken } from './get-connection-token';

export function getProducerToken(name?: string): string {
  const connectionToken = getConnectionToken(name);
  return `${connectionToken}:producer`;
}
