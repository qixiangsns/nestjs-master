import { ViberSender } from '../interfaces/viber-sender.port';
import { ViberProviderCode } from '../models/viber-provider.model';
import { ViberAccount, ViberAccountSender } from '../models/viber-account.model';
import { ViberSenderPromotexterApix } from './viber-sender-promotexter-apix.adapter';
import { ViberSenderPromotexter } from './viber-sender-promotexter.adapter';
import { AccountDetailsRoutable } from '../models/viber-route-config.model';
import { ViberSenderMockProvider } from './viber-sender-mock-provider.adapter';
import { Inject, Injectable } from '@nestjs/common';
import { ViberAccountRepository } from '../repositories/viber-account.repository';
import { PromotexterApi, PromotexterApix } from '@application/integrations/promotexter';
import Redis from 'ioredis';
import { REDIS_TOKEN } from '@application/connnections';
import { ViberAccountService } from './viber-account.service';

@Injectable()
export class ViberAccountTokenStore {
  constructor(@Inject(REDIS_TOKEN.PRIMARY) private readonly redis: Redis) {}

  /**
   * @todo decrypt token after retrieval
   */
  async get(accountId: string) {
    // Decrypt
    const token = await this.redis.get(`account_token:${accountId}`);
    return token;
  }

  /**
   * @todo encrypt token before saving
   */
  async save(accountId: string, token: string, ttl?: number) {
    await this.redis.setex(`account_token:${accountId}`, token, ttl || 60 * 60 * 1000);
  }
}

@Injectable()
export class ViberPromotexterClientFactory {
  private clients = new Map<string, PromotexterApi>();

  constructor(
    private readonly accountService: ViberAccountService,
    private readonly tokenStore: ViberAccountTokenStore,
  ) {}

  async getClient(accountId: string) {
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
              get: () => this.tokenStore.get(account.id),
              save: (token) => this.tokenStore.save(account.id, token, PromotexterApi.TOKEN_EXPIRATION_MS),
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

@Injectable()
export class ViberPromotexterApixClientFactory {
  private clients = new Map<string, PromotexterApix>();

  constructor(
    private readonly accountService: ViberAccountService,
    private readonly tokenStore: ViberAccountTokenStore,
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
        client = new PromotexterApi({
          auth: {
            type: 'bearer_token',
            apiKey: account.apiKey,
            apiSecret: account.apiSecret,
            tokenStore: {
              get: () => this.tokenStore.get(account.id),
              save: (token) => this.tokenStore.save(account.id, token, PromotexterApi.TOKEN_EXPIRATION_MS),
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
        throw new Error(`${PromotexterApi.name} does not support the following auth method: ${account.type}`);
    }

    return client;
  }
}

@Injectable()
export class ViberSenderFactory {
  constructor(private readonly promotexterClientFactory: ViberPromotexterClientFactory) {}
  async createSender(account: ViberAccountSender): Promise<ViberSender> {
    switch (account.providerCode) {
      case 'Promotexter':
        const promotexterClient = await this.promotexterClientFactory.getClient(account.id);
        return new ViberSenderPromotexter(promotexterClient);
      case 'PromotexterApix':
        const promotexterApixClient = await this.promotexterClientFactory.getClient(account.id);
        return new ViberSenderPromotexterApix(promotexterApixClient);
      case 'MockProvider':
        return new ViberSenderMockProvider();
      default:
        throw new Error(`${ViberSenderFactory.name} failed to create viber sender: ${account.providerCode}`);
    }
  }
}
