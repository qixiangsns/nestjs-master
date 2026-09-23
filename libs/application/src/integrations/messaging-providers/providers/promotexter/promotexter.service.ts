import { Logger } from '@nestjs/common';
import { BalanceChecker } from '../../interfaces/balance-checker.port';
import { SmsSender, Message, SmsResult } from '../../interfaces/sms-sender.port';
import { ViberSender } from '../../interfaces/viber-sender.port';
import { Config, SendSmsRequest } from './promotexter.types';

export class Promotexter implements BalanceChecker, SmsSender, ViberSender {
  private logger: Logger = new Logger(Promotexter.name);
  constructor(private readonly config: Config) {
    this.logger.log({ apiKey: this.config.apiKey, apiSecret: this.config.apiSecret }, 'Promotexter Config');
  }

  async sendViberMessage() {}

  async sendSms(request: Message): Promise<SmsResult> {
    const url = `${this.config.baseUrl}/sms/send`;
    const body: SendSmsRequest = {
      apiKey: this.config.apiKey,
      apiSecret: this.config.apiSecret,
      to: request.to,
      from: request.from,
      text: request.text,
    } as const;

    try {
      const result = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await result.json();

      return {
        success: true,
        messageId: data?.transactionId,
      };
    } catch (error) {
      return {
        success: false,
        errorCode: 'insufficient_balance',
        cause: error,
        errorMessage: `Error calling Promotexter Send SMS: (Error: ${error?.message})`,
      };
    }
  }

  async getBalance() {
    const url = new URL(`${this.config.baseUrl}/api/account/balance`);

    url.searchParams.append('apiKey', this.config.apiKey);
    url.searchParams.append('apiSecret', this.config.apiSecret);

    const result = await fetch(url, { method: 'GET' });
    const data = await result.json();
    return Number(data?.availableBalance);
  }
}
