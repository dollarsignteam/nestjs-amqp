import { ConnectionOptions } from 'rhea-promise';

export interface ActiveMQModuleOptions {
  connectionOptions?: ConnectionOptions;
  connectionUri?: string;
  name?: string;
}
