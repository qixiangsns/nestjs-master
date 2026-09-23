import { PromotexterBase } from './promotexter-base.service';
import { type ClientOptions, SendViberOtpRequest, SendSmsRequest } from './promotexter.types';

export class PromotexterApi extends PromotexterBase {
  constructor(options: ClientOptions) {
    super(options);
  }

  async sendViberOtp(payload: SendViberOtpRequest) {
    return super.sendViberOtpMsg('/viber/send‌', payload);
  }

  async sendSms(payload: SendSmsRequest) {
    return super.sendSmsMsg('/sms/send', payload);
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
