import { DeliveryStatus, ViberLog } from '../models/viber-log.model';

export const ViberLogTopic = {
  DeliveryUpdated: 'viber.log-delivery.updated',
  LogCreated: 'viber.log.created',
} as const satisfies Record<string, `viber.${string}`>;

export type ViberDeliveryUpdatedQueue = {
  referenceId: string;
  status: DeliveryStatus;
};

export type ViberLogCreatedQueue = ViberLog;
