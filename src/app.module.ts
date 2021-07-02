import { AMQPModule } from '@dollarsign/nestjs-amqp';
import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    AMQPModule.forRoot({
      name: 'amqp1',
      connectionOptions: {
        hostname: 'localhost',
        port: 5671,
        username: 'admin',
        password: 'admin',
        reconnect: true,
      },
    }),
    AMQPModule.forRootAsync({
      name: 'amqp2',
      useFactory: () => {
        return {
          connectionOptions: {
            hostname: 'localhost',
            port: 5672,
            username: 'admin',
            password: 'admin',
            reconnect: true,
          },
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
