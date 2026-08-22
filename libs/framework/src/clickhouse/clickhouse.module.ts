import {
  DynamicModule,
  Module,
  ModuleMetadata,
  Provider,
  InjectionToken,
  OptionalFactoryDependency,
  Logger,
} from '@nestjs/common';
import { ClickHouseClient, createClient } from '@clickhouse/client';
import { NodeClickHouseClientConfigOptions } from '@clickhouse/client/dist/config';

interface ClickhouseModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  provide: symbol | string;
  useFactory?: (
    ...args: unknown[]
  ) =>
    | Promise<NodeClickHouseClientConfigOptions>
    | NodeClickHouseClientConfigOptions;
  inject?: (InjectionToken | OptionalFactoryDependency)[];
}

@Module({})
export class ClickhouseModule {
  static forRootAsync(options: ClickhouseModuleAsyncOptions): DynamicModule {
    const provider: Provider<ClickHouseClient> = {
      provide: options.provide,
      useFactory: async (...args: unknown[]): Promise<ClickHouseClient> => {
        const logger = new Logger(ClickhouseModule.name);
        const connectionOptions = await options.useFactory?.(...args);
        const client = createClient(connectionOptions);

        logger.debug(
          { url: connectionOptions?.url },
          `Connecting to Clickhouse ${options.provide.toString()}`,
        );

        client
          .ping()
          .then(() => {
            logger.log(
              { url: connectionOptions?.url },
              `Connected to Clickhouse ${options.provide.toString()}`,
            );
          })
          .catch((error) => {
            logger.error(
              {
                url: connectionOptions?.url,
                error: error instanceof Error ? error.message : 'Unknown error',
              },
              `Error connecting to Clickhouse`,
            );
          });

        return client;
      },
      inject: options.inject ?? [],
    };

    return {
      module: ClickhouseModule,
      providers: [provider],
      exports: [provider],
      imports: options.imports ?? [],
      global: true,
    };
  }
}
