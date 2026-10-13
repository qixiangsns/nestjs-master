import { Except, ExtractStrict } from 'type-fest';
import { ViberProviderCode } from './viber-provider.model';

export const AccountType = ['ApiToken', 'ApiKeySecret', 'BearerToken'] as const;
export type AccountType = (typeof AccountType)[number];

export const ProviderTransportMethod: Record<ViberProviderCode, AccountType[]> = {
  Infobip: ['ApiToken'],
  Promotexter: ['ApiKeySecret', 'BearerToken'],
  PromotexterApix: ['ApiKeySecret', 'BearerToken'],
  MockProvider: ['ApiToken'],
} as const;

export interface ViberAccountBase {
  id: string;
  name: string;
  providerCode: ViberProviderCode;
  senderIds: string[];
  isEnabled: boolean;
  createdAt: Date;
  url: string;
  updatedAt: Date;
}

/**
 * A single token for calling third party service
 */
export interface ViberAccountApiToken extends ViberAccountBase {
  type: ExtractStrict<AccountType, 'ApiToken'>;
  apiToken: string;
}

/**
 * A key/secret pair for calling third party services
 */
export interface ViberAccountApiKeySecret extends ViberAccountBase {
  type: ExtractStrict<AccountType, 'ApiKeySecret'>;
  apiKey: string;
  apiSecret: string;
}

/**
 * A key/secret pair for calling generate a bearer token for calling third party services
 */
export interface ViberAccountBearerToken extends ViberAccountBase {
  type: ExtractStrict<AccountType, 'BearerToken'>;
  apiKey: string;
  apiSecret: string;
}

export type ViberAccount = ViberAccountApiToken | ViberAccountApiKeySecret | ViberAccountBearerToken;

/**
 * Viber account required information to support sending API
 */
export type ViberAccountSender = Except<ViberAccount, 'createdAt' | 'updatedAt' | 'name' | 'isEnabled'>;
