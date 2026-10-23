import { VaultSecretProvider } from './providers/vault-secret.provider.js';
import { EnvSecretProvider } from './providers/env-secret.provider.js';
import { SecretProvider } from './interface/provider.interface.js';
import { SecretOptions } from './interface/secret-options.interface.js';
import { InvalidSchemaException } from './exceptions/invalid-schema.exception.js';

export async function loadSecret(options: SecretOptions) {
  let provider: SecretProvider;
  switch (options.providerType) {
    case 'vault':
      provider = new VaultSecretProvider(options.vaultToken, options.vaultUrl, options.vaultPath);
      break;
    case 'env':
      provider = new EnvSecretProvider(options.envFilePath);
      break;
  }

  const rawSecret = await provider.get();
  const secret = options.schema.safeParse(rawSecret);
  if (!secret.success) {
    throw new InvalidSchemaException(options.providerType, secret.error);
  }
  return secret.data;
}
