import { RedisModule } from '@framework/redis/redis.module';
import { SECRET_TOKEN, Secret } from '../config';

export const CACHE_TOKEN = {
  PRIMARY: Symbol('PRIMARY'),
};

export const RedisConnection = () =>
  RedisModule.forRootAsync({
    provide: CACHE_TOKEN.PRIMARY,
    useFactory: (secret: Secret) => ({
      host: secret.REDIS_HOST,
      port: secret.REDIS_PORT,
    }),
    inject: [SECRET_TOKEN],
  });
