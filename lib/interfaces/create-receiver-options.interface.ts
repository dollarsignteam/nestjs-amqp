import { ReceiverOptions as CreateAwaitableReceiverOptions } from 'rhea-promise';

export interface CreateReceiverOptions {
  connectionName?: string;
  credits: number;
  receiverOptions: CreateAwaitableReceiverOptions;
}
