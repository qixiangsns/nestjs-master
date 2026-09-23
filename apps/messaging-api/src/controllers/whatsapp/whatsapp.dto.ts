import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const SendWhatsappOtpSchema = z.object({
  platformId: z.string().trim(),
  playerId: z.string().trim(),
  otp: z.string().trim(),
  expiresAt: z.iso.datetime().optional(),
});

const SendWhatsappOtpResponseSchema = z.object({
  messageId: z.string(),
});

export class SendWhatsappOtpRequest extends createZodDto(SendWhatsappOtpSchema) {}
export class SendWhatsappOtpResponse extends createZodDto(SendWhatsappOtpResponseSchema) {}

const SendWhatsappMktSchema = z.object({
  platformId: z.string().trim(),
  playerId: z.string().trim(),
  templateName: z.string().trim(),
  templateParams: z
    .object()
    .describe('Example: { "promoCode": "2334441", "promoDate": "2026/04/01 12:00am" }')
    .optional(),
});

const SendWhatsappMktResponseSchema = z.object({
  messageId: z.string(),
});
export class SendWhatsappMktRequest extends createZodDto(SendWhatsappMktSchema) {}
export class SendWhatsappMktResponse extends createZodDto(SendWhatsappMktResponseSchema) {}
