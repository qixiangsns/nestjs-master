import { Logger } from '@nestjs/common';
import axios, { AxiosInstance, HttpStatusCode, Method, RawAxiosRequestHeaders } from 'axios';
import { MOCEAN_SUCCESS_STATUS, MoceanEndpoint } from './mocean.constant.js';
import { MoceanError } from './mocean.error.js';
import { BalanceResponse, ClientOptions, SendSmsRequest, SendSmsResponse } from './mocean.types.js';

export class MoceanClient {
  private readonly logger = new Logger(MoceanClient.name);
  private readonly http: AxiosInstance;

  constructor(private readonly options: ClientOptions) {
    this.http = axios.create({
      baseURL: this.options.baseUrl,
      timeout: this.options.timeoutMs || 10_000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private authHeaders(): RawAxiosRequestHeaders {
    return this.options.auth.type === 'bearer_token'
      ? { Authorization: `Bearer ${this.options.auth.token}` }
      : {};
  }

  /** With api key auth the credentials ride in the payload itself, not in a header. */
  private authPayload(): Record<string, string> {
    if (this.options.auth.type !== 'api_key') return {};

    const { apiKey, apiSecret } = this.options.auth;
    return { 'mocean-api-key': apiKey, 'mocean-api-secret': apiSecret };
  }

  private async request<T = unknown>(
    endpoint: string,
    method: Method,
    body?: Record<string, unknown>,
    params?: Record<string, string>,
  ): Promise<T> {
    try {
      const response = await this.http.request<T>({
        url: endpoint,
        method,
        data: body,
        params,
        headers: this.authHeaders(),
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new MoceanError(error.response.status, error.response.status, error.message);
      }

      throw new Error('Mocean provider error', { cause: error });
    }
  }

  async sendSms(payload: SendSmsRequest) {
    const { to, text, senderId, callbackUrl } = payload;

    const body = {
      'mocean-from': senderId,
      'mocean-to': to,
      'mocean-text': text,
      ...(callbackUrl ? { 'mocean-dlr-url': callbackUrl } : {}),
      ...this.authPayload(),
    };

    this.logger.log('Mocean send sms request', {
      endpoint: MoceanEndpoint.SEND_SMS,
      body: { ...body, 'mocean-api-secret': undefined },
    });
    const response = await this.request<SendSmsResponse>(MoceanEndpoint.SEND_SMS, 'POST', body);
    this.logger.log('Mocean send sms response', { response });

    const messages = response.messages ?? [];
    const [first] = messages;

    if (first?.status !== MOCEAN_SUCCESS_STATUS) {
      throw new MoceanError(
        first?.status,
        HttpStatusCode.BadRequest,
        first?.err_msg ?? 'SMS Failed',
      );
    }

    /** A long message is split into parts, each with its own id. */
    const messageIds = messages
      .map((message) => message.msgid)
      .filter((msgid): msgid is string => Boolean(msgid));

    return { messageId: messageIds[0], messageIds };
  }

  async getBalance(): Promise<number> {
    const response = await this.request<BalanceResponse>(MoceanEndpoint.BALANCE, 'GET', undefined, {
      'mocean-resp-format': 'JSON',
      ...this.authPayload(),
    });

    if (response.status !== MOCEAN_SUCCESS_STATUS || response.value === undefined) {
      throw new MoceanError(
        response.status,
        HttpStatusCode.BadRequest,
        response.err_msg ?? 'Failed to get balance',
      );
    }

    return Number(response.value);
  }
}

/** Example
const sender = new MoceanClient({
  baseUrl: 'https://rest.moceanapi.com',
  auth: { type: 'api_key', apiKey: 'xxxxx', apiSecret: 'xxxxx' },
});
 */
