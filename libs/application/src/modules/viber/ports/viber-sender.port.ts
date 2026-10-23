import {
  SendViberResult,
  ViberTemplateRequest,
  ViberContentRequest,
  ViberOtpRequest,
} from '../models/viber-message.model.js';

export interface ViberSender {
  /**
   * Send approved OTP message
   * Usage: OTP message
   */
  sendOtp: (message: ViberOtpRequest) => Promise<SendViberResult>;
  /**
   * Send pre-approved template message
   * Usage: transactional/OTP message
   */
  sendTemplateMsg: (message: ViberTemplateRequest) => Promise<SendViberResult>;
  /**
   * Send free-form messages with UI components (Eg: image, carousel, text)
   * Usage: conversational/promotional message
   */
  sendContentMsg: (message: ViberContentRequest) => Promise<SendViberResult>;
}
