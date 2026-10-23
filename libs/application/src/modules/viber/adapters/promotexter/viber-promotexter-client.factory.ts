import { Injectable } from '@nestjs/common';
import { PromotexterApiClient } from '@application/integrations/promotexter/index.js';
import { ViberAccountService } from '../../services/viber-account.service.js';
import { ViberAccountTokenCache } from '../../caches/viber-account-token.cache.js';

@Injectable()
export class ViberPromotexterClientFactory {
  private clients = new Map<string, PromotexterApiClient>();

  constructor(
    private readonly accountService: ViberAccountService,
    private readonly tokenCache: ViberAccountTokenCache,
  ) {}

  async getClient(accountId: string): Promise<PromotexterApiClient> {
    const client = this.clients.get(accountId);
    if (client) return client;

    const newClient = await this.createClient(accountId);
    this.clients.set(accountId, newClient);
    return newClient;
  }

  async createClient(accountId: string): Promise<PromotexterApiClient> {
    const account = await this.accountService.findAccount(accountId);

    if (!account)
      throw new Error(
        `${ViberPromotexterClientFactory.name} failed to create client for ${accountId}`,
      );

    let client: PromotexterApiClient;
    switch (account.type) {
      case 'BearerToken':
        client = new PromotexterApiClient({
          auth: {
            type: 'bearer_token',
            apiKey: account.apiKey,
            apiSecret: account.apiSecret,
            tokenStore: {
              get: () => this.tokenCache.get(account.id),
              save: (token) =>
                this.tokenCache.save(account.id, token, PromotexterApiClient.TOKEN_EXPIRATION_MS),
            },
          },
          baseUrl: account.url,
        });
        break;
      case 'ApiKeySecret':
        client = new PromotexterApiClient({
          auth: {
            type: 'api_key',
            apiKey: account.apiKey,
            apiSecret: account.apiSecret,
          },
          baseUrl: account.url,
        });
        break;
      default:
        throw new Error(
          `${PromotexterApiClient.name} does not support the following auth method: ${account.type}`,
        );
    }

    return client;
  }
}
