import { SecretProvider } from '../interface/provider.interface';
import { Logger } from '@nestjs/common';
import * as Vault from 'node-vault';

export class VaultSecretProvider implements SecretProvider {
  private logger = new Logger(VaultSecretProvider.name);
  private vault: Vault.client;
  constructor(
    private readonly vaultToken: string,
    private readonly vaultUrl: string,
    private readonly vaultPath: string,
  ) {
    this.vault = Vault.default({
      apiVersion: 'v1',
      endpoint: this.vaultUrl,
      token: this.vaultToken,
    });
  }

  async get() {
    // eslint-disable-next-line
    const response = await this.vault.read(this.vaultPath);
    // eslint-disable-next-line
    if (!response?.data?.data) {
      throw new Error('Vault secret not found');
    }
    // eslint-disable-next-line
    return response.data.data;
  }
}
