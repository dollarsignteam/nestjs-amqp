import { DynamicModule, Global, Inject, Module, OnModuleDestroy, OnModuleInit, Provider, Type } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, ModuleRef } from '@nestjs/core';
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
  private readonly connectionToken: string;

  constructor(
    @Inject(AMQP_MODULE_OPTIONS)
    private readonly options: AMQPModuleOptions,
    private readonly consumerService: ConsumerService,
    private readonly consumerExplorer: ConsumerExplorer,
    private readonly moduleRef: ModuleRef,
  ) {
    this.connectionToken = getConnectionToken(this.options);
  }

  public async onModuleInit(): Promise<void> {
    const consumers = this.consumerExplorer.explore(this.connectionToken);
    await this.attachConsumers(consumers);
  }

  private async attachConsumers(consumers: Array<ConsumerMetadata>): Promise<void> {
    for (const consumer of consumers) {
      const { source, callbackName, targetName, callback, options } = consumer;
      this.logger.silly(`Attaching @Consumer(${source}): ${callbackName}`);
      const target = this.moduleRef.get(targetName, { strict: false });
      await this.consumerService.consume(source, callback.bind(target), options);
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      const connection = this.moduleRef.get<Connection>(this.connectionToken);
      await connection?.close();
    } catch (error) {
      const { message } = error as Error;
      this.logger.error(`Connection error: ${this.connectionToken}`, message);
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
      providers: [connectionProvider, moduleOptionsProvider, ProducerService, ConsumerService, ConsumerExplorer, DiscoveryService, MetadataScanner],
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
      providers: [connectionProvider, ...asyncProviders, ProducerService, ConsumerService, ConsumerExplorer, DiscoveryService, MetadataScanner],
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
