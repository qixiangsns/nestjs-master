import { Logger } from '@nestjs/common';
import { createHash } from 'node:crypto';
import axios, { AxiosInstance, HttpStatusCode, Method, RawAxiosRequestHeaders } from 'axios';
import { LAAFFIC_SUCCESS_STATUS, LaafficEndpoint } from './laaffic.constant.js';
import { LaafficError } from './laaffic.error.js';
import { ClientOptions, SendSmsRequest, SendSmsResponse } from './laaffic.types.js';

export class LaafficClient {
  private readonly logger = new Logger(LaafficClient.name);
  private readonly http: AxiosInstance;

  constructor(private readonly options: ClientOptions) {
    this.http = axios.create({
      baseURL: this.options.baseUrl,
      timeout: this.options.timeoutMs || 10_000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /** Laaffic signs every call with `md5(apiKey + apiSecret + unixSeconds)`. */
  private authHeaders(): RawAxiosRequestHeaders {
    const timestamp = Math.floor(Date.now() / 1000);
    const sign = createHash('md5')
      .update(this.options.apiKey + this.options.apiSecret + timestamp)
      .digest('hex');

    return {
      Sign: sign,
      Timestamp: timestamp,
      'Api-Key': this.options.apiKey,
    };
  }

  private async request<T = unknown>(
    endpoint: string,
    method: Method,
    body?: Record<string, unknown>,
  ): Promise<T> {
    try {
      const response = await this.http.request<T>({
        url: endpoint,
        method,
        data: body,
        headers: this.authHeaders(),
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new LaafficError('http_error', error.response.status, error.message);
      }

      throw new Error('Laaffic provider error', { cause: error });
    }
  }

  async sendSms(payload: SendSmsRequest) {
    const { to, text, appId, senderName, messageId } = payload;

    const body = {
      appId,
      numbers: to,
      content: text,
      senderId: senderName,
      orderId: messageId,
    };

    this.logger.log('Laaffic send sms request', {
      messageId,
      endpoint: LaafficEndpoint.SEND_SMS,
      body: { ...body, appId: undefined },
    });
    const response = await this.request<SendSmsResponse>(LaafficEndpoint.SEND_SMS, 'POST', body);
    this.logger.log('Laaffic send sms response', { messageId, response });

    const [message] = response.array ?? [];

    if (response.status !== LAAFFIC_SUCCESS_STATUS || !message?.msgId) {
      throw new LaafficError(
        response.status,
        HttpStatusCode.BadRequest,
        response.reason ?? 'SMS Failed',
      );
    }

    return { messageId: message.msgId };
  }
}

/** Example
const sender = new LaafficClient({
  baseUrl: 'https://api.laaffic.com',
  apiKey: 'xxxxx',
  apiSecret: 'xxxxx',
});
 */
