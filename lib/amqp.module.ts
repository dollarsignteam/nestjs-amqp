import { DynamicModule, Global, Inject, Module, OnModuleDestroy, OnModuleInit, Provider, Type } from '@nestjs/common';
import { MetadataScanner, ModuleRef } from '@nestjs/core';
import { Connection } from 'rhea-promise';

import { AMQP_MODULE_OPTIONS } from './constants';
import { ConsumerMetadata } from './domain';
import { ConsumerExplorer } from './explorers';
import { AMQPModuleAsyncOptions, AMQPModuleOptions, AMQPModuleOptionsFactory } from './interfaces';
import { AMQPService, ConsumerService, ProducerService } from './services';
import { getConnectionToken, getLogger } from './utils';

@Global()
@Module({
  providers: [AMQPService],
  exports: [AMQPService],
})
export class AMQPModule implements OnModuleInit, OnModuleDestroy {
  private readonly logger = getLogger(AMQPModule.name);

  constructor(
    @Inject(AMQP_MODULE_OPTIONS)
    private readonly options: AMQPModuleOptions,
    private readonly consumerService: ConsumerService,
    private readonly consumerExplorer: ConsumerExplorer,
    private readonly moduleRef: ModuleRef,
  ) {}

  public async onModuleInit(): Promise<void> {
    this.logger.log('initializing queue module');

    // find everything marked with @Listen
    const consumers = this.consumerExplorer.explore();
    await this.attachConsumers(consumers);

    // AMQPService.eventEmitter.on(AMQP_CONNECTION_RECONNECT, () => {
    //   this.logger.log('reattaching receivers to connection');
    //   this.queueService.clearSenderAndReceiverLinks();
    //   this.attachListeners(consumers)
    //     .then(() => logger.log('receivers reattached'))
    //     .catch(error => logger.error('error while reattaching consumers', error));
    // });

    this.logger.log('queue module initialized');
  }

  private async attachConsumers(consumers: Array<ConsumerMetadata>): Promise<void> {
    for (const consumer of consumers) {
      this.logger.debug(`attaching consumer for @Consumer: ${JSON.stringify(consumer)}`);

      // fetch instance from DI framework
      const target = this.moduleRef.get(consumer.targetName, { strict: false });

      await this.consumerService.consume(consumer.source, consumer.callback.bind(target), consumer.options);
    }
  }

  async onModuleDestroy(): Promise<void> {
    const connectionToken = getConnectionToken(this.options);
    try {
      const connection = this.moduleRef.get<Connection>(connectionToken);
      await connection?.close();
    } catch (error) {
      const { message } = error as Error;
      this.logger.error(`Connection error: ${connectionToken}`, message);
    }
  }

  /**
   * @param options - module options
   * @returns dynamic module
   */
  public static forRoot(options: AMQPModuleOptions = {}): DynamicModule {
    const connectionProvider = this.createConnectionProvider(options);
    const moduleOptionsProvider = this.createModuleOptionsProvider(options);
    return {
      module: AMQPModule,
      providers: [connectionProvider, moduleOptionsProvider, ProducerService, ConsumerService, MetadataScanner, ConsumerExplorer],
      exports: [connectionProvider, ProducerService, ConsumerService],
    };
  }

  /**
   * @param options - module async options
   * @returns dynamic module
   */
  public static forRootAsync(options: AMQPModuleAsyncOptions): DynamicModule {
    const connectionProvider = this.createAsyncConnectionProvider(options);
    const asyncProviders = this.createAsyncProviders(options);
    return {
      module: AMQPModule,
      providers: [connectionProvider, ...asyncProviders, ProducerService, ConsumerService, MetadataScanner, ConsumerExplorer],
      exports: [connectionProvider, ProducerService, ConsumerService],
    };
  }

  /**
   * @param options - module options
   * @returns connection provider
   */
  private static createConnectionProvider(options: AMQPModuleOptions): Provider {
    return {
      provide: getConnectionToken(options),
      useFactory: async (): Promise<Connection> => await this.createConnectionFactory(options),
    };
  }

  /**
   * @param options - module async options
   * @returns `Provider`
   */
  private static createAsyncConnectionProvider(options: AMQPModuleAsyncOptions): Provider {
    return {
      provide: getConnectionToken(options),
      useFactory: async (amqpModuleOptions: AMQPModuleOptions): Promise<Connection> => {
        if (options.name) {
          return await this.createConnectionFactory({
            ...amqpModuleOptions,
            name: options.name,
          });
        }
        return await this.createConnectionFactory(amqpModuleOptions);
      },
      inject: [AMQP_MODULE_OPTIONS],
    };
  }

  /**
   * @param options - module options
   * @returns AMQP connection
   */
  private static async createConnectionFactory(options: AMQPModuleOptions): Promise<Connection> {
    return AMQPService.createConnection(options);
  }

  /**
   * @param options - module options
   * @returns module options provider
   */
  private static createModuleOptionsProvider(options: AMQPModuleOptions): Provider {
    return {
      provide: AMQP_MODULE_OPTIONS,
      useValue: options,
    };
  }

  /**
   * @param options - module async options
   * @returns list of `Provider`
   */
  private static createAsyncProviders(options: AMQPModuleAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const useClass = options.useClass as Type<AMQPModuleOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  /**
   * @param options - module async options
   * @returns `Provider`
   */
  private static createAsyncOptionsProvider(options: AMQPModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: AMQP_MODULE_OPTIONS,
        useFactory: async (...args): Promise<AMQPModuleOptions> => {
          const amqpModuleOptions = await options.useFactory(...args);
          return {
            ...amqpModuleOptions,
            name: options.name,
          };
        },
        inject: options.inject || [],
      };
    }
    const inject = [(options.useClass || options.useExisting) as Type<AMQPModuleOptionsFactory>];
    return {
      provide: AMQP_MODULE_OPTIONS,
      useFactory: async (optionsFactory: AMQPModuleOptionsFactory): Promise<AMQPModuleOptions> => {
        const amqpModuleOptions = await optionsFactory.createAMQPModuleOptions();
        return {
          ...amqpModuleOptions,
          name: options.name,
        };
      },
      inject,
    };
  }
}
