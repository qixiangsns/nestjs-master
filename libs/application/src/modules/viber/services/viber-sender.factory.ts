import { ViberSender } from '../interfaces/viber-sender.port';
import { ViberProviderCode } from '../models/viber-provider.model';
import { ViberAccount } from '../models/viber-account.model';
import { ViberSenderPromotexterApix } from './viber-sender-promotexter-apix.adapter';
import { ViberSenderPromotexter } from './viber-sender-promotexter.adapter';

export class ViberSenderFactory {
  static createSender(account: ViberAccount): ViberSender {
    switch (account.providerCode) {
      case ViberProviderCode.PROMOTEXTER_APIX:
        return new ViberSenderPromotexter(account);
      case ViberProviderCode.PROMOTEXTER:
        return new ViberSenderPromotexterApix(account);
      default:
        throw new Error(`Invalid Viber Provider: ${account.providerCode}`);
    }
  }
}
