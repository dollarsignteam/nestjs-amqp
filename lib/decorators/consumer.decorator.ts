import { SetMetadata } from '@nestjs/common';

import { AMQP_CONSUMER_METADATA } from '../constants';
import { ConsumerMetadata } from '../domain';
import { ConsumerOptions } from '../interfaces';
import { getConnectionToken, getConsumerToken } from '../utils';

export const Consumer = (source: string, options?: ConsumerOptions) => {
  return (target: unknown, propertyKey: string, descriptor: PropertyDescriptor): void => {
    const metadata = new ConsumerMetadata();
    metadata.source = source;
    metadata.options = options;
    metadata.callbackName = propertyKey;
    metadata.callback = descriptor.value;
    metadata.target = target.constructor;
    metadata.targetName = target.constructor.name;
    metadata.connectionToken = getConnectionToken(options?.connectionName);
    metadata.consumerToken = getConsumerToken(source, options?.connectionName);
    SetMetadata<string, ConsumerMetadata>(AMQP_CONSUMER_METADATA, metadata)(target, propertyKey, descriptor);
  };
};
