import {
  ConfigurableModuleBuilder,
  DynamicModule,
  InjectionToken,
  Logger,
  Module,
  Provider,
} from '@nestjs/common';
import { ClickHouseClient, ClickHouseClientConfigOptions, createClient } from '@clickhouse/client';

export const CLICKHOUSE_CLIENT = Symbol('CLICKHOUSE_CLIENT');
export const CLICKHOUSE_MODULE_OPTIONS = Symbol('CLICKHOUSE_MODULE_OPTIONS');

// named wrapper, the TLS types inside the client config are not exported and cannot be emitted
export interface ClickhouseClientConfig extends ClickHouseClientConfigOptions {}

interface ClickhouseModuleExtras {
  /**
   * Injection token of the Clickhouse client. Use distinct tokens to register multiple connections.
   */
  provide: InjectionToken;
}

const { ConfigurableModuleClass, OPTIONS_TYPE, ASYNC_OPTIONS_TYPE } =
  new ConfigurableModuleBuilder<ClickhouseClientConfig>({
    optionsInjectionToken: CLICKHOUSE_MODULE_OPTIONS,
    // every call registers its own connection, never dedupe them into a single module
    alwaysTransient: true,
  })
    .setClassMethodName('forRoot')
    .setExtras<ClickhouseModuleExtras>(
      { provide: CLICKHOUSE_CLIENT },
      (definition, extras): DynamicModule => {
        const provider: Provider<ClickHouseClient> = {
          provide: extras.provide,
          useFactory: (connectionOptions: ClickhouseClientConfig): ClickHouseClient => {
            const logger = new Logger(ClickhouseModuleV2.name);
            const client = createClient(connectionOptions);

            logger.debug(`Connecting to Clickhouse ${extras.provide.toString()}`, {
              url: connectionOptions.url,
            });

            client
              .ping()
              .then(() => {
                logger.log(`Connected to Clickhouse ${extras.provide.toString()}`, {
                  url: connectionOptions.url,
                });
              })
              .catch((error) => {
                logger.error(
                  `Error connecting to Clickhouse`,
                  { url: connectionOptions.url },
                  error,
                );
              });

            return client;
          },
          inject: [CLICKHOUSE_MODULE_OPTIONS],
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

export type ClickhouseModuleOptions = typeof OPTIONS_TYPE;
export type ClickhouseModuleAsyncOptions = typeof ASYNC_OPTIONS_TYPE;

@Module({})
export class ClickhouseModuleV2 extends ConfigurableModuleClass {}
