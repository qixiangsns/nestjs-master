import { RedisModule } from '@framework/redis/redis.module';
import { SECRET_TOKEN, Secret } from '../config';

export const REDIS_TOKEN = {
  PRIMARY: Symbol('REDIS_PRIMARY_CONN'),
} as const satisfies Record<string, Symbol>;

export const REDIS_SUBSCRIBER_TOKEN = {
  PRIMARY: Symbol('REDIS_PRIMARY_SUBSCRIBER_CONN'),
} as const satisfies Record<string, Symbol>;

export const RedisConnection = () =>
  RedisModule.forRootAsync({
    provide: REDIS_TOKEN.PRIMARY,
    useFactory: (secret: Secret) => ({
      host: secret.REDIS_HOST,
      port: secret.REDIS_PORT,
    }),
    inject: [SECRET_TOKEN],
  });

export const RedisSubscriberConnection = () =>
  RedisModule.forRootAsync({
    provide: REDIS_SUBSCRIBER_TOKEN.PRIMARY,
    useFactory: (secret: Secret) => ({
      host: secret.REDIS_HOST,
      port: secret.REDIS_PORT,
    }),
    inject: [SECRET_TOKEN],
  });
