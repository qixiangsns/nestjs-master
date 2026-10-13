import { randomUUID } from 'node:crypto';
import { ViberSender } from '../interfaces/viber-sender.port';
import {
  SendViberResult,
  ViberContentRequest,
  ViberOtpRequest,
  ViberTemplateRequest,
} from '../models/viber-message.model';
import { AccountDetailsRoutable } from '../models/viber-route-config.model';

/**
 * Fake Viber provider for local end-to-end testing, every send succeeds without calling a real provider
 */
export class ViberSenderMockProvider implements ViberSender {
  constructor(private readonly account: AccountDetailsRoutable) {}

  async sendOtp(message: ViberOtpRequest): Promise<SendViberResult> {
    return this.success();
  }

  async sendTemplateMsg(message: ViberTemplateRequest): Promise<SendViberResult> {
    return this.success();
  }

  async sendContentMsg(message: ViberContentRequest): Promise<SendViberResult> {
    return this.success();
  }

  private success(): SendViberResult {
    const messageId = randomUUID();
    return { messageId, referenceId: `mock-${messageId}` };
  }
}
