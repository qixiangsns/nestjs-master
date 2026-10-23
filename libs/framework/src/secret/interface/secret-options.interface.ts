import { InjectionToken } from '@nestjs/common';
import { ZodType } from 'zod';

export type SecretProviderType = 'env' | 'vault';

interface BaseOptions {
  schema: ZodType;
}

export interface VaultSecretOptions extends BaseOptions {
  providerType: 'vault';
  vaultToken: string;
  vaultUrl: string;
  vaultPath: string;
}

export interface EnvSecretOptions extends BaseOptions {
  providerType: 'env';
  envFilePath?: string[];
}

export type SecretOptions = VaultSecretOptions | EnvSecretOptions;

export interface SecretsModuleExtras {
  /**
   * Injection token of the loaded secret. Use distinct tokens to register multiple secrets.
   */
  provide: InjectionToken;
}
