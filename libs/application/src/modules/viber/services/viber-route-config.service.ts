import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ViberRouteConfigRepository } from '../repositories/viber-route-config.repository';
import { ViberAccountRepository } from '../repositories/viber-account.repository';
import { ViberAccountService } from './viber-account.service';
import { ViberSignalBroadcaster } from '../signals/viber-signal.broadcaster';
import { CreateViberRouteConfig, GetViberRouteConfigRequest, PatchViberRouteConfig } from '../dtos/viber-config.dto';

@Injectable()
export class ViberRouteConfigService {
  constructor(
    private readonly routeConfigRepo: ViberRouteConfigRepository,
    private readonly accountRepo: ViberAccountRepository,
    private readonly accountService: ViberAccountService,
    private readonly signalBroadcaster: ViberSignalBroadcaster,
  ) {}

  async getConfig({ platformId, routeType }: GetViberRouteConfigRequest) {
    const config = await this.routeConfigRepo.findConfig(routeType, platformId);

    if (!config) {
      throw new NotFoundException('Viber route config not found');
    }

    return config;
  }

  async addConfig(config: CreateViberRouteConfig) {
    const existing = await this.routeConfigRepo.findConfig(config.type, config.platformId);

    if (existing) {
      throw new ConflictException(`Route config for ${config.platformId} ${config.type} already exists`);
    }

    await this.validateAccounts(
      config.accounts.map((acc) => acc.id),
      config.senderId,
    );

    await this.routeConfigRepo.addConfig(config);
    await this.syncAccountsStatus(config.accounts.map((acc) => acc.id));
  }

  async updateConfig(id: string, config: PatchViberRouteConfig) {
    const existing = await this.getConfigById(id);

    await this.validateAccounts(
      config.accounts.map((acc) => acc.id),
      config.senderId,
    );

    await this.routeConfigRepo.updateConfig(id, config);
    await this.syncAccountsStatus([...existing.accounts, ...config.accounts].map((acc) => acc.id));
  }

  private async getConfigById(id: string) {
    const config = await this.routeConfigRepo.findConfigById(id);

    if (!config) {
      throw new NotFoundException('Viber route config not found');
    }

    return config;
  }

  private async validateAccounts(accountIds: string[], senderId: string) {
    const accounts = await this.accountService.findAccounts(accountIds);

    if (accounts.length !== accountIds.length) {
      throw new BadRequestException('One or more accounts do not exist');
    }

    if (accounts.some((acc) => !acc.senderIds.includes(senderId))) {
      throw new BadRequestException(`All accounts must support sender id ${senderId}`);
    }
  }

  /**
   * Check if account is configured for all the routes and update its enabled status.
   * Broadcasts a signal only when the status actually changes.
   */
  private async syncAccountsStatus(accountIds: string[]) {
    for (const accountId of new Set(accountIds)) {
      const isEnabled = await this.routeConfigRepo.isAccountEnabled(accountId);
      const isChanged = await this.accountRepo.updateStatus(accountId, isEnabled);

      if (!isChanged) continue;

      if (isEnabled) {
        await this.signalBroadcaster.broadcastAccountEnabled({ accountId });
      } else {
        await this.signalBroadcaster.broadcastAccountDisabled({ accountId });
      }
    }
  }
}
