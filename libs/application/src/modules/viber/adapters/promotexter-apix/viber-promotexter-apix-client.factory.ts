import { Injectable } from '@nestjs/common';
import { PromotexterApix } from '@application/integrations/promotexter';
import { ViberAccountService } from '../../services/viber-account.service';
import { ViberAccountTokenCache } from '../../caches/viber-account-token.cache';

@Injectable()
export class ViberPromotexterApixClientFactory {
  private clients = new Map<string, PromotexterApix>();

  constructor(
    private readonly accountService: ViberAccountService,
    private readonly tokenCache: ViberAccountTokenCache,
  ) {}

  async getClient(accountId: string): Promise<PromotexterApix> {
    const client = this.clients.get(accountId);
    if (client) return client;

    const newClient = await this.createClient(accountId);
    this.clients.set(accountId, newClient);
    return newClient;
  }

  async createClient(accountId: string): Promise<PromotexterApix> {
    const account = await this.accountService.findAccount(accountId);

    if (!account) throw new Error(`${ViberPromotexterApixClientFactory.name} failed to create client for ${accountId}`);

    let client: PromotexterApix;
    switch (account.type) {
      case 'BearerToken':
        client = new PromotexterApix({
          auth: {
            type: 'bearer_token',
            apiKey: account.apiKey,
            apiSecret: account.apiSecret,
            tokenStore: {
              get: () => this.tokenCache.get(account.id),
              save: (token) => this.tokenCache.save(account.id, token, PromotexterApix.TOKEN_EXPIRATION_SECONDS),
            },
          },
          baseUrl: account.url,
        });
        break;
      case 'ApiKeySecret':
        client = new PromotexterApix({
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

    return client;
  }
}
