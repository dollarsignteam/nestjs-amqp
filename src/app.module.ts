import { AMQPModule } from '@dollarsign/nestjs-amqp';
import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    AMQPModule.forRoot({
      connectionUri: 'amqp://admin:admin@localhost:5671',
    }),
    AMQPModule.forRootAsync({
      name: 'custom',
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
