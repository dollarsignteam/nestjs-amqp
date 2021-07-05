import { Injectable } from '@nestjs/common';
import { Receiver } from 'rhea-promise';

import { getLogger } from '../utils';
import { AMQPService } from './amqp.service';

@Injectable()
export class ConsumerService {
  private readonly logger = getLogger(ConsumerService.name);
  private readonly receivers: Map<string, Receiver>;

  constructor(private readonly amqpService: AMQPService) {
    this.receivers = new Map<string, Receiver>();
  }
}
