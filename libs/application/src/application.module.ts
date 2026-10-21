import { DynamicModule, Module } from '@nestjs/common';
import { SecretsModule } from '@framework/secret';
import { SecretSchema, SECRET_TOKEN, EnvSchema, Env, ENV_TOKEN } from './config';
import { RedisConnection, MongoDbConnection, PulsarConnection, RedisSubscriberConnection } from './connections';
import { LoggerModule } from 'nestjs-pino';
import { getPinoOptions } from '@framework/logger';
import { ViberModule } from './modules/viber';
import { LimiterModule } from './modules/limiter';
import { EventEmitterModule } from '@nestjs/event-emitter';

const MongoConnModules: DynamicModule[] = [MongoDbConnection()];
const RedisConnModules: DynamicModule[] = [RedisConnection(), RedisSubscriberConnection()];
const PulsarConnModules: DynamicModule[] = [PulsarConnection()];
const FeatureModules = [ViberModule, LimiterModule];

const SecretsModules: DynamicModule[] = [
  SecretsModule.forRoot([
    {
      provide: ENV_TOKEN,
      schema: EnvSchema,
      providerType: 'env',
    },
  ]),
  SecretsModule.forRootAsync([
    {
      provide: SECRET_TOKEN,
      schema: SecretSchema,
      useFactory: (env: Env) => ({
        ...(env.NODE_ENV === 'development'
          ? { providerType: 'env' }
          : {
              providerType: 'vault',
              vaultToken: env.VAULT_TOKEN,
              vaultUrl: env.VAULT_ADDR,
              vaultPath: env.VAULT_PATH,
            }),
      }),
      inject: [ENV_TOKEN],
    },
  ]),
];
const LoggerModules = [
  LoggerModule.forRootAsync({
    useFactory: (env: Env) => ({
      pinoHttp: getPinoOptions(env.NODE_ENV === 'production'),
    }),
    inject: [ENV_TOKEN],
  }),
];

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ...SecretsModules,
    ...LoggerModules,
    ...MongoConnModules,
    ...RedisConnModules,
    ...PulsarConnModules,
    ...FeatureModules,
  ],
  exports: [...FeatureModules],
})
export class ApplicationModule {}
