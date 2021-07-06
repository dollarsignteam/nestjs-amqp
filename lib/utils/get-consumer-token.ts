import { getConnectionToken } from './get-connection-token';

export function getConsumerToken(name?: string): string {
  const connectionToken = getConnectionToken(name);
  return `${connectionToken}:consumer`;
}
