import { Logger } from '@nestjs/common';
import axios, { AxiosInstance, HttpStatusCode, Method, RawAxiosRequestHeaders } from 'axios';
import {
  DITO_SUCCESS_CODE,
  DITO_TOKEN_EXPIRY_SKEW_SECONDS,
  DitoEndpoint,
} from './dito.constant.js';
import { DitoError } from './dito.error.js';
import {
  AccessTokenResponse,
  ClientOptions,
  SendSmsRequest,
  SendSmsResponse,
} from './dito.types.js';

export class DitoClient {
  private readonly logger = new Logger(DitoClient.name);
  private readonly http: AxiosInstance;
  private accessToken?: { value: string; expiresAt: number };

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
    headers?: RawAxiosRequestHeaders,
  ): Promise<T> {
    try {
      const response = await this.http.request<T>({ url: endpoint, method, data: body, headers });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new DitoError(error.response.status, error.response.status, error.message);
      }

      throw new Error('DITO provider error', { cause: error });
    }
  }

  /**
   * Returns a cached server token, fetching a new one when it is missing or close to expiry.
   * The cache lives on this instance — share one client per account to share the token.
   */
  async getAccessToken(): Promise<string> {
    if (this.accessToken && this.accessToken.expiresAt > Date.now()) {
      return this.accessToken.value;
    }

    const body = { appId: this.options.appId, appSecret: this.options.appSecret };

    this.logger.log('DITO get server token request', {
      endpoint: DitoEndpoint.ACCESS_TOKEN,
      appId: this.options.appId,
    });
    const response = await this.request<AccessTokenResponse>(
      DitoEndpoint.ACCESS_TOKEN,
      'POST',
      body,
    );

    if (!response.accessToken) {
      throw new DitoError(
        'token_failed',
        HttpStatusCode.Unauthorized,
        'failed to get DITO server token',
      );
    }

    const ttlSeconds = Math.max((response.expires ?? 0) - DITO_TOKEN_EXPIRY_SKEW_SECONDS, 0);
    this.accessToken = { value: response.accessToken, expiresAt: Date.now() + ttlSeconds * 1000 };

    return response.accessToken;
  }

  private async send(endpoint: string, payload: SendSmsRequest) {
    const { to, text, senderId, messageId } = payload;
    const token = await this.getAccessToken();

    const body = {
      messageCategory: 'SMS',
      receivers: to,
      serviceNo: senderId,
      bodyText: text,
    };

    this.logger.log('DITO send sms request', { messageId, endpoint, body });
    const response = await this.request<SendSmsResponse>(endpoint, 'POST', body, {
      Authorization: `Bearer ${token}`,
    });
    this.logger.log('DITO send sms response', { messageId, response });

    if (response.resultCode !== DITO_SUCCESS_CODE || !response.messageId) {
      throw new DitoError(
        response.resultCode,
        HttpStatusCode.BadRequest,
        response.errorMessage ?? 'SMS Failed',
      );
    }

    return { messageId: response.messageId };
  }

  async sendSms(payload: SendSmsRequest) {
    return this.send(DitoEndpoint.SEND_SMS, payload);
  }

  async sendOtp(payload: SendSmsRequest) {
    return this.send(DitoEndpoint.SEND_OTP, payload);
  }
}

/** Example
const sender = new DitoClient({
  baseUrl: 'https://a2p.dito.ph',
  appId: 'xxxxx',
  appSecret: 'xxxxx',
});
 */
