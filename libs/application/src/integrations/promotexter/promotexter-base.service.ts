import axios, { AxiosInstance, RawAxiosRequestHeaders, HttpStatusCode, Method } from 'axios';
import * as jwt from 'jsonwebtoken';
import { PromotexterError } from './promotexter.error';
import {
  ClientOptions,
  SendViberResponse,
  SendViberOtpRequest,
  PromotexterErrorResponse,
  GenerateTokenRequest,
  GenerateTokenResponse,
  SendSmsRequest,
  SendSmsResponse,
} from './promotexter.types';

export class PromotexterBase {
  private readonly client: AxiosInstance;
  private readonly accountClient: AxiosInstance;

  constructor(private readonly options: ClientOptions) {
    this.client = axios.create({
      baseURL: this.options.baseUrl,
      timeout: this.options.timeoutMs || 10_000,
    });

    this.accountClient = axios.create({
      baseURL: this.options.accountBaseUrl || 'https://api.promotexter.com',
      timeout: this.options.timeoutMs || 10_000,
    });
  }

  private generateClientToken(privateKey: string, accountId: string) {
    const token = jwt.sign({}, privateKey, {
      issuer: accountId,
      algorithm: 'RS512',
      expiresIn: '1m',
    });

    return token;
  }

  async generateApiToken(privateKey: string, accountId: string, expiresInSeconds: number = 3600) {
    const clientToken = this.generateClientToken(privateKey, accountId);

    const body: GenerateTokenRequest = {
      expiresInSeconds,
    };

    const response = await this.accountClient.post<GenerateTokenResponse>('/generate-token', body, {
      headers: { Authorization: `Bearer ${clientToken}` },
    });

    const { data: apiToken, status } = response.data;

    if (status === 'ok') {
      return apiToken;
    }

    return false;
  }

  private async request<T = unknown>(endpoint: string, method: Method, body?: Record<string, unknown>): Promise<T> {
    const requestHeaders: RawAxiosRequestHeaders = {};
    const requestBody = { ...body };

    if (this.options.auth.type === 'bearer_token') {
      requestHeaders['Authorization'] = `Bearer ${this.options.auth.token}`;
    } else {
      const { apiKey, apiSecret } = this.options.auth;
      requestBody['apiKey'] = apiKey;
      requestBody['apiSecret'] = apiSecret;
    }

    try {
      const response = await this.client.request<T>({
        method,
        data: requestBody,
        headers: {
          'Content-Type': 'application/json',
          ...requestHeaders,
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError<PromotexterErrorResponse>(error) && error.response) {
        switch (error.response.status) {
          case HttpStatusCode.BadRequest:
          case HttpStatusCode.Unauthorized:
          case HttpStatusCode.UnprocessableContent:
            throw new PromotexterError(error.response.data.code, error.response.status, error.response.data.message);
        }
      }

      throw new Error('Promotexter provider error', { cause: error });
    }
  }

  protected async sendViberOtpMsg(endpoint: string, payload: SendViberOtpRequest) {
    const result = await this.request<SendViberResponse>(endpoint, 'POST', payload);
    return result;
  }

  protected async sendSmsMsg(endpoint: string, payload: SendSmsRequest) {
    const result = await this.request<SendSmsResponse>(endpoint, 'POST', payload);
    return result;
  }
}
