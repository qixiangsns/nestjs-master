import { randomUUID } from 'node:crypto';
import { ViberSender } from '../../ports/viber-sender.port';
import { SendViberResult } from '../../models/viber-message.model';

/**
 * Fake Viber provider for local end-to-end testing, every send succeeds without calling a real provider
 */
export class ViberSenderMockProvider implements ViberSender {
  sendOtp(): Promise<SendViberResult> {
    return Promise.resolve(this.success());
  }

  sendTemplateMsg(): Promise<SendViberResult> {
    return Promise.resolve(this.success());
  }

  sendContentMsg(): Promise<SendViberResult> {
    return Promise.resolve(this.success());
  }

  private success(): SendViberResult {
    const messageId = randomUUID();
    return { messageId, referenceId: `mock-${messageId}` };
  }
}
