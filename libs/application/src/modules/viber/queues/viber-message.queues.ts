import { z } from 'zod';
import {
  ViberContentRequest,
  ViberContentType,
  ViberMessageType,
  ViberOtpRequest,
  ViberRequest,
  ViberRequestBase,
  ViberTemplateRequest,
} from '../models/viber-message.model.js';
import { ViberProviderCode } from '../models/viber-provider.model.js';
import { RouteType } from '../models/viber-route-config.model.js';

const ViberRouteTopicPrefix = {
  'Infobip.Mkt': 'viber.mkt.infobip',
  'Infobip.Notif': 'viber.notif.infobip',
  'Infobip.Otp': 'viber.notif.infobip',
  'Promotexter.Mkt': 'viber.mkt.promotexter',
  'Promotexter.Otp': 'viber.otp.promotexter',
  'Promotexter.Notif': 'viber.notif.promotexter',
  'PromotexterApix.Mkt': 'viber.mkt.promotexter-apix',
  'PromotexterApix.Otp': 'viber.otp.promotexter-apix',
  'PromotexterApix.Notif': 'viber.notif.promotexter-apix',
  'MockProvider.Mkt': 'viber.mkt.mock-provider',
  'MockProvider.Otp': 'viber.otp.mock-provider',
  'MockProvider.Notif': 'viber.notif.mock-provider',
} as const satisfies Record<
  `${ViberProviderCode}.${RouteType}`,
  `viber.${Lowercase<RouteType>}.${string}`
>;

type ViberRouteTopicPrefix = keyof typeof ViberRouteTopicPrefix;

/**
 * Build the viber provider route topic
 * @example
 * - viber.notif.promotexter-apix.6aba26209fd9d9caac52940e
 * - viber.otp.promotexter-apix.6abb65351474721200daa7c8
 * - viber.mkt.promotexter.6abb65351474721200daa7c8
 */
export const getViberRouteTopic = (
  providerCode: ViberProviderCode,
  routeType: RouteType,
  accountId: string,
) => {
  const topicPrefix = ViberRouteTopicPrefix[`${providerCode}.${routeType}`];
  if (!topicPrefix) {
    throw new Error(
      `Invalid Viber route topic mapping for provider "${providerCode}" with type "${routeType}`,
    );
  }
  return `${topicPrefix}.${accountId}`;
};

export const ViberRequestBaseSchema = z.object({
  id: z.string(),
  platformId: z.string(),
  phoneNo: z.string(),
  senderId: z.string(),
  routeType: z.enum(RouteType),
  playerId: z.string().optional(),
  campaignId: z.string().optional(),
  campaignSender: z.string().optional(),
}) satisfies z.ZodType<ViberRequestBase>;

export const ViberTemplateRequestSchema = ViberRequestBaseSchema.extend({
  type: z.literal('Template' satisfies ViberMessageType),
  templateId: z.string(),
  templateLang: z.string(),
  templateParams: z.record(z.string(), z.string()),
}) satisfies z.ZodType<ViberTemplateRequest>;

export const ViberContentSchema = z.discriminatedUnion('contentType', [
  z.object({
    contentType: z.literal('TextOnly' satisfies ViberContentType),
    text: z.string(),
  }),
  z.object({
    contentType: z.literal('TextButton' satisfies ViberContentType),
    text: z.string(),
    buttonText: z.string(),
    buttonUrl: z.string().optional(),
  }),
  z.object({
    contentType: z.literal('ImageOnly' satisfies ViberContentType),
    imageUrl: z.string(),
  }),
  z.object({
    contentType: z.literal('ImageText' satisfies ViberContentType),
    imageUrl: z.string(),
    text: z.string(),
  }),
  z.object({
    contentType: z.literal('ImageButton' satisfies ViberContentType),
    imageUrl: z.string(),
    buttonText: z.string(),
    buttonUrl: z.string().optional(),
  }),
  z.object({
    contentType: z.literal('ImageButtonText' satisfies ViberContentType),
    imageUrl: z.string(),
    buttonText: z.string(),
    buttonUrl: z.string().optional(),
    text: z.string(),
  }),
  z.object({
    contentType: z.literal('VideoOnly' satisfies ViberContentType),
    videoUrl: z.string(),
  }),
  z.object({
    contentType: z.literal('VideoText' satisfies ViberContentType),
    videoUrl: z.string(),
    text: z.string(),
  }),
  z.object({
    contentType: z.literal('VideoButton' satisfies ViberContentType),
    videoUrl: z.string(),
    buttonText: z.string(),
    buttonUrl: z.string().optional(),
  }),
  z.object({
    contentType: z.literal('VideoButtonText' satisfies ViberContentType),
    videoUrl: z.string(),
    buttonText: z.string(),
    buttonUrl: z.string().optional(),
    text: z.string(),
  }),
]) satisfies z.ZodType<ViberContentRequest['templateContent']>;

export const ViberContentRequestSchema = ViberRequestBaseSchema.extend({
  type: z.literal('Content' satisfies ViberMessageType),
  templateContent: ViberContentSchema,
}) satisfies z.ZodType<ViberContentRequest>;

export const ViberOtpRequestSchema = ViberRequestBaseSchema.extend({
  type: z.literal('Otp' satisfies ViberMessageType),
  templateId: z.string(),
  otp: z.string(),
  otpValidityMinutes: z.number(),
}) satisfies z.ZodType<ViberOtpRequest>;

export const ViberRequestSchema = z.discriminatedUnion('type', [
  ViberOtpRequestSchema,
  ViberContentRequestSchema,
  ViberTemplateRequestSchema,
]) satisfies z.ZodType<ViberRequest>;
