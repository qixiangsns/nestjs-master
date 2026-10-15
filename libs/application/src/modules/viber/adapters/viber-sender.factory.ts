import { Injectable } from '@nestjs/common';
import { ViberSender } from '../ports/viber-sender.port';
import { ViberAccountSender } from '../models/viber-account.model';
import { ViberSenderPromotexterApix } from './promotexter-apix/viber-sender-promotexter-apix.adapter';
import { ViberSenderPromotexter } from './promotexter/viber-sender-promotexter.adapter';
import { ViberSenderMockProvider } from './mock-provider/viber-sender-mock-provider.adapter';
import { ViberPromotexterClientFactory } from './promotexter/viber-promotexter-client.factory';
import { ViberPromotexterApixClientFactory } from './promotexter-apix/viber-promotexter-apix-client.factory';

@Injectable()
export class ViberSenderFactory {
  constructor(
    private readonly promotexterClientFactory: ViberPromotexterClientFactory,
    private readonly promotexterApixClientFactory: ViberPromotexterApixClientFactory,
  ) {}

  async createSender(account: ViberAccountSender): Promise<ViberSender> {
    switch (account.providerCode) {
      case 'Promotexter': {
        const promotexterClient = await this.promotexterClientFactory.getClient(account.id);
        return new ViberSenderPromotexter(promotexterClient);
      }
      case 'PromotexterApix': {
        const promotexterApixClient = await this.promotexterApixClientFactory.getClient(account.id);
        return new ViberSenderPromotexterApix(promotexterApixClient);
      }
      case 'MockProvider':
        return new ViberSenderMockProvider();
      default:
        throw new Error(`${ViberSenderFactory.name} failed to create viber sender: ${account.providerCode}`);
    }
  }
}
