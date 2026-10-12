import { DeliveryStatus, ViberLog } from '../models/viber-log.model';

export const ViberLogTopic = {
  DeliveryUpdated: 'viber.log-delivery.updated',
  LogCreated: 'viber.log.created',
} as const satisfies Record<string, `viber.${string}`>;

export type ViberDeliveryUpdatedPayload = {
  referenceId: string;
  status: DeliveryStatus;
};

export type ViberLogCreatedPayload = ViberLog;
