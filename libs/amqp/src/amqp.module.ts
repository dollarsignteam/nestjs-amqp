import { DynamicModule, Global, Inject, Module, OnModuleDestroy, OnModuleInit, Provider, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Connection } from 'rhea-promise';

import { AMQP_MODULE_OPTIONS } from './constants';
import { AMQPModuleAsyncOptions, AMQPModuleOptions, AMQPModuleOptionsFactory } from './interfaces';
import { AMQPService } from './services';
import { getConnectionToken } from './utils';
import { getLogger } from './utils/get-logger';

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
    private readonly moduleRef: ModuleRef,
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.info('Initializing amqp module');
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.info('Destroying amqp module');
    const connectionToken = getConnectionToken(this.options);
    const connection = this.moduleRef.get<Connection>(connectionToken);
    try {
      await connection?.close();
    } catch (error) {
      this.logger.error(error);
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
      providers: [moduleOptionsProvider, connectionProvider],
      exports: [connectionProvider],
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
      providers: [...asyncProviders, connectionProvider],
    };
  }

  /**
   * @param options - module async options
   * @returns `Provider`
   */
  private static createAsyncConnectionProvider(options: AMQPModuleAsyncOptions): Provider {
    return {
      provide: getConnectionToken(options),
      useFactory: async (amqpModuleOptions: AMQPModuleOptions): Promise<Provider> => {
        if (options.name) {
          return this.createConnectionProvider({
            ...amqpModuleOptions,
            name: options.name,
          });
        }
        return this.createConnectionProvider(amqpModuleOptions);
      },
      inject: [AMQP_MODULE_OPTIONS],
    };
  }

  /**
   * @param options - module options
   * @returns connection provider
   */
  private static createConnectionProvider(options: AMQPModuleOptions): Provider {
    return {
      provide: getConnectionToken(options),
      useFactory: async (): Promise<Connection> => await AMQPService.createConnection(options),
    };
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
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    const inject = [(options.useClass || options.useExisting) as Type<AMQPModuleOptionsFactory>];
    return {
      provide: AMQP_MODULE_OPTIONS,
      useFactory: async (optionsFactory: AMQPModuleOptionsFactory): Promise<AMQPModuleOptions> =>
        await optionsFactory.createAMQPModuleOptions(options.name),
      inject,
    };
  }
}
