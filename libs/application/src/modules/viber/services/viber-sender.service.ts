import { Injectable } from '@nestjs/common';
import { ViberRouteConfigManager } from './viber-route-config.manager';
import { PlayerService } from '@application/modules/player';
import { SendViberMkt, SendViberResponse, SendViberOtp, SendViberNotif } from '../dtos';
import { ViberLogService } from './viber-log.service';
import { ViberEventService } from './viber-event.service';
import { Chance } from 'chance';
import { RoutableViberRouteConfig } from '../models/viber-route-config.model';
import { ViberDispatcherService } from './viber-dispatcher.service';

@Injectable()
export class ViberSenderService {
  constructor(
    private readonly configManager: ViberRouteConfigManager,
    private readonly playerService: PlayerService,
    private readonly logService: ViberLogService,
    private readonly eventService: ViberEventService,
    private readonly dispatcherService: ViberDispatcherService,
  ) {}

  async acceptOtpRequest(message: SendViberOtp): Promise<SendViberResponse> {
    // generate a message id
    const messageId = this.logService.generateId();

    try {
      // Get player phone number
      const phoneNo = await this.playerService.getPhoneNumber(message.playerId);
      if (!phoneNo) throw new Error(`Failed to obtain player's phone number`);

      // retrieve available config (including disabled routes)
      const routeConfig = await this.configManager.getRouteConfig('Otp', message.platformId);
      if (!routeConfig) throw new Error('No route config is available');

      // determine destination route provider
      const routeTo = this.determineRoute(routeConfig);
      if (!routeTo) throw new Error('Viber route cannnot be determined');

      // dispatch request to viber worker
      await this.dispatcherService.dispatchOtp(
        {
          type: 'Otp',
          routeType: 'Otp',
          phoneNo,
          senderId: routeConfig.senderId,
          id: messageId,
          otp: message.otp,
          otpValidityMinutes: message.otpValidityMinutes,
          playerId: message.playerId,
          platformId: message.platformId,
          templateId: message.templateId,
        },
        routeTo,
      );

      return { messageId };
    } catch (err) {
      await this.eventService.publishLogCreated({
        type: 'Otp',
        id: messageId,
        platformId: message.platformId,
        playerId: message.playerId,
        content: message.otp,
        deliveryStatus: 'Failed',
        requestStatus: 'Failed',
      });
      throw new Error('Message has failed', { cause: err });
    }
  }

  async acceptNotifRequest(message: SendViberNotif): Promise<SendViberResponse> {
    // generate a message id
    const messageId = this.logService.generateId();

    try {
      // Get player phone number
      const phoneNo = await this.playerService.getPhoneNumber(message.playerId);
      if (!phoneNo) throw new Error(`Failed to obtain player's phone number`);

      // retrieve available config
      const routeConfig = await this.configManager.getRouteConfig('Notif', message.platformId);
      if (!routeConfig) throw new Error('No route config is available');

      // determine destination route provider
      const routeTo = this.determineRoute(routeConfig);
      if (!routeTo) throw new Error('System cannot determine destination route');

      // dispatch request to viber worker
      await this.dispatcherService.dispatchNotif(
        {
          type: 'Template',
          routeType: 'Notif',
          phoneNo,
          senderId: routeConfig.senderId,
          id: messageId,
          playerId: message.playerId,
          platformId: message.platformId,
          templateId: message.templateId,
          templateLang: 'en',
          templateParams: message.templateParams,
        },
        routeTo,
      );
      return { messageId };
    } catch (err) {
      await this.eventService.publishLogCreated({
        type: 'Otp',
        id: messageId,
        platformId: message.platformId,
        playerId: message.playerId,
        deliveryStatus: 'Failed',
        requestStatus: 'Failed',
      });
      throw new Error('Message has failed', { cause: err });
    }
  }

  async acceptMktRequest(message: SendViberMkt): Promise<SendViberResponse> {
    // generate a message id
    const messageId = this.logService.generateId();

    try {
      // Get player phone number
      const phoneNo = await this.playerService.getPhoneNumber(message.playerId);
      if (!phoneNo) throw new Error(`Failed to obtain player's phone number`);

      // retrieve available config
      const routeConfig = await this.configManager.getRouteConfig('Mkt', message.platformId);
      if (!routeConfig) throw new Error('No route config is available');

      // determine destination route provider
      const routeTo = this.determineRoute(routeConfig);
      if (!routeTo) throw new Error('System cannot determine destination route');

      // dispatch request to provider worker
      await this.dispatcherService.dispatchMkt(
        {
          type: 'Content',
          routeType: 'Mkt',
          phoneNo,
          senderId: routeConfig.senderId,
          id: messageId,
          playerId: message.playerId,
          platformId: message.platformId,
          templateContent: message.content,
        },
        routeTo,
      );
      return { messageId };
    } catch (err) {
      await this.eventService.publishLogCreated({
        type: 'Mkt',
        id: messageId,
        platformId: message.platformId,
        playerId: message.playerId,
        campaignId: message.campaignId,
        campaignSender: message.campaignSender,
        deliveryStatus: 'Failed',
        requestStatus: 'Failed',
      });
      throw new Error('Message has failed', { cause: err });
    }
  }

  /**
   * Determine the routable account based on configured weights
   */
  private determineRoute(routeConfig: RoutableViberRouteConfig) {
    const chance = new Chance();
    const enabledAccounts = routeConfig.accounts.filter((acc) => acc.isEnabled);

    if (enabledAccounts.length === 0) return null;

    const selectedAccount = chance.weighted(
      enabledAccounts,
      enabledAccounts.map((acc) => acc.weight),
    );

    return selectedAccount;
  }
}
