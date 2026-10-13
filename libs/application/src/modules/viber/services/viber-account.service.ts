import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ViberAccountRepository } from '../repositories/viber-account.repository';
import { ViberProviderService } from './viber-provider.service';
import { ViberProviderCode } from '../models/viber-provider.model';
import { ProviderTransportMethod, ViberAccount } from '../models/viber-account.model';
import { CreateViberAccount, PatchViberAccount } from '../dtos/viber-account.dto';

@Injectable()
export class ViberAccountService {
  constructor(
    private readonly accountRepo: ViberAccountRepository,
    private readonly providerService: ViberProviderService,
  ) {}

  async getAllAccounts() {
    return this.accountRepo.getAllAccount();
  }

  async findAccounts(ids: string[]) {
    return this.accountRepo.findAccounts(ids);
  }

  async findEnabledAccountsByProvider(code: ViberProviderCode) {
    return this.accountRepo.findEnabledAccountsByProvider(code);
  }

  async findAccount(id: string): Promise<ViberAccount | null> {
    return this.accountRepo.findAccount(id);
  }

  async addAccount({ credentials, ...account }: CreateViberAccount) {
    if (!ProviderTransportMethod[account.providerCode].includes(credentials.type)) {
      throw new BadRequestException(`${account.providerCode} does not support ${credentials.type} accounts`);
    }

    await this.validateProviderUrl(account.providerCode, account.url);

    if (credentials.type === 'ApiToken') {
      return this.accountRepo.addApiTokenAcc({ ...account, ...credentials, isEnabled: false });
    }

    return this.accountRepo.addApiKeySecretAcc({ ...account, ...credentials, isEnabled: false });
  }

  async updateAccount(id: string, account: PatchViberAccount) {
    const existing = await this.accountRepo.findAccount(id);

    if (!existing) {
      throw new NotFoundException('Viber account not found');
    }

    await this.accountRepo.updateAccount(id, account);
  }

  private async validateProviderUrl(providerCode: ViberProviderCode, url: string) {
    const provider = await this.providerService.findProvider(providerCode);

    if (!provider) {
      throw new BadRequestException(`Provider ${providerCode} is not configured`);
    }

    if (!provider.urls.includes(url)) {
      throw new BadRequestException(`url must be one of the ${providerCode} provider urls`);
    }
  }
}
