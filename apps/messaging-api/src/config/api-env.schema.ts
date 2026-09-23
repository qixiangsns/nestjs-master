import { z } from 'zod';

export const API_ENV_TOKEN = Symbol('ENV_TOKEN');
export const ApiEnvSchema = z.object({
  PORT: z.coerce.number(),
});

export type ApiEnv = z.infer<typeof ApiEnvSchema>;
