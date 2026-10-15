import { PromotexterApi, SendViberRichMsgRequest, SendViberResponse } from '@application/integrations/promotexter';
import { ViberSender } from '../../ports/viber-sender.port';
import {
  SendViberResult,
  ViberContentRequest,
  ViberOtpRequest,
  ViberTemplateRequest,
} from '../../models/viber-message.model';
export class ViberSenderPromotexter implements ViberSender {
  constructor(private readonly api: PromotexterApi) {}

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

  async sendTemplateMsg(message: ViberTemplateRequest): Promise<SendViberResult> {
    const result = await this.api.sendTemplate({
      from: message.senderId,
      to: message.phoneNo,
      referenceId: message.id,
      templateId: message.templateId,
      templateParams: message.templateParams,
      templateLang: message.templateLang,
    });

    return {
      messageId: message.id,
      referenceId: result.transactionId,
    };
  }

  async sendContentMsg(message: ViberContentRequest): Promise<SendViberResult> {
    const result = await this.api.sendRichMessage({
      from: message.senderId,
      to: message.phoneNo,
      referenceId: message.id,
      ...this.toRichContent(message.templateContent),
    });

    return {
      messageId: message.id,
      referenceId: result.transactionId,
    };
  }

  /**
   * Map platform content components to Promotexter rich message fields
   */
  private toRichContent(content: ViberContentRequest['templateContent']): Partial<SendViberRichMsgRequest> {
    switch (content.contentType) {
      case 'TextOnly':
        return { text: content.text };
      case 'TextButton':
        return { text: content.text, url: content.buttonUrl, caption: content.buttonText };
      case 'ImageOnly':
        return { image: content.imageUrl };
      case 'ImageText':
        return { image: content.imageUrl, text: content.text };
      case 'ImageButton':
        return { image: content.imageUrl, url: content.buttonUrl, caption: content.buttonText };
      case 'ImageButtonText':
        return {
          image: content.imageUrl,
          text: content.text,
          url: content.buttonUrl,
          caption: content.buttonText,
        };
      case 'VideoOnly':
        return { video: content.videoUrl };
      case 'VideoText':
        return { video: content.videoUrl, text: content.text };
      case 'VideoButton':
        return { video: content.videoUrl, url: content.buttonUrl, caption: content.buttonText };
      case 'VideoButtonText':
        return {
          video: content.videoUrl,
          url: content.buttonUrl,
          caption: content.buttonText,
          text: content.text,
        };
    }
  }
}
