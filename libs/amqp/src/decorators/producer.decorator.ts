import { Inject } from '@nestjs/common';

import { AMQPModule } from '../amqp.module';
import { getProducerToken } from '../utils';

/**
 * @param name - connection name
 * @returns `ParameterDecorator`
 */
export const Producer = (name?: string): ParameterDecorator => {
  const token = getProducerToken(name);
  if (!AMQPModule.producerTokens.includes(token)) {
    AMQPModule.producerTokens.push(token);
  }
  return Inject(token);
};
