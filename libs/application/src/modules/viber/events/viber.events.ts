import { ViberProviderCode } from '../models/viber-provider.model';
import { RouteType } from '../models/viber-route-config.model';

/**
 * Topic name for message queue
 */
export const ViberQueueEvent = {
  DeliveryUpdated: 'viber.log-delivery.updated',
  LogCreated: 'viber.log.created',
} as const satisfies Record<string, `viber.${string}`>;

/**
 * Topic name for message queue
 */
export const ViberRouteQueueEvent = {
  'Infobip.Mkt': 'viber.mkt.infobip',
  'Infobip.Notif': 'viber.notif.infobip',
  'Infobip.Otp': 'viber.notif.infobip',
  'Promotexter.Mkt': 'viber.mkt.promotexter',
  'Promotexter.Otp': 'viber.otp.promotexter',
  'Promotexter.Notif': 'viber.notif.promotexter',
  'PromotexterApix.Mkt': 'viber.mkt.promotexter-apix',
  'PromotexterApix.Otp': 'viber.otp.promotexter-apix',
  'PromotexterApix.Notif': 'viber.notif.promotexter-apix',
} as const satisfies Record<`${ViberProviderCode}.${RouteType}`, `viber.${Lowercase<RouteType>}.${string}`>;

export type ViberRouteQueueEventType = [keyof typeof ViberRouteQueueEvent];
export type ViberRouteQueueEvent = [keyof typeof ViberRouteQueueEvent];

export const getViberRouteEventName = (providerCode: ViberProviderCode, routeType: RouteType) =>
  ViberRouteQueueEvent[`${providerCode}.${routeType}`];

// 1. Viber OTP Dispatch Payload
export interface ViberOtpRequestedPayload {
  recipientPhoneNumber: string;
  otpCode: string;
  providerId?: string;
  requestedAt: string; // ISO date string
}

// 2. Viber Log Payload
export interface ViberLogCreatedPayload {
  messageId: string;
  recipientPhoneNumber: string;
  content: string;
  status: string;
  loggedAt: string;
}

// 3. Viber Status / DLR Callback Payload
export interface ViberStatusUpdatedPayload {
  messageId: string;
  providerMessageId: string;
  status: 'DELIVERED' | 'SEEN' | 'FAILED' | 'REJECTED';
  updatedAt: string;
  failureReason?: string;
}
