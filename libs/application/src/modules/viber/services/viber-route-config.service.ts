import { Injectable, NotFoundException } from '@nestjs/common';
import { ViberRouteConfigRepository } from '../repositories/viber-route-config.repository';
import { GetViberRouteConfigRequest } from '../dtos/viber-config.dto';

@Injectable()
export class ViberRouteConfigService {
  constructor(private readonly routeConfigRepo: ViberRouteConfigRepository) {}

  async getConfig({ platformId, routeType }: GetViberRouteConfigRequest) {
    const config = await this.routeConfigRepo.findConfig(routeType, platformId);

    if (!config) {
      throw new NotFoundException('Viber route config not found');
    }

    return config;
  }
}
