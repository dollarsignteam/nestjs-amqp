import { Logger } from '@dollarsign/logger';
import { DynamicModule, Global, Inject, Module, Provider } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { AMQP_MODULE_OPTIONS } from './constants';
import { AMQPModuleAsyncOptions, AMQPModuleOptions } from './interfaces';
// import { Connection } from 'rhea-promise';
import { AMQPService } from './services/amqp.service';
// import { AMQPService } from './services';
import { getConnectionToken } from './utils';

@Global()
@Module({
  providers: [AMQPService],
  exports: [AMQPService],
})
export class AMQPModule {
  private readonly logger = new Logger(AMQPModule.name);

  constructor(
    @Inject(AMQP_MODULE_OPTIONS)
    private readonly options: AMQPModuleOptions,
    private readonly moduleRef: ModuleRef,
  ) {}

  /**
   * @param options - module options
   * @returns dynamic module
   */
  public static forRoot(options: AMQPModuleOptions = {}): DynamicModule {
    const moduleOptionsProvider = AMQPModule.getModuleOptionsProvider(options);
    const connectionProvider = AMQPModule.getConnectionProvider(options);
    return {
      module: AMQPModule,
      providers: [moduleOptionsProvider, connectionProvider],
    };
  }

  /**
   * @param options - module async options
   * @returns dynamic module
   */
  public static forRootAsync(options: AMQPModuleAsyncOptions): DynamicModule {
    options;
    return {
      module: AMQPModule,
    };
  }

  /**
   * @param options - module options
   * @returns module options provider
   */
  private static getModuleOptionsProvider(options: AMQPModuleOptions): Provider {
    return {
      provide: AMQP_MODULE_OPTIONS,
      useValue: options,
    };
  }

  /**
   * @param options - module options
   * @returns connection provider
   */
  private static getConnectionProvider(options: AMQPModuleOptions): Provider {
    return {
      provide: getConnectionToken(options),
      useFactory: null,
      // useFactory: async (): Promise<Connection> => await AMQPService.createConnection(options),
    };
  }
}
