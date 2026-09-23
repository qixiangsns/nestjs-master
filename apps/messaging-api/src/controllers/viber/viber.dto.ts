import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const SendViberOtpSchema = z.object({
  platformId: z.string().trim(),
  playerId: z.string().trim(),
  otp: z.string().trim(),
  expiresAt: z.iso.datetime().optional(),
});

const SendViberOtpResponseSchema = z.object({
  messageId: z.string(),
});

export class SendViberOtpRequest extends createZodDto(SendViberOtpSchema) {}
export class SendViberOtpResponse extends createZodDto(SendViberOtpResponseSchema) {}

const SendViberNotificationSchema = z.object({
  platformId: z.string().trim(),
  playerId: z.string().trim(),
  type: z.enum(['topup_successful', 'withdrawal_successful']).describe('Type of the notification message'),
  params: z.object().describe('Example: { "amount": "10000.43", "date": "2026/04/01 12:00am" }').optional(),
});

const SendViberNotificationResponseSchema = z.object({
  messageId: z.string(),
});

export class SendViberNotificationRequest extends createZodDto(SendViberNotificationSchema) {}
export class SendViberNotificationResponse extends createZodDto(SendViberNotificationResponseSchema) {}

const SendViberMktSchema = z.object({
  platformId: z.string().trim(),
  playerId: z.string().trim(),
  templateName: z.string().trim(),
  templateParams: z
    .object()
    .describe('Example: { "promoCode": "2334441", "promoDate": "2026/04/01 12:00am" }')
    .optional(),
});

const SendViberMktResponseSchema = z.object({
  messageId: z.string(),
});
export class SendViberMktRequest extends createZodDto(SendViberMktSchema) {}
export class SendViberMktResponse extends createZodDto(SendViberMktResponseSchema) {}
