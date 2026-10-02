import { ViberProviderCode } from './viber-provider.model';

export const RequestStatus = ['Processing', 'Success', 'Failed'] as const;
export type RequestStatus = (typeof RequestStatus)[number];

export const DeliveryStatus = ['Pending', 'Delivered', 'Failed'] as const;
export type DeliveryStatus = (typeof DeliveryStatus)[number];

export const MessageType = ['Otp', 'Mkt', 'Notif'] as const;
export type MessageType = (typeof MessageType)[number];
export interface ViberLog {
  id: string;
  providerCode?: ViberProviderCode;
  type: MessageType;
  refId?: string;
  content?: string;
  platformId: string;
  playerId?: string;
  phoneNo?: string; // masked string
  requestStatus: RequestStatus;
  deliveryStatus: DeliveryStatus;
  campaignId?: string;
  campaignSender?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ViberLogFilterDto = Pick<ViberLog, 'type' | 'requestStatus' | 'deliveryStatus' | 'campaignId'>;
