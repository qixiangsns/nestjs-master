import { Injectable } from '@nestjs/common';
import { ViberSenderFactory } from './viber-sender.factory';
import { ViberOtp } from '../models/viber-message.model';
import { ViberAccount } from '../models/viber-account.model';
import { ViberRouteConfigManager } from './viber-route-config.manager';
import { ViberRouterService } from './viber-router.service';
import { PlayerService } from '@application/modules/player';
import { SendViberMkt, SendViberResponse, SendViberOtp, SendViberNotif } from '../dtos';
import { ViberLogService } from './viber-log.service';
import { ViberEventPublisher } from './viber-event-publisher.service';
@Injectable()
export class ViberSenderService {
  constructor(
    private readonly configManager: ViberRouteConfigManager,
    private readonly routerService: ViberRouterService,
    private readonly playerService: PlayerService,
    private readonly logService: ViberLogService,
    private readonly eventService: ViberEventPublisher,
  ) {}

  async sendViberOtp(message: ViberOtp, account: ViberAccount) {
    const sender = ViberSenderFactory.createSender(account);
    return sender.sendOtp(message);
  }

  async acceptOtpRequest(message: SendViberOtp): Promise<SendViberResponse> {
    // generate a message id
    const messageId = this.logService.generateId();

    try {
      // Get player phone number
      const phoneNo = await this.playerService.getPhoneNumber(message.playerId);
      if (!phoneNo) throw new Error(`Failed to obtain player's phone number`);

      // retrieve available config
      const routeConfig = await this.configManager.getRouteConfig('Otp', message.platformId);
      if (!routeConfig) throw new Error('No route config is available');

      // determine destination route provider
      const routeTo = this.routerService.routeTo(routeConfig);
      if (!routeTo) throw new Error('System cannot determine destination route');

      // dispatch message task to provider
      await this.eventService.publishOtpRequested(routeTo, {
        id: messageId,
        platformId: message.platformId,
        playerId: message.playerId,
        phoneNo,
        type: 'Otp',
        otp: message.otp,
        otpValidityMinutes: message.otpValidityMinutes,
        deliverBy: routeTo,
        templateId: message.templateId,
      });
      return { messageId };
    } catch (err) {
      await this.eventService.publishLogCreated({
        id: messageId,
        platformId: message.platformId,
        playerId: message.playerId,
        deliveryStatus: 'Failed',
        requestStatus: 'Failed',
        type: 'Otp',
        content: message.otp,
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
      const routeTo = this.routerService.routeTo(routeConfig);
      if (!routeTo) throw new Error('System cannot determine destination route');

      // dispatch message task to provider
      await this.eventService.publishOtpRequested(routeTo, {
        id: messageId,
        phoneNo,
        platformId: message.platformId,
        type: 'Template',
        templateId: message.templateId,
        templateLang: 'en',
        templateParams: message.templateParams,
        playerId: message.playerId,
        deliverBy: routeTo,
      });
      return { messageId };
    } catch (err) {
      await this.eventService.publishLogCreated({
        id: messageId,
        platformId: message.platformId,
        playerId: message.playerId,
        deliveryStatus: 'Failed',
        requestStatus: 'Failed',
        type: 'Otp',
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
      const routeTo = this.routerService.routeTo(routeConfig);
      if (!routeTo) throw new Error('System cannot determine destination route');

      // dispatch message task to provider
      await this.eventService.publishMktRequested(routeTo, {
        id: messageId,
        phoneNo,
        platformId: message.platformId,
        type: 'Content',
        deliverBy: routeTo,
        playerId: message.playerId,
        campaignId: message.campaignId,
        campaignSender: message.campaignSender,
        templateContent: {
          contentType: 'ImageButton',
          buttonText: 'Click here',
          imageUrl: 'https://',
          buttonUrl: 'https://',
        },
      });
      return { messageId };
    } catch (err) {
      await this.eventService.publishLogCreated({
        id: messageId,
        platformId: message.platformId,
        playerId: message.playerId,
        deliveryStatus: 'Failed',
        requestStatus: 'Failed',
        type: 'Mkt',
      });
      throw new Error('Message has failed', { cause: err });
    }
  }
}
