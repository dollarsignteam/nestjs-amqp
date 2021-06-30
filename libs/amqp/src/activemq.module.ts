import { Logger } from '@dollarsign/logger';
import { DynamicModule, Global, Inject, Module, Provider } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

// import { Connection } from 'rhea-promise';
import { ActiveMQService } from './activemq.service';
import { ACTIVEMQ_MODULE_OPTIONS } from './constants';
import { ActiveMQModuleAsyncOptions, ActiveMQModuleOptions } from './interfaces';
// import { AMQPService } from './services';
import { getConnectionToken } from './utils';

@Global()
@Module({
  providers: [ActiveMQService],
  exports: [ActiveMQService],
})
export class ActiveMQModule {
  private readonly logger = new Logger(ActiveMQModule.name);

  constructor(
    @Inject(ACTIVEMQ_MODULE_OPTIONS)
    private readonly options: ActiveMQModuleOptions,
    private readonly moduleRef: ModuleRef,
  ) {}

  /**
   * @param options - module options
   * @returns dynamic module
   */
  public static forRoot(options: ActiveMQModuleOptions = {}): DynamicModule {
    const moduleOptionsProvider = ActiveMQModule.getModuleOptionsProvider(options);
    const connectionProvider = ActiveMQModule.getConnectionProvider(options);
    return {
      module: ActiveMQModule,
      providers: [moduleOptionsProvider, connectionProvider],
    };
  }

  /**
   * @param options - module async options
   * @returns dynamic module
   */
  public static forRootAsync(options: ActiveMQModuleAsyncOptions): DynamicModule {
    options;
    return {
      module: ActiveMQModule,
    };
  }

  /**
   * @param options - module options
   * @returns module options provider
   */
  private static getModuleOptionsProvider(options: ActiveMQModuleOptions): Provider {
    return {
      provide: ACTIVEMQ_MODULE_OPTIONS,
      useValue: options,
    };
  }

  /**
   * @param options - module options
   * @returns connection provider
   */
  private static getConnectionProvider(options: ActiveMQModuleOptions): Provider {
    return {
      provide: getConnectionToken(options),
      useFactory: null,
      // useFactory: async (): Promise<Connection> => await AMQPService.createConnection(options),
    };
  }
}
