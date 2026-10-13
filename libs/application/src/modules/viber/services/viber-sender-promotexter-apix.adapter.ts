import { PromotexterApix } from '@application/integrations/promotexter';
import { ViberSender } from '../interfaces/viber-sender.port';
import {
  SendViberResult,
  ViberTemplateRequest,
  ViberContentRequest,
  ViberOtpRequest,
} from '../models/viber-message.model';
import { AccountDetailsRoutable } from '../models/viber-route-config.model';
import { ViberAccountSender } from '../models/viber-account.model';

export class ViberSenderPromotexterApix implements ViberSender {
  constructor(private readonly api: PromotexterApix) {}

  async sendContentMsg(message: ViberContentRequest): Promise<SendViberResult> {
    throw new Error(`${PromotexterApix.name} does not support sending viber rich content message`);
  }

  async sendTemplateMsg(message: ViberTemplateRequest): Promise<SendViberResult> {
    throw new Error(`${PromotexterApix.name} does not support sending viber template message`);
  }

  async sendOtp(message: ViberOtpRequest): Promise<SendViberResult> {
    return {
      messageId: '',
      referenceId: '',
    };
  }
}
