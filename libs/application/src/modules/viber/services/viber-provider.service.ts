import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ViberProviderCodes, ViberProvider } from '../models/viber-provider.model';
import { ViberProviderRepository } from '../repositories/viber-provider.repository';

@Injectable()
export class ViberProviderService {
  private readonly logger = new Logger(ViberProviderService.name);

  constructor(private readonly providerRepo: ViberProviderRepository) {}
  async addProvider(provider: ViberProvider) {
    const existingProvider = await this.providerRepo.findOne(provider.code);

    if (existingProvider) {
      throw new BadRequestException('Provider must be unique');
    }

    await this.providerRepo.add(provider);
  }

  async getAllProviders() {
    const providers = await this.providerRepo.getAll();
    return providers;
  }

  async getProviderCodes() {
    return ViberProviderCodes;
  }

  async updateProvider(id: string, provider: Partial<ViberProvider>) {
    const providerBeforeUpdate = await this.providerRepo.update(id, provider);

    this.logger.log('Provider updated', {
      before: providerBeforeUpdate,
      after: provider,
      id,
    });
  }
}
