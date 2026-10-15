import { PromotexterApix } from '@application/integrations/promotexter';
import { ViberSender } from '../../ports/viber-sender.port';
import {
  SendViberResult,
  ViberTemplateRequest,
  ViberContentRequest,
  ViberOtpRequest,
} from '../../models/viber-message.model';

export class ViberSenderPromotexterApix implements ViberSender {
  constructor(private readonly api: PromotexterApix) {}

  async sendContentMsg(message: ViberContentRequest): Promise<SendViberResult> {
    throw new Error(`${PromotexterApix.name} does not support sending viber rich content message`);
  }

  async sendTemplateMsg(message: ViberTemplateRequest): Promise<SendViberResult> {
    throw new Error(`${PromotexterApix.name} does not support sending viber template message`);
  }

  async sendOtp(message: ViberOtpRequest): Promise<SendViberResult> {
    const result = await this.api.sendViberOtp({
      from: message.senderId,
      to: message.phoneNo,
      referenceId: message.id,
      templateId: message.templateId,
      templateParams: { pin: message.otp },
      ttl: message.otpValidityMinutes * 60, // seconds
    });

    return {
      messageId: message.id,
      referenceId: result.transactionId,
    };
  }
}
