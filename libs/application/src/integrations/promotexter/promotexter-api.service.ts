import { PromotexterBase } from './promotexter-base.service';
import {
  type ClientOptions,
  SendViberRichMsgRequest,
  SendViberTemplateRequest,
  SendSmsRequest,
} from './promotexter.types';

export class PromotexterApi extends PromotexterBase {
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
const sender = new PromotexterApi({
  auth: {
    type: 'api_key',
    apiKey: 'xxxx',
    apiSecret: 'xxxxx',
  },
  baseUrl: 'https://apix.promotexter.com',
});
 */
