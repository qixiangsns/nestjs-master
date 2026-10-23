import { Logger } from '@nestjs/common';
import axios, { AxiosInstance, HttpStatusCode, Method } from 'axios';
import {
  SEMAPHORE_FAILED_STATUSES,
  SemaphoreEndpoint,
  SemaphoreMessagePath,
} from './semaphore.constant.js';
import { SemaphoreError } from './semaphore.error.js';
import {
  BalanceResponse,
  ClientOptions,
  SendSmsRequest,
  SendSmsResponse,
} from './semaphore.types.js';

/** Semaphore's OTP path wants the code on its own; fall back to reading it out of the body. */
const OTP_PATTERN = /\b\d{4}\b/;

export class SemaphoreClient {
  private readonly logger = new Logger(SemaphoreClient.name);
  private readonly http: AxiosInstance;

  constructor(private readonly options: ClientOptions) {
    this.http = axios.create({
      baseURL: this.options.baseUrl,
      timeout: this.options.timeoutMs || 10_000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private async request<T = unknown>(
    endpoint: string,
    method: Method,
    body?: Record<string, unknown>,
    params?: Record<string, string>,
  ): Promise<T> {
    try {
      const response = await this.http.request<T>({ url: endpoint, method, data: body, params });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new SemaphoreError('http_error', error.response.status, error.message);
      }

      throw new Error('Semaphore provider error', { cause: error });
    }
  }

  private extractOtp(text: string): string | undefined {
    return OTP_PATTERN.exec(text)?.[0];
  }

  async sendSms(payload: SendSmsRequest) {
    const { to, text, senderId, path = SemaphoreMessagePath.MESSAGES, code } = payload;
    const endpoint = `${SemaphoreEndpoint.SEND_SMS}/${path}`;

    const body = {
      apikey: this.options.apiKey,
      number: to,
      message: text,
      sendername: senderId ?? '',
      ...(path === SemaphoreMessagePath.OTP ? { code: code ?? this.extractOtp(text) } : {}),
    };

    this.logger.log('Semaphore send sms request', {
      endpoint,
      body: { ...body, apikey: undefined },
    });
    const response = await this.request<SendSmsResponse>(endpoint, 'POST', body);
    this.logger.log('Semaphore send sms response', { response });

    const [message] = response ?? [];

    if (!message?.message_id || SEMAPHORE_FAILED_STATUSES.includes(message.status)) {
      throw new SemaphoreError(
        message?.status ?? 'unknown',
        HttpStatusCode.BadRequest,
        'SMS Failed',
      );
    }

    return { messageId: String(message.message_id), status: message.status };
  }

  async getBalance(): Promise<number> {
    const response = await this.request<BalanceResponse>(
      SemaphoreEndpoint.BALANCE,
      'GET',
      undefined,
      {
        apikey: this.options.apiKey,
      },
    );

    if (response.credit_balance === undefined) {
      throw new SemaphoreError(
        'balance_failed',
        HttpStatusCode.BadRequest,
        'Failed to get balance',
      );
    }

    return Number(response.credit_balance);
  }
}

/** Example
const sender = new SemaphoreClient({
  baseUrl: 'https://api.semaphore.co',
  apiKey: 'xxxxx',
});
 */
