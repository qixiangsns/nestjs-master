import { Injectable } from '@nestjs/common';
import { RouteAccount, RouteType, ViberRouteConfig } from '../models/viber-route-config.model';
import { ViberRouteConfigRepository } from '../repositories/viber-route-config.repository';
import { ViberAccountRepository } from '../repositories/viber-account.repository';

@Injectable()
export class ViberRouteConfigService {
  constructor(
    private readonly configRepo: ViberRouteConfigRepository,
    private readonly accountRepo: ViberAccountRepository,
  ) {}

  async updateConfig(id: string, config: ViberRouteConfig) {
    await this.configRepo.updateConfig(id, config);
    await this.syncAccountsStatus(config.accounts);
  }

  /**
   * Check if account is configured for all the routes and update its enabled status
   */
  private async syncAccountsStatus(accounts: RouteAccount[]) {
    const accountIds = new Set(accounts.map((acc) => acc.id));

    // sync account status
    for (const account of accounts) {
      const isEnabled = await this.configRepo.isAccountEnabled(account.id);
      await this.accountRepo.updateStatus(account.id, isEnabled);
    }
  }
}
