import { ConnectionOptions } from 'rhea-promise';

export interface AMQPModuleOptions {
  connectionOptions?: ConnectionOptions;
  connectionUri?: string;
  name?: string;
}
