import { Injectable } from '@nestjs/common';
import { ViberSenderFactory } from './viber-sender.factory';
import { ViberOtp } from '../models/viber-message.model';
import { ViberAccount } from '../models/viber-account.model';
import { ViberRouteConfigManager } from './viber-route-config.manager';

@Injectable()
export class ViberSenderService {
  constructor(private readonly configManager: ViberRouteConfigManager) {}

  async dispatchOtp(message: ViberOtp, account: ViberAccount) {
    const sender = ViberSenderFactory.createSender(account);
    return sender.sendViberOtp(message);
  }

  async acceptOtpRequest() {
    // validate dto
    // retrieve config

    this.configManager.getRouteConfig();
    // selected config (routing)
    // publish to topic
  }

  async acceptMktRequest() {
    // validate dto
    // retrieve config
    this.configManager.getRouteConfig();

    // selected config (routing)
    // publish to topic
  }

  async acceptNotifRequest() {
    // validate dto
    // retrieve config
    this.configManager.getRouteConfig();

    // selected config (routing)
    // publish to topic
  }

  private async publishNewMessage() {}
  private async publishProcessedMessage() {}
}
