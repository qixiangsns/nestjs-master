import { Logger } from '@nestjs/common';
import axios, { AxiosInstance, HttpStatusCode, Method } from 'axios';
import { BUSYBEE_SUCCESS_CODE, BusybeeEndpoint } from './busybee.constant.js';
import { BusybeeError } from './busybee.error.js';
import {
  BalanceResponse,
  ClientOptions,
  SendSmsRequest,
  SendSmsResponse,
} from './busybee.types.js';

export class BusybeeClient {
  private readonly logger = new Logger(BusybeeClient.name);
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
        throw new BusybeeError(error.response.status, error.response.status, error.message);
      }

      throw new Error('BusyBee provider error', { cause: error });
    }
  }

  async sendSms(payload: SendSmsRequest) {
    const { to, text, senderId, registeredForDelivery = true } = payload;

    const body = {
      ClientId: this.options.clientId,
      ApiKey: this.options.apiKey,
      MobileNumbers: to,
      Message: text,
      SenderId: senderId,
      IsRegisteredForDelivery: registeredForDelivery,
    };

    this.logger.log('BusyBee send sms request', {
      endpoint: BusybeeEndpoint.SEND_SMS,
      body: { ...body, ApiKey: undefined },
    });
    const response = await this.request<SendSmsResponse>(BusybeeEndpoint.SEND_SMS, 'POST', body);
    this.logger.log('BusyBee send sms response', { response });

    const [message] = response.Data ?? [];

    if (response.ErrorCode !== BUSYBEE_SUCCESS_CODE || !message?.MessageId) {
      throw new BusybeeError(
        response.ErrorCode,
        HttpStatusCode.BadRequest,
        response.ErrorDescription ?? 'SMS Failed',
      );
    }

    return { messageId: message.MessageId };
  }

  /** Strips the currency prefix BusyBee puts on `Credits` (e.g. `PHP1234.5`). */
  async getBalance(): Promise<number> {
    const response = await this.request<BalanceResponse>(
      BusybeeEndpoint.BALANCE,
      'GET',
      undefined,
      {
        ClientId: this.options.clientId,
        ApiKey: this.options.apiKey,
      },
    );

    const [account] = response.Data ?? [];

    if (response.ErrorCode !== BUSYBEE_SUCCESS_CODE || !account?.Credits) {
      throw new BusybeeError(
        response.ErrorCode,
        HttpStatusCode.BadRequest,
        response.ErrorDescription ?? 'Failed to get balance',
      );
    }

    return Number(account.Credits.replace(/[^\d.-]/g, ''));
  }
}

/** Example
const sender = new BusybeeClient({
  baseUrl: 'https://api.busybeesms.com',
  clientId: 'xxxxx',
  apiKey: 'xxxxx',
});
 */
