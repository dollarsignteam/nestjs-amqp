import { AMQPModule } from '@dollarsign/nestjs-amqp';
import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [AMQPModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
