import { PromotexterErrorCode } from './promotexter.constant';
import { RawAxiosHeaders } from 'axios';

interface TokenStore {
  get: () => Promise<string | null>;
  save: (token: string) => Promise<void>;
}
/**
 * Promotexter Auth Options
 */
export type AuthConfigBearerToken = {
  type: 'bearer_token';
  apiKey: string;
  apiSecret: string;
  tokenStore: TokenStore;
};

export type AuthConfigApiKey = {
  type: 'api_key';
  apiKey: string;
  apiSecret: string;
};

export type ClientOptions = {
  /**
   * Base URL for core features such as SMS/Viber/Email
   */
  baseUrl: string;
  /**
   * Base URL for account management and authentication
   */
  accountBaseUrl?: string;
  timeoutMs?: number;
  auth: AuthConfigApiKey | AuthConfigBearerToken;
};

/**
 * Generate token
 */
export type GenerateTokenResponse = {
  status: 'ok';
  data: string;
};

export type GenerateTokenRequest = {
  expiresInSeconds: number;
};

export interface SendViberRequestBase {
  from: string;
  to: string;
  targetDevice?: 'all' | 'primary';
  ttl?: number;
  dlrCallbackConfig?: {
    url: string;
    headers?: RawAxiosHeaders;
    body?: Record<string, unknown>;
  };
  dlrCallback?: string;
  referenceId?: string;
  sms_from?: string;
  sms_text?: string;
}
/**
 * Send Viber Verification Message
 * https://promotexter-api.redocly.app/api/viber-verification-messages/sendviberverification
 */

export interface SendViberTemplateRequest extends SendViberRequestBase {
  templateId: string;
  templateParams: Record<string, unknown>;
  templateLang?: string;
}

export type SendViberResponse = {
  transactionId: string;
  requestId: string;
};

/**
 * Send Viber Verification Message
 * https://promotexter-api.redocly.app/api/viber-verification-messages/sendviberverification
 */

export interface SendViberRichMsgRequest extends SendViberRequestBase {
  text?: string;
  image?: string; // image url
  caption?: string; // button label (required with url)
  url?: string; // button url (required with caption)
  video?: string; // video url
  thumbnail?: string; // video image thumbnail
}

/**
 * Send SMS message
 * https://promotexter-api.redocly.app/api/sms-messaging/sendsms
 */
export type SendSmsRequest = {
  from: string;
  to: string;
  text: string;
  dlrReport: 1 | 0;
  ttl: number;
  dlrCallbackConfig: {
    url: string;
    headers: RawAxiosHeaders;
    body: Record<string, unknown>;
  };
  referenceId: string;
};

export type SendSmsResponse = {
  status: 'ok';
  data: {
    id: string;
    unitCost: number;
    transactionCost: number;
    operatorCode: string;
    messageParts: number;
    from: string;
    to: string;
    source: string;
    remaining: number;
  };
};

/**
 * Get account balance
 * https://promotexter-api.redocly.app/api/account-balance/getaccountbalance
 */

export type AccountBalance = {
  availableBalance: number;
  accountBalance: number;
  creditLimit: number;
  withheld: number;
};

/**
 * Promotexter error response
 */
export interface PromotexterErrorResponse {
  message: string;
  code: PromotexterErrorCode;
}
