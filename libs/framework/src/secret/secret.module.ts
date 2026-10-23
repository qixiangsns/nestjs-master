// secrets.module.ts
import {
  DynamicModule,
  Global,
  InjectionToken,
  Module,
  OptionalFactoryDependency,
  Provider,
  Logger,
} from '@nestjs/common';
import { ZodType, z } from 'zod';
import { VaultSecretProvider } from './providers/vault-secret.provider.js';
import { EnvSecretProvider } from './providers/env-secret.provider.js';
import { SecretProvider } from './interface/provider.interface.js';
import { InvalidSchemaException } from './exceptions/invalid-schema.exception.js';

export type SecretProviderType = 'env' | 'vault';

export interface VaultSecretDefinition {
  providerType: 'vault';
  vaultToken: string;
  vaultUrl: string;
  vaultPath: string;
}

export interface EnvSecretDefinition {
  providerType: 'env';
  envFilePath?: string[];
}

export type SecretDefinition = VaultSecretDefinition | EnvSecretDefinition;

export type SecretsModuleOptions = {
  provide: symbol | string;
  schema: ZodType;
} & SecretDefinition;

export interface SecretsModuleAsyncOptions {
  provide: symbol | string;
  schema: ZodType;
  useFactory: (...args: unknown[]) => Promise<SecretDefinition> | SecretDefinition;
  inject?: (InjectionToken | OptionalFactoryDependency)[];
}

async function loadSecret(definition: SecretDefinition, schema: ZodType) {
  let provider: SecretProvider;
  switch (definition.providerType) {
    case 'vault':
      provider = new VaultSecretProvider(
        definition.vaultToken,
        definition.vaultUrl,
        definition.vaultPath,
      );
      break;
    case 'env':
      provider = new EnvSecretProvider(definition.envFilePath);
      break;
  }

  const rawSecret = await provider.get();
  const secret = schema.safeParse(rawSecret);
  if (!secret.success) {
    throw new InvalidSchemaException(definition.providerType, secret.error);
  }
  return secret.data;
}

@Global()
@Module({})
export class SecretsModule {
  static forRoot(options: SecretsModuleOptions[]): DynamicModule {
    const providers: Provider[] = options.map((option) => ({
      provide: option.provide,
      useFactory: async () => {
        const logger = new Logger(SecretsModule.name);
        const secret = await loadSecret(option, option.schema);
        logger.debug(`Secret loaded for ${option.provide.toString()}`, { secret });
        return secret;
      },
    }));
    return {
      module: SecretsModule,
      providers,
      exports: providers,
    };
  }

  static forRootAsync(options: SecretsModuleAsyncOptions[]): DynamicModule {
    const providers: Provider[] = options.map(({ provide, useFactory, inject, schema }) => ({
      provide,
      useFactory: async (...args: unknown[]): Promise<z.infer<typeof schema>> => {
        const logger = new Logger(SecretsModule.name);
        const definition = await useFactory(...args);
        const secret = await loadSecret(definition, schema);
        logger.debug(`Secret loaded for ${provide.toString()}`, { secret });
        return secret;
      },
      inject: inject ?? [],
    }));

    return {
      module: SecretsModule,
      providers,
      exports: providers,
    };
  }
}
