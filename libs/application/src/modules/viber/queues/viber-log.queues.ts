import { z } from 'zod';
import {
  DeliveryStatus,
  ErrorType,
  MessageType,
  RequestStatus,
  ViberLog,
} from '../models/viber-log.model.js';
import { ViberProviderCode } from '../models/viber-provider.model.js';

export const ViberLogTopic = {
  DeliveryUpdated: 'viber.log-delivery.updated',
  LogCreated: 'viber.log.created',
} as const satisfies Record<string, `viber.${string}`>;

export type ViberDeliveryUpdatedQueue = {
  referenceId: string;
  status: DeliveryStatus;
};

export const ViberLogCreatedQueueSchema = z.object({
  id: z.string(),
  providerCode: z.enum(ViberProviderCode).optional(),
  type: z.enum(MessageType),
  refId: z.string().optional(),
  content: z.string().optional(),
  platformId: z.string(),
  playerId: z.string().optional(),
  phoneNo: z.string().optional(),
  requestStatus: z.enum(RequestStatus),
  deliveryStatus: z.enum(DeliveryStatus),
  campaignId: z.string().optional(),
  campaignSender: z.string().optional(),
  error: z.enum(ErrorType).optional(),
  // Dates arrive as ISO strings after JSON serialization
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}) satisfies z.ZodType<ViberLog>;

export type ViberLogCreatedQueue = z.infer<typeof ViberLogCreatedQueueSchema>;
