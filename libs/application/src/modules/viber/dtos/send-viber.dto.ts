import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ViberContentType } from '../models/viber-message.model';

export const SendViberResponseSchema = z.object({
  messageId: z.string().trim(),
});

export type SendViberResponse = z.output<typeof SendViberResponseSchema>;

export const SendViberOtpSchema = z.object({
  platformId: z.string().trim(),
  playerId: z.string().trim(),
  otp: z.string().trim(),
  otpValidityMinutes: z.number(),
  templateId: z.string().trim(),
});

export type SendViberOtp = z.output<typeof SendViberOtpSchema>;

export const SendViberNotifSchema = z.object({
  platformId: z.string().trim(),
  playerId: z.string().trim(),
  templateId: z.string().trim(),
  templateParams: z.object().describe('Example: { "amount": "10000.43", "date": "2026/04/01 12:00am" }'),
});

export type SendViberNotif = z.output<typeof SendViberNotifSchema>;
export class SendViberNotifDto extends createZodDto(SendViberNotifSchema) {}

export const SendViberMktSchema = z.object({
  platformId: z.string().trim(),
  playerId: z.string().trim(),
  campaignId: z.string().trim().optional(),
  campaignSender: z.string().trim().optional(),
  contentType: z.enum(ViberContentType),
  text: z.string().optional(),
  imageUrl: z.url().optional(),
  buttonText: z.string().optional(),
  buttonUrl: z.url().optional(),
  videoUrl: z.url().optional(),
});

export type SendViberMkt = z.output<typeof SendViberMktSchema>;
