import { z } from 'zod';

export const ENV_TOKEN = Symbol('ENV_TOKEN');

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']),
  VAULT_TOKEN: z.string(),
  VAULT_ADDR: z.string(),
  VAULT_PATH: z.string(),
});

export type Env = z.infer<typeof EnvSchema>;
