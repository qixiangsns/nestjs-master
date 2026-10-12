import { ViberProviderCode } from '../models/viber-provider.model';
import { RouteType } from '../models/viber-route-config.model';

export const ViberRouteTopicPrefix = {
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

export type ViberRouteTopicPrefix = keyof typeof ViberRouteTopicPrefix;

/**
 * Build the viber provider route topic
 * @example
 * - viber.notif.promotexter-apix.6aba26209fd9d9caac52940e
 * - viber.otp.promotexter-apix.6abb65351474721200daa7c8
 * - viber.mkt.promotexter.6abb65351474721200daa7c8
 */
export const getViberRouteTopic = (providerCode: ViberProviderCode, routeType: RouteType, accountId: string) => {
  const topicPrefix = ViberRouteTopicPrefix[`${providerCode}.${routeType}`];
  if (!topicPrefix) {
    throw new Error(`Invalid Viber route topic mapping for provider "${providerCode}" with type "${routeType}`);
  }
  return `${topicPrefix}.${accountId}`;
};
