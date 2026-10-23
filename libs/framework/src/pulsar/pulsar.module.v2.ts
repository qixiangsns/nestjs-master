import Pulsar, { type ClientConfig } from 'pulsar-client';
import {
  ConfigurableModuleBuilder,
  DynamicModule,
  InjectionToken,
  Module,
  Provider,
} from '@nestjs/common';

export const PULSAR_CLIENT = Symbol('PULSAR_CLIENT');
export const PULSAR_MODULE_OPTIONS = Symbol('PULSAR_MODULE_OPTIONS');

interface PulsarModuleExtras {
  /**
   * Injection token of the Pulsar client. Use distinct tokens to register multiple connections.
   */
  provide: InjectionToken;
}

const { ConfigurableModuleClass, OPTIONS_TYPE, ASYNC_OPTIONS_TYPE } =
  new ConfigurableModuleBuilder<ClientConfig>({
    optionsInjectionToken: PULSAR_MODULE_OPTIONS,
    // every call registers its own connection, never dedupe them into a single module
    alwaysTransient: true,
  })
    .setClassMethodName('forRoot')
    .setExtras<PulsarModuleExtras>(
      { provide: PULSAR_CLIENT },
      (definition, extras): DynamicModule => {
        const provider: Provider<Pulsar.Client> = {
          provide: extras.provide,
          useFactory: (config: ClientConfig): Pulsar.Client => new Pulsar.Client(config),
          inject: [PULSAR_MODULE_OPTIONS],
        };

        return {
          ...definition,
          providers: [...(definition.providers ?? []), provider],
          exports: [provider],
          global: true,
        };
      },
    )
    .build();

export type PulsarModuleOptions = typeof OPTIONS_TYPE;
export type PulsarModuleAsyncOptions = typeof ASYNC_OPTIONS_TYPE;

@Module({})
export class PulsarModuleV2 extends ConfigurableModuleClass {}
