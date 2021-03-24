import { Module } from '@nestjs/common';
import { ActiveMQService } from './activemq.service';

@Module({
  providers: [ActiveMQService],
  exports: [ActiveMQService],
})
export class ActiveMQModule {}
