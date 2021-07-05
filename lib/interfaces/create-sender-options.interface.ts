import { CreateAwaitableSenderOptions } from 'rhea-promise';

export interface CreateSenderOptions {
  connectionName?: string;
  senderOptions: CreateAwaitableSenderOptions;
}
