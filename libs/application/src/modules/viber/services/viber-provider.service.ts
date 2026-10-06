import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ViberProviderCode, ViberProvider } from '../models/viber-provider.model';
import { ViberProviderRepository } from '../repositories/viber-provider.repository';

@Injectable()
export class ViberProviderService {
  private readonly logger = new Logger(ViberProviderService.name);

  constructor(private readonly providerRepo: ViberProviderRepository) {}
  async addProvider(provider: ViberProvider) {
    const existingProvider = await this.providerRepo.findProvider(provider.code);

    if (existingProvider) {
      throw new BadRequestException('Provider must be unique');
    }

    await this.providerRepo.addProvider(provider);
  }

  async saveProvider(provider: ViberProvider) {
    await this.providerRepo.upsertProvider(provider);
    this.logger.log({ code: provider.code }, 'Provider saved');
  }

  async getAllProviders() {
    const providers = await this.providerRepo.findProviders();
    return providers;
  }

  async getProviderCodes() {
    return ViberProviderCode;
  }

  async updateProvider(id: string, provider: Partial<ViberProvider>) {
    const providerBeforeUpdate = await this.providerRepo.updateProvider(id, provider);

    this.logger.log('Provider updated', {
      before: providerBeforeUpdate,
      after: provider,
      id,
    });
  }
}
