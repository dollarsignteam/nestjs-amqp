import { Injectable } from '@nestjs/common';
import { Injectable as InjectableInterface, OnModuleInit } from '@nestjs/common/interfaces';
import { MetadataScanner, ModulesContainer } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';

import { getLogger } from '../utils';

export const QUEUE_LISTEN_METADATA_KEY = 'queue-listener';

@Injectable()
export class ProducerExplorer implements OnModuleInit {
  private readonly logger = getLogger(ProducerExplorer.name);

  constructor(private readonly modulesContainer: ModulesContainer, private readonly metadataScanner: MetadataScanner) {}

  onModuleInit(): void {
    this.logger.debug('INIT');
    this.explore();
  }

  public explore<T>(): unknown {
    const modules = [...this.modulesContainer.values()];
    const providersMap = modules.filter(({ providers }) => providers.size > 0).map(({ providers }) => providers);

    const instanceWrappers: Array<InstanceWrapper<InjectableInterface>> = [];
    providersMap.forEach(map => {
      const mapKeys = [...map.keys()];
      instanceWrappers.push(
        ...mapKeys.map(key => {
          return map.get(key);
        }),
      );
    });

    console.log(instanceWrappers);
    return instanceWrappers
      .filter(({ instance }) => {
        return instance && instance !== null;
      })
      .map(({ instance }) => {
        const instancePrototype = Object.getPrototypeOf(instance);

        return this.metadataScanner.scanFromPrototype(instance, instancePrototype, method =>
          this.exploreMethodMetadata<T>(instance, instancePrototype, method),
        );
      })
      .reduce((prev, curr) => {
        return prev.concat(curr);
      });
  }

  private exploreMethodMetadata<T>(_: unknown, instancePrototype: Record<string, unknown>, methodKey: string): unknown | null {
    const targetCallback = instancePrototype[methodKey];
    const handler = Reflect.getMetadata('queue-listener', targetCallback);

    if (!handler) {
      return null;
    }

    return handler;
  }
}
