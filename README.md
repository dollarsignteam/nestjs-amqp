# NestJS AMQP 1.0

AMQP 1.0 module for [Nest][5]

[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/dollarsignteam/nestjs-amqp/Node.js%20Package?logo=github)][1]
[![npm (scoped)](https://img.shields.io/npm/v/@dollarsign/nestjs-amqp?logo=npm)][2]
[![GitHub license](https://img.shields.io/github/license/dollarsignteam/nestjs-amqp)][3]

It is based on the [rhea-promise][6] package and inspired by [nest-amqp][7] package.

## Features

- Multiple connection
- Multiple consumer
- Concurrency

## Installation

### Yarn

```bash
yarn add @dollarsign/nestjs-amqp
```

### NPM

```bash
npm install --save @dollarsign/nestjs-amqp
```

## Usage

### Connection URI

```text
protocol://[username:password@]host:port
```

### Create connection

```typescript
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
```

### Lifecycle hook `enableShutdownHooks` method

```typescript
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger });
  const port = process.env.APP_PORT || 3000;
  app.enableShutdownHooks();
  await app.listen(port);
}
```

### Send and Receive message

```typescript
import { Logger } from '@dollarsign/logger';
import { Consumer, MessageControl, ProducerService, SendOptions } from '@dollarsign/nestjs-amqp';
import { delay } from '@dollarsign/utils';
import { Injectable } from '@nestjs/common';

import { SimpleMessage } from './interfaces';

@Injectable()
export class AppService {
  private readonly delayTime = 2000;
  private readonly logger = new Logger({
    name: AppService.name,
    displayFilePath: false,
  });

  constructor(private readonly producer: ProducerService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async sendMessage(): Promise<string> {
    const body = { timestamp: new Date().toISOString() };
    const result = await this.producer.send<SimpleMessage>('demo1', body);
    const status = result.status ? 'success' : 'failed';
    return `Send to demo1 of default connection: ${status}`;
  }

  getRandomGroupId(): string {
    const index = Math.floor(Math.random() * 100) % 2;
    const groups = ['GroupA', 'GroupB'];
    return groups[index];
  }

  async sendMessageWithOptions(): Promise<string> {
    const messageId = new Date().getTime();
    const groupId = this.getRandomGroupId();
    const options: SendOptions = {
      connectionName: 'custom',
      group_id: groupId,
      correlation_id: `GROUP:${groupId}`,
      message_id: messageId,
      message_annotations: {
        JMSMessageID: 'A',
      },
    };
    const body = { timestamp: new Date().toISOString() };
    const result = await this.producer.send<SimpleMessage>('demo2', body, options);
    const status = result.status ? 'success' : 'failed';
    return `Send to demo2 of custom connection: ${status}`;
  }

  async sendError(): Promise<string> {
    const message = { timestamp: new Date().toISOString() };
    const result = await this.producer.send<SimpleMessage>('demo3', message);
    const status = result.status ? 'success' : 'failed';
    return `Send to demo3 of default connection: ${status}`;
  }

  @Consumer('demo1')
  async receiveMessage(body: SimpleMessage): Promise<void> {
    this.logger.info('Received from demo1', body);
    await delay(this.delayTime);
  }

  @Consumer('demo2', { connectionName: 'custom', concurrency: 2 })
  async receiveMessageWithOptions(body: SimpleMessage, control: MessageControl): Promise<void> {
    const { message_id, group_id } = control.message;
    this.logger.info(`Received from demo2 id: ${message_id}, ${group_id}`, body);
    await delay(this.delayTime);
    control.accept();
  }

  @Consumer('demo3')
  async receiveError(body: SimpleMessage): Promise<void> {
    this.logger.info('Received from demo3', body);
    await delay(this.delayTime);
    throw new Error(`Created at ${body.timestamp}`);
  }
}
```

### Consumer options

```typescript
export interface ConsumerOptions {
  // consumer count
  concurrency?: number;
  // connection name
  connectionName?: string;
  // number of messages to be processed at one time of each consumer
  parallelMessageProcessing?: number;
}
```

### Message control

```typescript
// accept the message
control.accept();

// reject the message
control.reject('Processing failed');

// release the message
control.release();

// get context
const context = control.context;

// get message
const context = control.message;
```

## Contributing

Contributions welcome! See [Contributing][4].

## Author

Dollarsign

## License

Licensed under the MIT License - see the [LICENSE][3] file for details.

[1]: https://github.com/dollarsignteam/nestjs-amqp
[2]: https://www.npmjs.com/package/@dollarsign/nestjs-amqp
[3]: https://github.com/dollarsignteam/nestjs-amqp/blob/main/LICENSE
[4]: https://github.com/dollarsignteam/nestjs-amqp/blob/main/CONTRIBUTING.md
[5]: https://github.com/nestjs/nest
[6]: https://www.npmjs.com/package/rhea-promise
[7]: https://github.com/team-supercharge/nest-amqp
