import { Logger } from '@nestjs/common';
import axios, { AxiosInstance, HttpStatusCode, Method } from 'axios';
import { PUSHFY_SUCCESS_STATUS, PushfyEndpoint } from './pushfy.constant.js';
import { PushfyError } from './pushfy.error.js';
import { BalanceResponse, ClientOptions, SendSmsRequest, SendSmsResponse } from './pushfy.types.js';

export class PushfyClient {
  private readonly logger = new Logger(PushfyClient.name);
  private readonly http: AxiosInstance;

  constructor(private readonly options: ClientOptions) {
    this.http = axios.create({
      baseURL: this.options.baseUrl,
      timeout: this.options.timeoutMs || 10_000,
      headers: {
        Authorization: `Bearer ${this.options.token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  private async request<T = unknown>(
    endpoint: string,
    method: Method,
    body?: Record<string, unknown>,
  ): Promise<T> {
    try {
      const response = await this.http.request<T>({ url: endpoint, method, data: body });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new PushfyError('http_error', error.response.status, error.message);
      }

      throw new Error('Pushfy provider error', { cause: error });
    }
  }

  async sendSms(payload: SendSmsRequest) {
    const { to, text, senderId, messageId } = payload;

    const body = {
      messages: [
        {
          destinations: [{ to }],
          from: senderId,
          text,
          ...(messageId ? { ext_id: messageId } : {}),
        },
      ],
    };

    this.logger.log('Pushfy send sms request', {
      messageId,
      endpoint: PushfyEndpoint.SEND_SMS,
      body,
    });
    const response = await this.request<SendSmsResponse>(PushfyEndpoint.SEND_SMS, 'POST', body);
    this.logger.log('Pushfy send sms response', { messageId, response });

    if (!response.accepted || response.accepted <= 0 || !response.message_id) {
      throw new PushfyError(
        'send_failed',
        HttpStatusCode.BadRequest,
        response.error ?? 'Pushfy SMS failed',
      );
    }

    return { messageId: response.message_id };
  }

  /** Returns remaining SMS credits, not a currency balance. */
  async getBalance(): Promise<number> {
    const response = await this.request<BalanceResponse>(PushfyEndpoint.BALANCE, 'GET');

    if (response.status !== PUSHFY_SUCCESS_STATUS || response.balance === undefined) {
      throw new PushfyError(
        'balance_failed',
        HttpStatusCode.BadRequest,
        response.error ?? 'Failed to get balance',
      );
    }

    return Number(response.balance);
  }
}

/** Example
const sender = new PushfyClient({
  baseUrl: 'https://api.pushfy.com',
  token: 'xxxxx',
});
 */
