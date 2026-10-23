import { TelesignMessageType } from './telesign.constant.js';

export type ClientOptions = {
  baseUrl: string;
  /** Telesign customer id, used as the HTTP basic username. */
  customerId: string;
  /** Telesign API key, used as the HTTP basic password. */
  apiKey: string;
  timeoutMs?: number;
};

/**
 * Send SMS message — `application/x-www-form-urlencoded`
 */
export type SendSmsRequest = {
  to: string;
  text: string;
  senderId?: string;
  /** Defaults to `OTP`, as in the legacy client. */
  messageType?: TelesignMessageType;
};

export type SendSmsResponse = {
  reference_id?: string;
  status: {
    code: number;
    description?: string;
    updated_on?: string;
  };
};
