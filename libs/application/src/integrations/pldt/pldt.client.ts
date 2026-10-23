import { Logger } from '@nestjs/common';
import axios, { AxiosInstance, HttpStatusCode, Method } from 'axios';
import { PLDT_REPLY_TO_TON_URL, PLDT_SUCCESS_RESPONSE, PldtEndpoint } from './pldt.constant.js';
import { PldtError } from './pldt.error.js';
import { ClientOptions, QueryMessageRequest, SendSmsRequest } from './pldt.types.js';

export class PldtClient {
  private readonly logger = new Logger(PldtClient.name);
  private readonly http: AxiosInstance;

  constructor(private readonly options: ClientOptions) {
    this.http = axios.create({
      baseURL: this.options.baseUrl,
      timeout: this.options.timeoutMs || 10_000,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      responseType: 'text',
    });
  }

  /** The gateway is form-encoded in and plain text out, for both send and query. */
  private async request(
    endpoint: string,
    method: Method,
    body?: Record<string, string>,
    params?: Record<string, string>,
  ): Promise<string> {
    try {
      const response = await this.http.request<string>({
        url: endpoint,
        method,
        data: body && new URLSearchParams(body).toString(),
        params,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new PldtError('http_error', error.response.status, error.message);
      }

      throw new Error('PLDT provider error', { cause: error });
    }
  }

  async sendSms(payload: SendSmsRequest) {
    const { to, text, senderId, callbackUrl, registered = true } = payload;

    const body = {
      username: this.options.username,
      password: this.options.password,
      destination: to,
      text,
      source: senderId,
      registered: registered ? '1' : '0',
      ...(callbackUrl ? { replyTo: callbackUrl, replyToTON: String(PLDT_REPLY_TO_TON_URL) } : {}),
    };

    this.logger.log('PLDT send sms request', {
      endpoint: PldtEndpoint.SEND_SMS,
      body: { ...body, password: undefined },
    });
    const response = await this.request(PldtEndpoint.SEND_SMS, 'POST', body);
    this.logger.log('PLDT send sms response', { response });

    if (!response.includes(PLDT_SUCCESS_RESPONSE)) {
      throw new PldtError(
        'send_failed',
        HttpStatusCode.BadRequest,
        response.trim() || 'SMS Failed',
      );
    }

    /** Accepted responses look like `0 001 OK: <messageId>`. */
    const [, messageId] = response.split(': ');

    return { messageId: messageId?.trim() };
  }

  /** Returns the gateway's raw plain-text status line for a previously sent message. */
  async queryMessage(payload: QueryMessageRequest): Promise<string> {
    const response = await this.request(PldtEndpoint.QUERY_MESSAGE, 'GET', undefined, {
      username: this.options.username,
      password: this.options.password,
      msg_id: payload.messageId,
    });

    this.logger.log('PLDT query message response', { messageId: payload.messageId, response });

    return response;
  }
}

/** Example
const sender = new PldtClient({
  baseUrl: 'https://cgpsms.smart.com.ph',
  username: 'xxxxx',
  password: 'xxxxx',
});
 */
