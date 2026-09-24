import { PromotexterApi, PromotexterApix } from '@application/integrations/promotexter';
import { ViberSender } from '../interfaces/viber-sender.port';
import { ViberOtp, ViberMessage } from '../models/viber-message.model';
import { ViberAccount } from '../models/viber-account.model';

export class ViberSenderPromotexterApix implements ViberSender {
  private api: PromotexterApi;

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
    return {
      referenceId: '1',
      messageId: '1',
    };
  }
}
