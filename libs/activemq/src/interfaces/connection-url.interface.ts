import { ConnectionOptions } from 'rhea-promise';

export type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];

export type AMQPTransport = PropType<ConnectionOptions, 'transport'>;

export interface ConnectionURL {
  host: string;
  password: string;
  port: number;
  transport: AMQPTransport;
  username: string;
}
