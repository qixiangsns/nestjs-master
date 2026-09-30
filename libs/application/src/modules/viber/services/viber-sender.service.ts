import { Injectable } from '@nestjs/common';
import { ViberSenderFactory } from './viber-sender.factory';
import { ViberOtp } from '../models/viber-message.model';
import { ViberAccount } from '../models/viber-account.model';
import { ViberRouteConfigManager } from './viber-route-config.manager';
import { ViberRouterService } from './viber-router.service';
import { PlayerService } from '@application/modules/player';
import { Except } from 'type-fest';
@Injectable()
export class ViberSenderService {
  constructor(
    private readonly configManager: ViberRouteConfigManager,
    private readonly routerService: ViberRouterService,
    private readonly playerService: PlayerService,
  ) {}

  async sendViberOtp(message: ViberOtp, account: ViberAccount) {
    const sender = ViberSenderFactory.createSender(account);
    return sender.sendOtp(message);
  }

  private async dispatchViberMessage(message: string, account: Except<ViberAccount, 'id' | 'createdAt' | 'updatedAt'>) {
    // publish topic
  }
  async acceptOtpRequest(message: ViberOtp, platformId: string) {
    try {
      // validate dto

      // Get player phone number
      const phoneNumber = await this.playerService.getPhoneNumber('1900000');
      if (!phoneNumber) throw new Error(`Failed to obtain player's phone number`);

      // retrieve available config
      const routeConfig = await this.configManager.getRouteConfig('Otp', platformId);
      if (!routeConfig) throw new Error('No route config is available');

      // determine destination route provider
      const routeTo = this.routerService.routeTo(routeConfig);
      if (!routeTo) throw new Error('System cannot determine destination route');

      // publish to topic
      await this.dispatchViberMessage('', routeTo);
    } catch (err) {
      await this.publishProcessedMessage();
      throw new Error('Message has failed');
    }
  }

  async acceptMktRequest() {
    // validate dto
    // retrieve config
    const routes = this.configManager.getRouteConfig('Mkt', '50');

    // selected config (routing)
    // publish to topic
  }

  async acceptNotifRequest() {
    // validate dto
    // retrieve config
    const routes = this.configManager.getRouteConfig('Notif', '50');

    // selected config (routing)
    // publish to topic
  }

  private async publishProcessedMessage() {}
}
