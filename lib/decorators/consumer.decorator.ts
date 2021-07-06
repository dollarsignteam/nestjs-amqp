import { SetMetadata } from '@nestjs/common';

import { AMQP_CONSUMER_METADATA } from '../constants';
import { ConsumerMetadata } from '../domain';
import { ConsumerOptions } from '../interfaces';

export const Consumer = (source: string, options?: ConsumerOptions) => {
  return (target: unknown, propertyKey: string, descriptor: PropertyDescriptor): void => {
    const metadata = new ConsumerMetadata();
    metadata.source = source;
    metadata.options = options;
    metadata.targetName = target.constructor.name;
    metadata.callback = descriptor.value;
    metadata.callbackName = propertyKey;
    SetMetadata<string, ConsumerMetadata>(AMQP_CONSUMER_METADATA, metadata)(target, propertyKey, descriptor);
  };
};
