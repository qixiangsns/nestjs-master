import { RedisModuleV2 } from '@framework/redis/index.js';
import { SECRET_TOKEN, Secret } from '../config/index.js';

export const REDIS_TOKEN = {
  PRIMARY: Symbol('REDIS_CONN'),
} as const satisfies Record<string, symbol>;

export const REDIS_SUBSCRIBER_TOKEN = {
  PRIMARY: Symbol('REDIS_SUBSCRIBER_CONN'),
} as const satisfies Record<string, symbol>;

export const RedisConnection = () =>
  RedisModuleV2.forRootAsync({
    provide: REDIS_TOKEN.PRIMARY,
    useFactory: (secret: Secret) => ({
      host: secret.REDIS_HOST,
      port: secret.REDIS_PORT,
    }),
    inject: [SECRET_TOKEN],
  });

export const RedisSubscriberConnection = () =>
  RedisModuleV2.forRootAsync({
    provide: REDIS_SUBSCRIBER_TOKEN.PRIMARY,
    useFactory: (secret: Secret) => ({
      host: secret.REDIS_HOST,
      port: secret.REDIS_PORT,
    }),
    inject: [SECRET_TOKEN],
  });
