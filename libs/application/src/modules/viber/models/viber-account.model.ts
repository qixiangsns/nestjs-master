import { ViberProviderCode } from '../models/viber-provider.model';

export const AuthMethod = {
  API_KEY: 'API_KEY', // a pair of api key and secret
  API_TOKEN: 'API_TOKEN', // one single auth token
} as const;

export type AuthMethod = (typeof AuthMethod)[keyof typeof AuthMethod];
export const AuthMethods = Object.values(AuthMethod);

export type Credential = {
  apiKey: string;
  apiSecret: string;
  url: string;
};

export type CredentialApiKey = {
  apiKey: string;
  apiSecret: string;
};
export type CredentialApiToken = {
  token: string;
};

export interface ViberAccount {
  id: string;
  name: string;
  providerCode: ViberProviderCode;
  authMethod: AuthMethod;
  credential: Credential;
  senderIds: string[];
  createdAt: Date;
  updatedAt: Date;
}
