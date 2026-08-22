import { z } from 'zod';

export const OtelConfigSchema = z.object({
  OTEL_ADDRESS: z.string().optional(),
  OTEL_METRIC_ADDRESS: z.string().optional(),
  OTEL_SAMPLING_RATE: z.coerce.number().default(0.1),
  OTEL_SERVICE_NAME: z.string().default('risk-event'),
});

export const getOtelConfig = () => {
  const config = OtelConfigSchema.parse(process.env);
  return config;
};
