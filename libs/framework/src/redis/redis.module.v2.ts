import {
  ConfigurableModuleBuilder,
  DynamicModule,
  InjectionToken,
  Logger,
  Module,
  Provider,
} from '@nestjs/common';
import { Redis, RedisOptions, Cluster, ClusterOptions, ClusterNode } from 'ioredis';

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');
export const REDIS_MODULE_OPTIONS = Symbol('REDIS_MODULE_OPTIONS');

export const REDIS_CLUSTER_CLIENT = Symbol('REDIS_CLUSTER_CLIENT');
export const REDIS_CLUSTER_MODULE_OPTIONS = Symbol('REDIS_CLUSTER_MODULE_OPTIONS');

interface RedisModuleExtras {
  /**
   * Injection token of the Redis client. Use distinct tokens to register multiple connections.
   */
  provide: InjectionToken;
}

interface RedisClusterOptions {
  clusterOptions: ClusterOptions;
  clusterNodes: ClusterNode[];
}

const {
  ConfigurableModuleClass: RedisConfigurableModuleClass,
  OPTIONS_TYPE: REDIS_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: REDIS_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<RedisOptions>({
  optionsInjectionToken: REDIS_MODULE_OPTIONS,
  // every call registers its own connection, never dedupe them into a single module
  alwaysTransient: true,
})
  .setClassMethodName('forRoot')
  .setExtras<RedisModuleExtras>({ provide: REDIS_CLIENT }, (definition, extras): DynamicModule => {
    const provider: Provider<Redis> = {
      provide: extras.provide,
      useFactory: (connectionOptions: RedisOptions): Redis => {
        const logger = new Logger(RedisModuleV2.name);
        const client = new Redis({ ...connectionOptions });

        const { host, port } = connectionOptions;
        client.on('ready', () => {
          logger.debug(`Connected to Redis ${extras.provide.toString()}`, { host, port });
        });
        client.on('error', (error) => {
          logger.error(`Error connecting to Redis ${extras.provide.toString()}`, {
            host,
            port,
            error,
          });
        });
        return client;
      },
      inject: [REDIS_MODULE_OPTIONS],
    };

    return {
      ...definition,
      providers: [...(definition.providers ?? []), provider],
      exports: [provider],
      global: true,
    };
  })
  .build();

const {
  ConfigurableModuleClass: RedisClusterConfigurableModuleClass,
  OPTIONS_TYPE: REDIS_CLUSTER_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: REDIS_CLUSTER_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<RedisClusterOptions>({
  optionsInjectionToken: REDIS_CLUSTER_MODULE_OPTIONS,
  // every call registers its own connection, never dedupe them into a single module
  alwaysTransient: true,
})
  .setClassMethodName('forRoot')
  .setExtras<RedisModuleExtras>(
    { provide: REDIS_CLUSTER_CLIENT },
    (definition, extras): DynamicModule => {
      const provider: Provider<Cluster> = {
        provide: extras.provide,
        useFactory: ({ clusterNodes, clusterOptions }: RedisClusterOptions): Cluster => {
          const logger = new Logger(RedisClusterModuleV2.name);
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
        inject: [REDIS_CLUSTER_MODULE_OPTIONS],
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

export type RedisModuleOptions = typeof REDIS_OPTIONS_TYPE;
export type RedisModuleAsyncOptions = typeof REDIS_ASYNC_OPTIONS_TYPE;
export type RedisClusterModuleOptions = typeof REDIS_CLUSTER_OPTIONS_TYPE;
export type RedisClusterModuleAsyncOptions = typeof REDIS_CLUSTER_ASYNC_OPTIONS_TYPE;

@Module({})
/**
 * Register a global provider for the Redis client.
 */
export class RedisModuleV2 extends RedisConfigurableModuleClass {}

@Module({})
/**
 * Register a global provider for the Redis cluster client.
 */
export class RedisClusterModuleV2 extends RedisClusterConfigurableModuleClass {}
