import { Message } from 'rhea-promise';

export interface SendOptions extends Omit<Message, 'body'> {
  connectionName?: string;
}
