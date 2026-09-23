import { ViberProviderCode } from '../models/viber-provider.model';

export const AuthMethod = {
  API_KEY: 'API_KEY',
} as const;

export type AuthMethod = (typeof AuthMethod)[keyof typeof AuthMethod];
export const AuthMethods = Object.values(AuthMethod);

export type Credential = {
  apiKey: string;
  apiSecret: string;
  url: string;
};

export interface ViberAccount {
  id: string;
  name: string;
  providerCode: ViberProviderCode;
  authMethod: AuthMethod;
  credential: Credential;
  createdAt: Date;
  updatedAt: Date;
}
