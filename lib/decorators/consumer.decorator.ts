import { SetMetadata } from '@nestjs/common';

import { AMQP_CONSUMER_METADATA } from '../constants';
import { ConsumerMetadata } from '../domain';
import { ConsumerOptions } from '../interfaces';
import { getConnectionToken } from '../utils/get-connection-token';

export const Consumer = (source: string, options?: ConsumerOptions) => {
  return (target: unknown, propertyKey: string, descriptor: PropertyDescriptor): void => {
    const metadata = new ConsumerMetadata();
    metadata.source = source;
    metadata.options = options;
    metadata.targetName = target.constructor.name;
    metadata.callback = descriptor.value;
    metadata.callbackName = propertyKey;
    const connectionToken = getConnectionToken(options?.connectionName);
    const key = `${AMQP_CONSUMER_METADATA}(${connectionToken})`;
    SetMetadata<string, ConsumerMetadata>(key, metadata)(target, propertyKey, descriptor);
  };
};
