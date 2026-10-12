import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ViberRouteConfigRepository } from '../repositories/viber-route-config.repository';
import { ViberAccountService } from './viber-account.service';
import {
  CreateViberRouteConfig,
  GetViberRouteConfigRequest,
  PatchViberRouteConfig,
  PatchViberRouteConfigChannel,
  PatchViberRouteConfigStatus,
} from '../dtos/viber-config.dto';

@Injectable()
export class ViberRouteConfigService {
  constructor(
    private readonly routeConfigRepo: ViberRouteConfigRepository,
    private readonly accountService: ViberAccountService,
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
  }

  async updateConfig(id: string, config: PatchViberRouteConfig) {
    await this.getConfigById(id);

    await this.routeConfigRepo.updateConfig(id, config);
  }

  async updateChannel(id: string, config: PatchViberRouteConfigChannel) {
    const existing = await this.getConfigById(id);

    await this.validateAccounts(
      config.accounts.map((acc) => acc.id),
      existing.senderId,
    );

    await this.routeConfigRepo.updateConfig(id, config);
  }

  async updateStatus(id: string, { accountId, isEnabled }: PatchViberRouteConfigStatus) {
    await this.getConfigById(id);

    const updated = await this.routeConfigRepo.updateAccountStatus(id, accountId, isEnabled);

    if (!updated) {
      throw new NotFoundException('Account is not in this route config');
    }
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
}
