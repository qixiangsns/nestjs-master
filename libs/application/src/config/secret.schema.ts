import { z } from 'zod';

export const SECRET_TOKEN = Symbol('SECRET_TOKEN');

export const SecretSchema = z.object({
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
  MONGO_DB_URL: z.string(),
  PULSAR_URL: z.string(),
  PULSAR_TOKEN: z.string(),
  CLICKHOUSE_URL: z.url(), // https[s]://[username]:[password]@[host]:[port]
});

export type Secret = z.infer<typeof SecretSchema>;
