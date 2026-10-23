import { Logger } from '@nestjs/common';
import axios, { AxiosInstance, HttpStatusCode, Method } from 'axios';
import { InfobipEndpoint, InfobipErrorId } from './infobip.constant.js';
import { InfobipError } from './infobip.error.js';
import {
  ClientOptions,
  InfobipErrorResponse,
  SendSmsRequest,
  SendSmsResponse,
} from './infobip.types.js';

/** Statuses where Infobip returns a `requestError` envelope worth surfacing as an InfobipError. */
const HANDLED_ERROR_STATUSES: number[] = [
  HttpStatusCode.BadRequest,
  HttpStatusCode.Unauthorized,
  HttpStatusCode.Forbidden,
  HttpStatusCode.TooManyRequests,
];

export class InfobipClient {
  private readonly logger = new Logger(InfobipClient.name);
  private readonly http: AxiosInstance;

  constructor(private readonly options: ClientOptions) {
    this.http = axios.create({
      baseURL: this.options.baseUrl,
      timeout: this.options.timeoutMs || 10_000,
      headers: {
        Authorization: `App ${this.options.apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
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
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError<InfobipErrorResponse>(error) && error.response) {
        const { serviceException } = error.response.data?.requestError ?? {};

        if (HANDLED_ERROR_STATUSES.includes(error.response.status)) {
          throw new InfobipError(
            serviceException?.messageId ?? InfobipErrorId.GENERAL_ERROR,
            error.response.status,
            serviceException?.text ?? error.message,
            serviceException?.validationErrors,
          );
        }
      }

      throw new Error('Infobip provider error', { cause: error });
    }
  }

  async sendSms(payload: SendSmsRequest) {
    const { from, to, text, messageId } = payload;

    const body = {
      messages: [
        {
          sender: from,
          destinations: [{ to }],
          content: { text },
          ...(messageId ? { messageId } : {}),
        },
      ],
    };

    this.logger.log('Infobip send sms request', {
      messageId,
      endpoint: InfobipEndpoint.SEND_SMS,
      body,
    });
    const response = await this.request<SendSmsResponse>(InfobipEndpoint.SEND_SMS, 'POST', body);
    this.logger.log('Infobip send sms response', { messageId, response });

    const [message] = response.messages ?? [];

    if (!response.bulkId || !message?.messageId) {
      throw new InfobipError(InfobipErrorId.GENERAL_ERROR, HttpStatusCode.BadRequest, 'SMS Failed');
    }

    return message;
  }
}

/** Example
const sender = new InfobipClient({
  baseUrl: 'https://xxxxx.api.infobip.com',
  apiKey: 'xxxxx',
});
 */
