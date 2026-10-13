import { Injectable, Logger } from '@nestjs/common';
import { ViberProviderService } from '@application/modules/viber';
import { VIBER_PROVIDERS } from './viber-provider.seed';

@Injectable()
export class ViberSeeder {
  private readonly logger = new Logger(ViberSeeder.name);

  constructor(private readonly providerService: ViberProviderService) {}

  async seed(): Promise<void> {
    for (const provider of VIBER_PROVIDERS) {
      await this.providerService.saveProvider(provider);
    }
    this.logger.log({ count: VIBER_PROVIDERS.length }, 'Viber providers seeded');
  }
}
