import { Inject } from '@nestjs/common';

import { getProducerToken } from '../utils';

export const Producer = (connectionName?: string): ParameterDecorator => {
  return Inject(getProducerToken(connectionName));
};
