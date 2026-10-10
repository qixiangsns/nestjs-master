import { ViberSender } from '../interfaces/viber-sender.port';
import { ViberProviderCode } from '../models/viber-provider.model';
import { ViberAccount } from '../models/viber-account.model';
import { ViberSenderPromotexterApix } from './viber-sender-promotexter-apix.adapter';
import { ViberSenderPromotexter } from './viber-sender-promotexter.adapter';
import { AccountDetailsRoutable } from '../models/viber-route-config.model';

export class ViberSenderFactory {
  static createSender(account: AccountDetailsRoutable): ViberSender {
    switch (account.providerCode) {
      case 'Promotexter':
        return new ViberSenderPromotexter(account);
      case 'PromotexterApix':
        return new ViberSenderPromotexterApix(account);
      default:
        throw new Error(`Invalid Viber Provider: ${account.providerCode}`);
    }
  }
}
