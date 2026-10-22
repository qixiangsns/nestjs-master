import { z } from 'zod';

export const ENV_TOKEN = Symbol('ENV_TOKEN');
export const EnvSchema = z.object({
  PORT: z.coerce.number(),
});

export type Env = z.infer<typeof EnvSchema>;
