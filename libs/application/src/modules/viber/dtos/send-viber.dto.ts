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

export const SendViberMktBaseSchema = z.object({
  platformId: z.string().trim(),
  playerId: z.string().trim(),
  campaignId: z.string().trim().optional(),
  campaignSender: z.string().trim().optional(),
});

export const SendViberMktSchema = SendViberMktBaseSchema.extend({
  content: z.xor([
    z
      .object({
        contentType: z.literal('TextOnly' satisfies ViberContentType),
        text: z.string(),
      })
      .meta({ title: 'TextOnly' }),
    z
      .object({
        contentType: z.literal('TextButton' satisfies ViberContentType),
        text: z.string(),
        buttonText: z.string(),
        buttonUrl: z.url().optional(),
      })
      .meta({ title: 'TextButton' }),
    z
      .object({
        contentType: z.literal('ImageOnly' satisfies ViberContentType),
        imageUrl: z.url(),
      })
      .meta({ title: 'ImageOnly' }),
    z
      .object({
        contentType: z.literal('ImageText' satisfies ViberContentType),
        imageUrl: z.url(),
        text: z.string(),
      })
      .meta({ title: 'ImageText' }),
    z
      .object({
        contentType: z.literal('ImageButton' satisfies ViberContentType),
        imageUrl: z.url(),
        buttonText: z.string(),
        buttonUrl: z.url().optional(),
      })
      .meta({ title: 'ImageButton' }),
    z
      .object({
        contentType: z.literal('ImageButtonText' satisfies ViberContentType),
        imageUrl: z.url(),
        buttonText: z.string(),
        buttonUrl: z.url().optional(),
        text: z.string(),
      })
      .meta({ title: 'ImageButtonText' }),
    z
      .object({
        contentType: z.literal('VideoOnly' satisfies ViberContentType),
        videoUrl: z.url(),
      })
      .meta({ title: 'VideoOnly' }),
    z
      .object({
        contentType: z.literal('VideoText' satisfies ViberContentType),
        videoUrl: z.url(),
        text: z.string(),
      })
      .meta({ title: 'VideoText' }),
    z
      .object({
        contentType: z.literal('VideoButton' satisfies ViberContentType),
        videoUrl: z.url(),
        buttonText: z.string(),
        buttonUrl: z.url().optional(),
      })
      .meta({ title: 'VideoButton' }),
    z
      .object({
        contentType: z.literal('VideoButtonText' satisfies ViberContentType),
        videoUrl: z.url(),
        buttonText: z.string(),
        buttonUrl: z.url().optional(),
        text: z.string(),
      })
      .meta({ title: 'VideoButtonText' }),
  ]),
});

export type SendViberMkt = z.output<typeof SendViberMktSchema>;
