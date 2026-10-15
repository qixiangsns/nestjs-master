import { Injectable } from '@nestjs/common';
import { PromotexterApi } from '@application/integrations/promotexter';
import { ViberAccountService } from '../../services/viber-account.service';
import { ViberAccountTokenCache } from '../../caches/viber-account-token.cache';

@Injectable()
export class ViberPromotexterClientFactory {
  private clients = new Map<string, PromotexterApi>();

  constructor(
    private readonly accountService: ViberAccountService,
    private readonly tokenCache: ViberAccountTokenCache,
  ) {}

  async getClient(accountId: string): Promise<PromotexterApi> {
    const client = this.clients.get(accountId);
    if (client) return client;

    const newClient = await this.createClient(accountId);
    this.clients.set(accountId, newClient);
    return newClient;
  }

  async createClient(accountId: string): Promise<PromotexterApi> {
    const account = await this.accountService.findAccount(accountId);

    if (!account) throw new Error(`${ViberPromotexterClientFactory.name} failed to create client for ${accountId}`);

    let client: PromotexterApi;
    switch (account.type) {
      case 'BearerToken':
        client = new PromotexterApi({
          auth: {
            type: 'bearer_token',
            apiKey: account.apiKey,
            apiSecret: account.apiSecret,
            tokenStore: {
              get: () => this.tokenCache.get(account.id),
              save: (token) => this.tokenCache.save(account.id, token, PromotexterApi.TOKEN_EXPIRATION_MS),
            },
          },
          baseUrl: account.url,
        });
        break;
      case 'ApiKeySecret':
        client = new PromotexterApi({
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

    return client;
  }
}
