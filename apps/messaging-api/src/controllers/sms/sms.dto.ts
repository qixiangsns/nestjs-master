import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const SendPlayerSmsSchema = z.object({
  platformId: z.string().trim(),
  content: z.string().trim().min(8),
});

const SendOtpSmsSchema = SendPlayerSmsSchema.extend({
  otp: z.string().trim(),
  expiresAt: z.iso.datetime().optional(),
});

const SendSmsResponseSchema = z.object({
  messageId: z.string(),
});

const SendMktSmsRequestSchema = SendPlayerSmsSchema.extend({
  playerId: z.string().trim(),
});
const SendMktSmsResponseSchema = SendSmsResponseSchema;

export class SendMktSmsRequest extends createZodDto(SendMktSmsRequestSchema) {}
export class SendMktSmsResponse extends createZodDto(SendMktSmsResponseSchema) {}

const SendLoginOtpSmsRequestSchema = SendOtpSmsSchema.extend({
  playerId: z.string().trim(),
});
const SendLoginOtpSmsResponseSchema = SendSmsResponseSchema;

export class SendLoginOtpSmsRequest extends createZodDto(SendLoginOtpSmsRequestSchema) {}
export class SendLoginOtpSmsResponse extends createZodDto(SendLoginOtpSmsResponseSchema) {}

const SendRegisterOtpSmsRequestSchema = SendOtpSmsSchema.extend({
  phoneNumber: z.string().trim(),
});

const SendRegisterOtpSmsResponseSchema = SendSmsResponseSchema;

export class SendRegisterOtpSmsRequest extends createZodDto(SendRegisterOtpSmsRequestSchema) {}
export class SendRegisterOtpSmsResponse extends createZodDto(SendRegisterOtpSmsResponseSchema) {}

const SendNotificationSmsRequestSchema = SendPlayerSmsSchema.extend({
  playerId: z.string().trim(),
});
const SendNotificationSmsResponseSchema = SendSmsResponseSchema;

export class SendNotificationSmsRequest extends createZodDto(SendNotificationSmsRequestSchema) {}
export class SendNotificationSmsResponse extends createZodDto(SendNotificationSmsResponseSchema) {}
