import { ReceiverOptions as CreateAwaitableReceiverOptions } from 'rhea-promise';

export interface CreateReceiverOptions {
  connectionToken?: string;
  credits: number;
  receiverOptions: CreateAwaitableReceiverOptions;
}
