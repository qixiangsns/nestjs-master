import { Logger } from '@nestjs/common';
import axios, { AxiosInstance, HttpStatusCode, Method } from 'axios';
import {
  TELESIGN_MESSAGE_IN_PROGRESS,
  TelesignEndpoint,
  TelesignMessageType,
} from './telesign.constant.js';
import { TelesignError } from './telesign.error.js';
import { ClientOptions, SendSmsRequest, SendSmsResponse } from './telesign.types.js';

export class TelesignClient {
  private readonly logger = new Logger(TelesignClient.name);
  private readonly http: AxiosInstance;

  constructor(private readonly options: ClientOptions) {
    const basic = Buffer.from(`${this.options.customerId}:${this.options.apiKey}`).toString(
      'base64',
    );

    this.http = axios.create({
      baseURL: this.options.baseUrl,
      timeout: this.options.timeoutMs || 10_000,
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  /** Telesign takes form-encoded bodies and answers with JSON. */
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
        throw new TelesignError(error.response.status, error.response.status, error.message);
      }

      throw new Error('Telesign provider error', { cause: error });
    }
  }

  async sendSms(payload: SendSmsRequest) {
    const { to, text, senderId, messageType = TelesignMessageType.OTP } = payload;

    const body = {
      phone_number: to,
      message: text,
      message_type: messageType,
      ...(senderId ? { sender_id: senderId } : {}),
    };

    this.logger.log('Telesign send sms request', { endpoint: TelesignEndpoint.SEND_SMS, body });
    const response = await this.request<SendSmsResponse>(TelesignEndpoint.SEND_SMS, 'POST', body);
    this.logger.log('Telesign send sms response', { response });

    if (response.status?.code !== TELESIGN_MESSAGE_IN_PROGRESS || !response.reference_id) {
      throw new TelesignError(
        response.status?.code,
        HttpStatusCode.BadRequest,
        response.status?.description ?? 'SMS Failed',
      );
    }

    return { messageId: response.reference_id };
  }
}

/** Example
const sender = new TelesignClient({
  baseUrl: 'https://rest-api.telesign.com',
  customerId: 'xxxxx',
  apiKey: 'xxxxx',
});
 */
