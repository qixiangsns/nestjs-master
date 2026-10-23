import { PromotexterBaseClient } from './promotexter-base.client.js';
import {
  type ClientOptions,
  SendViberTemplateRequest,
  SendSmsRequest,
} from './promotexter.types.js';

export class PromotexterApixClient extends PromotexterBaseClient {
  static TOKEN_EXPIRATION_SECONDS = 60 * 60;
  constructor(options: ClientOptions) {
    super(options);
  }

  async sendViberOtp(payload: SendViberTemplateRequest) {
    return super.sendViberOtpMsg('/viber-otp/v1', payload);
  }

  async sendSms(payload: SendSmsRequest) {
    return super.sendSmsMsg('/sms/v1', payload);
  }
}

/** Example
const sender = new PromotexterApixClient({
  auth: {
    type: 'bearer_token',
    accountId: 'e1e2',
    privateKey: 'dsds',
    token: 'generated token',
  },
  baseUrl: 'https://apix.promotexter.com',
});
 */
