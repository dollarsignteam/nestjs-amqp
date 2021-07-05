import { FactoryProvider, ModuleMetadata, Type } from '@nestjs/common';

import { AMQPModuleOptions } from './amqp-module-options.interface';

export interface AMQPModuleOptionsFactory {
  createAMQPModuleOptions(): Promise<AMQPModuleOptions> | AMQPModuleOptions;
}

export interface AMQPModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'>, Pick<FactoryProvider, 'inject'> {
  name?: string;
  useClass?: Type<AMQPModuleOptionsFactory>;
  useExisting?: Type<AMQPModuleOptionsFactory>;
  useFactory?: (...args: unknown[]) => Promise<AMQPModuleOptions> | AMQPModuleOptions;
}
