import { SemaphoreMessagePath } from './semaphore.constant.js';

export type ClientOptions = {
  baseUrl: string;
  apiKey: string;
  timeoutMs?: number;
};

export type SendSmsRequest = {
  to: string;
  text: string;
  senderId?: string;
  /** Defaults to `messages`. Use `otp` to have Semaphore track the code. */
  path?: SemaphoreMessagePath;
  /**
   * OTP code. Only used on the `otp` path; when omitted it is extracted from
   * the message body, as the legacy client did.
   */
  code?: string;
};

export type SendSmsResponse = {
  message_id: string;
  status: string;
  recipient?: string;
  message?: string;
}[];

export type BalanceResponse = {
  credit_balance?: number;
  account_name?: string;
  status?: string;
};
