import { AMQPModule } from '@dollarsign/nestjs-amqp';
import { Module } from '@nestjs/common';

import { AMQPDemoService } from '../libs/amqp/src/services/amqp.demo.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    AMQPModule.forRoot({
      name: 'demo1',
      connectionOptions: {
        hostname: 'localhost',
        port: 5672,
        username: 'user',
        password: 'pass',
        reconnect: true,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
