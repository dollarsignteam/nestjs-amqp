import { Injectable } from '@nestjs/common';
import { Injectable as InjectableInterface } from '@nestjs/common/interfaces';
import { MetadataScanner, ModulesContainer } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';

import { AMQP_CONSUMER_METADATA } from '../constants';
import { ConsumerMetadata } from '../domain';

@Injectable()
export class ConsumerExplorer {
  constructor(private readonly modulesContainer: ModulesContainer, private readonly metadataScanner: MetadataScanner) {}

  public explore(connectionToken: string): Array<ConsumerMetadata> {
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
    return instanceWrappers
      .filter(({ instance }) => {
        return instance && instance !== null;
      })
      .map(({ instance }) => {
        const instancePrototype = Object.getPrototypeOf(instance);
        return this.metadataScanner.scanFromPrototype(instance, instancePrototype, method =>
          this.exploreMethodMetadata(instance, instancePrototype, method, connectionToken),
        );
      })
      .reduce((prev, curr) => {
        return prev.concat(curr);
      });
  }

  private exploreMethodMetadata(
    _: unknown,
    instancePrototype: Record<string, unknown>,
    methodKey: string,
    connectionToken: string,
  ): ConsumerMetadata | null {
    const targetCallback = instancePrototype[methodKey];
    const key = `${AMQP_CONSUMER_METADATA}(${connectionToken})`;
    const handler = Reflect.getMetadata(key, targetCallback);
    if (!handler) {
      return null;
    }
    return handler;
  }
}
