import { z } from 'zod';

export const CONSUMER_ENV_TOKEN = Symbol('CONSUMER_ENV');
export const ConsumerEnvSchema = z.object({
  PORT: z.coerce.number(),
});

export type ConsumerEnv = z.infer<typeof ConsumerEnvSchema>;
