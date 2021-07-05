import { Message } from 'rhea-promise';

export type SendOptions = Omit<Message, 'body'>;
