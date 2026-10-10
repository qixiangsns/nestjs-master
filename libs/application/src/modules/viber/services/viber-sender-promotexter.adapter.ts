import { PromotexterApix } from '@application/integrations/promotexter';
import { ViberSender } from '../interfaces/viber-sender.port';
import {
  SendViberResult,
  ViberContentRequest,
  ViberOtpRequest,
  ViberTemplateRequest,
} from '../models/viber-message.model';
import { AccountDetailsRoutable } from '../models/viber-route-config.model';

export class ViberSenderPromotexter implements ViberSender {
  private api: PromotexterApix;

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
    const result = await this.api.sendViberOtp({
      from: 'casino plus',
      to: '630339434343',
      templateId: '332323232',
      referenceId: 'wqw2',
      ttl: 5,
      templateParams: {},
      templateLanguage: 'en',
      dlrCallbackConfig: {
        url: '32',
      },
    });

    return {
      referenceId: result.transactionId,
      messageId: '1',
    };
  }
}
