import { FactoryProvider, ModuleMetadata, Type } from '@nestjs/common';

import { ActiveMQModuleOptions } from './activemq-module-options.interface';

export interface ActiveMQModuleOptionsFactory {
  createActiveMQModuleOptions(): Promise<ActiveMQModuleOptions> | ActiveMQModuleOptions;
}

export interface ActiveMQModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'>, Pick<FactoryProvider, 'inject'> {
  name?: string;
  useClass?: Type<ActiveMQModuleOptionsFactory>;
  useExisting?: Type<ActiveMQModuleOptionsFactory>;
  useFactory?: (...args: unknown[]) => Promise<ActiveMQModuleOptions> | ActiveMQModuleOptions;
}
