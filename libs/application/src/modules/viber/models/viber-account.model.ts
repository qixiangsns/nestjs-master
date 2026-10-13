import { ExtractStrict } from 'type-fest';
import { ViberProviderCode } from './viber-provider.model';

export const AccountType = ['ApiToken', 'ApiKeySecret'] as const;
export type AccountType = (typeof AccountType)[number];

export const ProviderTransportMethod: Record<ViberProviderCode, AccountType[]> = {
  Infobip: ['ApiToken'],
  Promotexter: ['ApiToken'],
  PromotexterApix: ['ApiKeySecret', 'ApiToken'],
  MockProvider: ['ApiToken'],
} as const;

export interface ViberAccountBase {
  id: string;
  name: string;
  providerCode: ViberProviderCode;
  senderIds: string[];
  createdAt: Date;
  url: string;
  updatedAt: Date;
}

export interface ViberAccountApiToken extends ViberAccountBase {
  type: ExtractStrict<AccountType, 'ApiToken'>;
  apiToken: string;
}

export interface ViberAccountApiKeySecret extends ViberAccountBase {
  type: ExtractStrict<AccountType, 'ApiKeySecret'>;
  apiKey: string;
  apiSecret: string;
}

export type ViberAccount = ViberAccountApiToken | ViberAccountApiKeySecret;
