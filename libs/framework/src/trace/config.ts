import { z } from 'zod';

export const OtelConfigSchema = z.object({
  OTEL_ADDRESS: z.string().optional(),
  OTEL_METRIC_ADDRESS: z.string().optional(),
  OTEL_SAMPLING_RATE: z.coerce.number().min(0).max(1).default(0.1),
  OTEL_SERVICE_NAME: z.string().optional(),
});

export const getOtelConfig = () => {
  process.loadEnvFile();
  const config = OtelConfigSchema.parse(process.env);
  return config;
};
