import {
  DynamicModule,
  Module,
  ModuleMetadata,
  OptionalFactoryDependency,
  Provider,
  InjectionToken,
  Logger,
} from '@nestjs/common';
import { Redis, RedisOptions, Cluster, ClusterOptions, ClusterNode } from 'ioredis';
interface RedisModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  provide: InjectionToken;
  useFactory: (...args: unknown[]) => Promise<RedisOptions> | RedisOptions;
  inject?: (InjectionToken | OptionalFactoryDependency)[];
}

interface RedisClusterOptions {
  clusterOptions: ClusterOptions;
  clusterNodes: ClusterNode[];
}

interface RedisClusterModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  provide: InjectionToken;
  useFactory: (...args: unknown[]) => Promise<RedisClusterOptions> | RedisClusterOptions;
  inject?: (InjectionToken | OptionalFactoryDependency)[];
}

@Module({})
/**
 * Register a global provider for the Redis client.
 */
export class RedisModule {
  static forRootAsync(options: RedisModuleAsyncOptions): DynamicModule {
    const provider: Provider<Redis> = {
      provide: options.provide,
      useFactory: async (...args: unknown[]): Promise<Redis> => {
        const logger = new Logger(RedisModule.name);
        const connectionOptions = await options.useFactory(...args);
        const client = new Redis({ ...connectionOptions });

        const { host, port } = connectionOptions;
        client.on('ready', () => {
          logger.debug(`Connected to Redis ${options.provide.toString()}`, { host, port });
        });
        client.on('error', (error) => {
          logger.error(`Error connecting to Redis ${options.provide.toString()}`, {
            host,
            port,
            error,
          });
        });
        return client;
      },

      inject: options.inject ?? [],
    };

    return {
      module: RedisModule,
      providers: [provider],
      exports: [provider],
      imports: options.imports ?? [],
      global: true,
    };
  }
}

@Module({})
/**
 * Register a global provider for the Redis cluster client.
 */
export class RedisClusterModule {
  static forRootAsync(options: RedisClusterModuleAsyncOptions): DynamicModule {
    const clientProvider: Provider<Cluster> = {
      provide: options.provide,
      useFactory: async (...args: unknown[]): Promise<Cluster> => {
        const logger = new Logger(RedisClusterModule.name);
        const { clusterNodes, clusterOptions } = await options.useFactory(...args);
        const client = new Cluster(clusterNodes, clusterOptions);

        client.on('ready', () => {
          logger.log(`Connected to Redis Cluster`, { clusterNodes });
        });
        client.on('error', (error) => {
          logger.error(`Error connecting to Redis Cluster`, {
            clusterNodes,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        });
        return client;
      },

      inject: options.inject ?? [],
    };

    return {
      module: RedisClusterModule,
      providers: [clientProvider],
      exports: [clientProvider],
      imports: options.imports ?? [],
      global: true,
    };
  }
}
