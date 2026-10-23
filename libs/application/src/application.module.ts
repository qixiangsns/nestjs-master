import { DynamicModule, Module } from '@nestjs/common';
import { SecretsModuleV2 } from '@framework/secret/index.js';
import { SecretSchema, SECRET_TOKEN, EnvSchema, Env, ENV_TOKEN } from './config/index.js';
import {
  RedisConnection,
  MongoDbConnection,
  PulsarConnection,
  RedisSubscriberConnection,
} from './connections/index.js';
import { LoggerModule } from 'nestjs-pino';
import { getPinoOptions } from '@framework/logger/index.js';
import { ViberModule } from './modules/viber/index.js';
import { LimiterModule } from './modules/limiter/index.js';
import { EventEmitterModule } from '@nestjs/event-emitter';

const MongoConnModules: DynamicModule[] = [MongoDbConnection()];
const RedisConnModules: DynamicModule[] = [RedisConnection(), RedisSubscriberConnection()];
const PulsarConnModules: DynamicModule[] = [PulsarConnection()];
const FeatureModules = [ViberModule, LimiterModule];

const SecretsModules: DynamicModule[] = [
  SecretsModuleV2.forRoot({
    provide: ENV_TOKEN,
    schema: EnvSchema,
    providerType: 'env',
  }),
  SecretsModuleV2.forRootAsync({
    provide: SECRET_TOKEN,
    useFactory: (env: Env) =>
      env.NODE_ENV === 'development'
        ? {
            schema: SecretSchema,
            providerType: 'env',
          }
        : {
            // schema: SecretSchema,
            // providerType: 'vault',
            // vaultToken: env.VAULT_TOKEN,
            // vaultUrl: env.VAULT_ADDR,
            // vaultPath: env.VAULT_PATH,
            schema: SecretSchema,
            providerType: 'env',
          },
    inject: [ENV_TOKEN],
  }),
];
const LoggerModules = LoggerModule.forRootAsync({
  useFactory: (env: Env) => {
    return {
      pinoHttp: getPinoOptions(env.NODE_ENV === 'production'),
      nativeLogger: {
        structuredParams: true,
        flattenParams: true,
      },
    };
  },
  inject: [ENV_TOKEN],
});

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ...SecretsModules,
    LoggerModules,
    ...MongoConnModules,
    ...RedisConnModules,
    ...PulsarConnModules,
    ...FeatureModules,
  ],
  exports: [...FeatureModules],
})
export class ApplicationModule {}
