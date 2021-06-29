import { DynamicModule, Module, Provider } from '@nestjs/common';

import { ActiveMQService } from './activemq.service';
import { ACTIVEMQ_MODULE_OPTIONS } from './constants';
import { ActiveMQModuleAsyncOptions, ActiveMQModuleOptions } from './interfaces';
import { getConnectionToken } from './utils';

@Module({
  providers: [ActiveMQService],
  exports: [ActiveMQService],
})
export class ActiveMQModule {
  /**
   * @param options - module options
   * @returns dynamic module
   */
  public static forRoot(options: ActiveMQModuleOptions = {}): DynamicModule {
    const moduleOptionsProvider = ActiveMQModule.getModuleOptionsProvider(options);
    const connectionProvider = ActiveMQModule.getConnectionProvider(options);
    return {
      module: ActiveMQModule,
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
      // useFactory: async () => await this.createConnectionFactory(options),
    };
  }
}
