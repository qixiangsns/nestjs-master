import { z } from 'zod';
import {
  OffsetPaginationQuerySchema,
  OffsetPaginationSchema,
} from '@framework/pagination/index.js';
import { ViberProviderCode } from '../models/viber-provider.model.js';
import { DeliveryStatus, MessageType, RequestStatus } from '../models/viber-log.model.js';

export const GetViberLogListRequestSchema = OffsetPaginationQuerySchema.extend({
  type: z.enum(MessageType).optional(),
  requestStatus: z.enum(RequestStatus).optional(),
  deliveryStatus: z.enum(DeliveryStatus).optional(),
  campaignId: z.string().trim().optional(),
  startTime: z.iso.datetime(),
  endTime: z.iso.datetime(),
}).refine((query) => new Date(query.startTime) <= new Date(query.endTime), {
  message: 'startTime must be before endTime',
  path: ['endTime'],
});

export type GetViberLogListRequest = z.output<typeof GetViberLogListRequestSchema>;

export const ViberLogListItemSchema = z
  .object({
    id: z.string(),
    providerCode: z.enum(ViberProviderCode).optional(),
    type: z.enum(MessageType),
    refId: z.string().optional(),
    platformId: z.string(),
    playerId: z.string().optional(),
    phoneNo: z.string().optional(),
    requestStatus: z.enum(RequestStatus),
    deliveryStatus: z.enum(DeliveryStatus),
    campaignId: z.string().optional(),
    campaignSender: z.string().optional(),
    createdAt: z.iso.datetime().optional(),
    updatedAt: z.iso.datetime().optional(),
  })
  .meta({ title: 'ViberLog', description: 'A viber message log, without message content' });

export const GetViberLogListResponseSchema = OffsetPaginationSchema.extend({
  items: z.array(ViberLogListItemSchema),
}).meta({ title: 'ViberLogList' });
