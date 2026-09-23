export const RequestStatus = {
  PROCESSING: 'PROCESSING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
} as const;
export const RequestStatusCodes = Object.values(RequestStatus);

export const DeliveryStatus = {
  PENDING: 'PENDING',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
} as const;
export const DeliveryStatusCodes = Object.values(DeliveryStatus);

export const MessageType = {
  OTP: 'OTP',
  MKT: 'MKT',
} as const;
export const MessageTypes = Object.values(MessageType);

export type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus];
export type DeliveryStatus = (typeof DeliveryStatus)[keyof typeof DeliveryStatus];
export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export interface ViberLog {
  id: string;
  providerCode: string;
  type: MessageType;
  refId: string;
  content: string;
  platformId?: string;
  playerId?: string;
  phoneNo: string;
  requestStatus: RequestStatus;
  deliveryStatus: DeliveryStatus;
  campaignId?: string;
  campaignSender?: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface ViberLogAdminView {}

export type ViberLogPublicView = Pick<
  ViberLog,
  'id' | 'content' | 'campaignId' | 'campaignSender' | 'requestStatus' | 'deliveryStatus'
>;
