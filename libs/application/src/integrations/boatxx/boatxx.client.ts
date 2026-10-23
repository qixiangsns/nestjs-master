import { Logger } from '@nestjs/common';
import axios, { AxiosInstance, HttpStatusCode, Method } from 'axios';
import { BOATXX_SUCCESS_CODE, BoatxxEndpoint } from './boatxx.constant.js';
import { BoatxxError } from './boatxx.error.js';
import { ClientOptions, SendSmsRequest, SendSmsResponse } from './boatxx.types.js';

export class BoatxxClient {
  private readonly logger = new Logger(BoatxxClient.name);
  private readonly http: AxiosInstance;

  constructor(private readonly options: ClientOptions) {
    this.http = axios.create({
      baseURL: this.options.baseUrl,
      timeout: this.options.timeoutMs || 10_000,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }

  /** Boatxx only accepts form-encoded bodies and always answers with JSON. */
  private async request<T = unknown>(
    endpoint: string,
    method: Method,
    body?: Record<string, string>,
  ): Promise<T> {
    try {
      const response = await this.http.request<T>({
        url: endpoint,
        method,
        data: body && new URLSearchParams(body).toString(),
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new BoatxxError('http_error', error.response.status, error.message);
      }

      throw new Error('Boatxx provider error', { cause: error });
    }
  }

  async sendSms(payload: SendSmsRequest) {
    const { to, text } = payload;

    const body = {
      appkey: this.options.appKey,
      secretkey: this.options.secretKey,
      phone: to,
      content: text,
    };

    this.logger.log('Boatxx send sms request', {
      endpoint: BoatxxEndpoint.SEND_SMS,
      body: { ...body, secretkey: undefined },
    });
    const response = await this.request<SendSmsResponse>(BoatxxEndpoint.SEND_SMS, 'POST', body);
    this.logger.log('Boatxx send sms response', { response });

    if (response.code !== BOATXX_SUCCESS_CODE || !response.messageid) {
      throw new BoatxxError(
        response.code,
        HttpStatusCode.BadRequest,
        response.result ?? 'Boatxx SMS failed',
      );
    }

    return { messageId: response.messageid };
  }
}

/** Example
const sender = new BoatxxClient({
  baseUrl: 'http://api.wftqm.com',
  appKey: 'xxxxx',
  secretKey: 'xxxxx',
});
 */
