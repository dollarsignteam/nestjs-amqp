import { Injectable } from '@nestjs/common';
import { Connection } from 'rhea-promise';

import { AMQPModuleOptions } from '../interfaces';
import { getLogger } from '../utils';

@Injectable()
export class AMQPService {
  private static readonly logger = getLogger(AMQPService.name);

  static createConnection(options: AMQPModuleOptions): Promise<Connection> {
    this.logger.debug({ options });
    return null;
  }
}
