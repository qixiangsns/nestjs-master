import { PromotexterApix } from '@application/integrations/promotexter';
import { ViberSender } from '../../ports/viber-sender.port';
import { SendViberResult, ViberOtpRequest } from '../../models/viber-message.model';

export class ViberSenderPromotexterApix implements ViberSender {
  constructor(private readonly api: PromotexterApix) {}

  sendContentMsg(): Promise<SendViberResult> {
    return Promise.reject(new Error(`${PromotexterApix.name} does not support sending viber rich content message`));
  }

  sendTemplateMsg(): Promise<SendViberResult> {
    return Promise.reject(new Error(`${PromotexterApix.name} does not support sending viber template message`));
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
