import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ViberRouteConfigRepository } from '../repositories/viber-route-config.repository';
import { ViberAccountService } from './viber-account.service';
import { CreateViberRouteConfig, GetViberRouteConfigRequest } from '../dtos/viber-config.dto';

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

    const accounts = await this.accountService.findAccounts(config.accounts.map((acc) => acc.id));

    if (accounts.length !== config.accounts.length) {
      throw new BadRequestException('One or more accounts do not exist');
    }

    if (accounts.some((acc) => !acc.senderIds.includes(config.senderId))) {
      throw new BadRequestException(`All accounts must support sender id ${config.senderId}`);
    }

    await this.routeConfigRepo.addConfig(config);
  }
}
