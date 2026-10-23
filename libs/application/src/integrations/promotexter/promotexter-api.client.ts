import { PromotexterBaseClient } from './promotexter-base.client.js';
import {
  type ClientOptions,
  SendViberRichMsgRequest,
  SendViberTemplateRequest,
  SendSmsRequest,
} from './promotexter.types.js';

export class PromotexterApiClient extends PromotexterBaseClient {
  static TOKEN_EXPIRATION_MS = 60 * 60 * 1000;
  constructor(options: ClientOptions) {
    super(options);
  }

  async sendViberOtp(request: SendViberTemplateRequest) {
    return super.sendViberOtpMsg('/viber/send', request);
  }

  async sendTemplate(request: SendViberTemplateRequest) {
    return super.sendTemplateMsg('/viber/send', request);
  }

  async sendRichMessage(request: SendViberRichMsgRequest) {
    return super.sendRichMsg('/viber/send', request);
  }

  async sendSms(request: SendSmsRequest) {
    return super.sendSmsMsg('/sms/send', request);
  }
}

/** Example
const sender = new PromotexterApiClient({
  auth: {
    type: 'api_key',
    apiKey: 'xxxx',
    apiSecret: 'xxxxx',
  },
  baseUrl: 'https://apix.promotexter.com',
});
 */
