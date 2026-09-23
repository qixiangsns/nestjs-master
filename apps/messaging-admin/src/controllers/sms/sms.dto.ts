import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const SmsLogRequestSchema = z.object({
  status: z.string().optional(),
  dlrStatus: z.string().optional(),
  messageId: z.string().optional(),
  provider: z.string().optional(),
  campaignId: z.string().optional(),
  endTime: z.iso.datetime(),
  startTime: z.iso.datetime(),
});

const SmsLogResponseSchema = z
  .object({
    token: z.string(),
    expiresAt: z.iso.datetime(),
  })
  .meta({
    title: 'SmsLogs',
    description: 'Sms Logs listings',
  });

export class SmsLogRequest extends createZodDto(SmsLogRequestSchema) {}
export class SmsLogResponse extends createZodDto(SmsLogResponseSchema) {}

const SmsProviderResponseSchema = z
  .object({
    code: z.string(),
    url: z.string(),
  })
  .meta({
    title: 'SmsProviders',
    description: 'A list sms providers',
  });

export class SmsProviderResponse extends createZodDto(SmsProviderResponseSchema) {}
