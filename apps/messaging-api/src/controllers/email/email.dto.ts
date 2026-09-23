import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const SendMktEmailRequestSchema = z.object({
  platformId: z.string().trim(),
  playerId: z.string().trim(),
  subject: z.string().trim().min(8),
  content: z.string().trim().min(8),
  unsubscribeUrl: z.url().optional(),
});

const SendMktEmailResponseSchema = z.object({
  messageId: z.string(),
});

export class SendMktEmailRequest extends createZodDto(SendMktEmailRequestSchema) {}
export class SendMktEmailResponse extends createZodDto(SendMktEmailResponseSchema) {}

const SendOtpEmailRequestSchema = z.object({
  platformId: z.string().trim(),
  playerId: z.string().trim(),
  subject: z.string().trim().min(8),
  content: z.string().trim().min(8),
  unsubscribeUrl: z.url().optional(),
});

const SendOtpEmailResponseSchema = z.object({
  messageId: z.string(),
});

export class SendOtpEmailRequest extends createZodDto(SendOtpEmailRequestSchema) {}
export class SendOtpEmailResponse extends createZodDto(SendOtpEmailResponseSchema) {}

const SendNotificationEmailRequestSchema = z.object({
  platformId: z.string().trim(),
  playerId: z.string().trim(),
  subject: z.string().trim().min(8),
  content: z.string().trim().min(8),
  unsubscribeUrl: z.url().optional(),
});

const SendNotificationEmailResponseSchema = z.object({
  messageId: z.string(),
});

export class SendNotificationEmailRequest extends createZodDto(SendNotificationEmailRequestSchema) {}
export class SendNotificationEmailResponse extends createZodDto(SendNotificationEmailResponseSchema) {}
