import { PromotexterApix } from '@application/integrations/promotexter';
import { ViberSender } from '../interfaces/viber-sender.port';
import { ViberMessage } from '../models/viber-message.model';
import { ViberAccount } from '../schemas/viber-account.schema';
import { ViberOtp } from '../models/viber-message.model';

export class ViberSenderPromotexter implements ViberSender {
  private api: PromotexterApix;

  constructor(private readonly account: ViberAccount) {
    this.api = new PromotexterApix({
      auth: {
        type: 'api_key',
        apiKey: 'xxx',
        apiSecret: 'xxxx',
      },
      baseUrl: 'https://apix.promotexter.com',
    });
  }

  async sendViberOtp(message: ViberOtp): Promise<ViberMessage> {
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
