import { InfobipErrorId, InfobipStatusGroup } from './infobip.constant.js';

export type ClientOptions = {
  /**
   * Account specific base URL, e.g. https://xxxxx.api.infobip.com
   */
  baseUrl: string;
  /**
   * API key sent as `Authorization: App <apiKey>`
   */
  apiKey: string;
  timeoutMs?: number;
};

/**
 * Send SMS message
 * https://www.infobip.com/docs/api/channels/sms/sms-messaging/outbound-sms/send-sms-messages
 */
export type SendSmsRequest = {
  from: string;
  to: string;
  text: string;
  /**
   * Client generated id echoed back on the response and on delivery reports.
   */
  messageId?: string;
};

export type InfobipMessageStatus = {
  groupId: InfobipStatusGroup;
  groupName: string;
  id: number;
  name: string;
  description: string;
  action?: string;
};

export type SendSmsResponse = {
  bulkId?: string;
  messages: {
    messageId: string;
    to: string;
    status: InfobipMessageStatus;
  }[];
};

/**
 * Infobip error response
 * https://www.infobip.com/docs/essentials/response-status-and-error-codes
 */
export interface InfobipErrorResponse {
  requestError: {
    serviceException: {
      messageId: InfobipErrorId;
      text: string;
      validationErrors?: Record<string, string[]>;
    };
  };
}
