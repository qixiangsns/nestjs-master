import { PromotexterApi } from '@application/integrations/promotexter';
import { ViberSender } from '../interfaces/viber-sender.port';
import {
  SendViberResult,
  ViberContentRequest,
  ViberOtpRequest,
  ViberTemplateRequest,
} from '../models/viber-message.model';
import { AccountDetailsRoutable } from '../models/viber-route-config.model';

export class ViberSenderPromotexter implements ViberSender {
  private api: PromotexterApi;

  constructor(private readonly account: AccountDetailsRoutable) {
    switch (account.type) {
      case 'BearerToken':
        this.api = new PromotexterApi({
          auth: {
            type: 'bearer_token',
            apiKey: account.apiKey,
            apiSecret: account.apiSecret,
            getToken: async () => '1',
            saveToken: async () => {},
          },
          baseUrl: account.url,
        });
        break;
      case 'ApiKeySecret':
        this.api = new PromotexterApi({
          auth: {
            type: 'api_key',
            apiKey: account.apiKey,
            apiSecret: account.apiSecret,
          },
          baseUrl: account.url,
        });
        break;
      default:
        throw new Error(`${PromotexterApi.name} does not support the following auth method: ${account.type}`);
    }
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
