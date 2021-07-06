import { ConsumerOptions } from '../interfaces';

export class ConsumerMetadata {
  public callback: () => unknown;
  public callbackName: string;
  public source: string;
  public options: ConsumerOptions;
  public targetName: string;
}
