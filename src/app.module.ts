import { AMQPModule } from '@dollarsign/nestjs-amqp';
import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // AMQPModule.forRoot({
    //   name: 'demo1',
    //   connectionOptions: {
    //     hostname: 'localhost',
    //     port: 5672,
    //     username: 'user',
    //     password: 'pass',
    //     reconnect: true,
    //   },
    // }),
    AMQPModule.forRootAsync({
      name: 'demo2',
      useFactory: () => {
        return {
          connectionOptions: {
            hostname: 'localhost',
            port: 5672,
            username: 'user',
            password: 'pass',
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
