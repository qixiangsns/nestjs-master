import { PromotexterApi, PromotexterApix } from '@application/integrations/promotexter';
import { ViberSender } from '../interfaces/viber-sender.port';
import {
  SendViberResult,
  ViberTemplateRequest,
  ViberContentRequest,
  ViberOtpRequest,
} from '../models/viber-message.model';
import { AccountDetailsRoutable } from '../models/viber-route-config.model';

export class ViberSenderPromotexterApix implements ViberSender {
  private api: PromotexterApi;

  constructor(private readonly account: AccountDetailsRoutable) {
    this.api = new PromotexterApix({
      auth: {
        type: 'api_key',
        apiKey: 'xxx',
        apiSecret: 'xxxx',
      },
      baseUrl: 'https://apix.promotexter.com',
    });
  }

  async sendContentMsg(message: ViberContentRequest): Promise<SendViberResult> {
    return {
      messageId: '1',
      referenceId: '1',
    };
  }

  async sendTemplateMsg(message: ViberTemplateRequest): Promise<SendViberResult> {
    return {
      messageId: '1',
      referenceId: '1',
    };
  }

  async sendOtp(message: ViberOtpRequest): Promise<SendViberResult> {
    return {
      messageId: '',
      referenceId: '',
    };
  }
}
