import { PromotexterApix } from '@application/integrations/promotexter';
import { ViberSender } from '../interfaces/viber-sender.port';
import {
  SendViberResult,
  ViberTemplateRequest,
  ViberContentRequest,
  ViberOtpRequest,
} from '../models/viber-message.model';
import { AccountDetailsRoutable } from '../models/viber-route-config.model';

export class ViberSenderPromotexterApix implements ViberSender {
  private api: PromotexterApix;

  constructor(private readonly account: AccountDetailsRoutable) {
    switch (account.type) {
      case 'BearerToken':
        this.api = new PromotexterApix({
          auth: {
            type: 'bearer_token',
            apiKey: account.apiKey,
            apiSecret: account.apiSecret,
            saveToken: async (token) => {},
            getToken: async () => '',
          },
          baseUrl: account.url,
        });
        break;
      case 'ApiKeySecret':
        this.api = new PromotexterApix({
          auth: {
            type: 'api_key',
            apiKey: account.apiKey,
            apiSecret: account.apiSecret,
          },
          baseUrl: account.url,
        });
        break;
      default:
        throw new Error(`${PromotexterApix.name} does not support the following auth method: ${account.type}`);
    }
  }

  async sendContentMsg(message: ViberContentRequest): Promise<SendViberResult> {
    throw new Error(`${PromotexterApix.name} does not support sending viber rich content message`);
  }

  async sendTemplateMsg(message: ViberTemplateRequest): Promise<SendViberResult> {
    throw new Error(`${PromotexterApix.name} does not support sending viber template message`);
  }

  async sendOtp(message: ViberOtpRequest): Promise<SendViberResult> {
    return {
      messageId: '',
      referenceId: '',
    };
  }
}
