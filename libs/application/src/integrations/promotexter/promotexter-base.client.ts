import axios, { AxiosInstance, RawAxiosRequestHeaders, HttpStatusCode, Method } from 'axios';
import * as jwt from 'jsonwebtoken';
import { PromotexterError } from './promotexter.error.js';
import {
  ClientOptions,
  SendViberResponse,
  PromotexterErrorResponse,
  GenerateTokenRequest,
  GenerateTokenResponse,
  SendSmsRequest,
  SendSmsResponse,
  AccountBalance,
  SendViberTemplateRequest,
  SendViberRichMsgRequest,
} from './promotexter.types.js';

export class PromotexterBaseClient {
  private readonly http: AxiosInstance;
  private readonly accountClient: AxiosInstance;

  constructor(private readonly options: ClientOptions) {
    this.http = axios.create({
      baseURL: this.options.baseUrl,
      timeout: this.options.timeoutMs || 10_000,
    });

    this.accountClient = axios.create({
      baseURL: this.options.accountBaseUrl || 'https://api.promotexter.com',
      timeout: this.options.timeoutMs || 10_000,
    });
  }

  private generateClientToken(apiSecret: string, apiKey: string) {
    const token = jwt.sign({}, apiSecret, {
      issuer: apiKey,
      algorithm: 'RS512',
      expiresIn: '1m',
    });

    return token;
  }

  async generateBearerToken(apiSecret: string, apiKey: string, expiresInSeconds: number = 3600) {
    const clientToken = this.generateClientToken(apiSecret, apiKey);

    const body: GenerateTokenRequest = {
      expiresInSeconds,
    };

    try {
      const response = await this.accountClient.post<GenerateTokenResponse>(
        '/generate-token',
        body,
        {
          headers: { Authorization: `Bearer ${clientToken}` },
        },
      );

      const { data: token, status } = response.data;

      if (status === 'ok' && token) {
        return token;
      }

      throw new Error(`${PromotexterBaseClient.name} failed to obtained bearer token.`);
    } catch (error) {
      throw new Error(
        `${PromotexterBaseClient.name} failed to generate bearer token. ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async getBearerToken() {
    if (this.options.auth.type === 'bearer_token') {
      const storedToken = await this.options.auth.tokenStore.get();
      if (storedToken) return storedToken;

      const newToken = await this.generateBearerToken(
        this.options.auth.apiSecret,
        this.options.auth.apiKey,
      );
      if (newToken) {
        await this.options.auth.tokenStore.save(newToken);
      }
      return newToken;
    }
    throw new Error('Current authentication method does not support generating bearer token');
  }

  private async request<T = unknown>(
    endpoint: string,
    method: Method,
    body?: Record<string, unknown>,
  ): Promise<T> {
    const requestHeaders: RawAxiosRequestHeaders = {};
    const requestBody = { ...body };
    const requestQuery: Record<string, string> = {};

    if (this.options.auth.type === 'bearer_token') {
      const bearerToken = await this.getBearerToken();
      requestHeaders['Authorization'] = `Bearer ${bearerToken}`;
    }

    if (this.options.auth.type === 'api_key') {
      const { apiKey, apiSecret } = this.options.auth;

      if (method === 'POST') {
        requestBody['apiKey'] = apiKey;
        requestBody['apiSecret'] = apiSecret;
      }

      if (method === 'GET') {
        requestQuery['apiKey'] = apiKey;
        requestQuery['apiSecret'] = apiSecret;
      }
    }

    try {
      const response = await this.http.request<T>({
        url: endpoint,
        params: requestQuery,
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
        const handledStatuses: number[] = [
          HttpStatusCode.BadRequest,
          HttpStatusCode.Unauthorized,
          HttpStatusCode.UnprocessableContent,
        ];
        if (handledStatuses.includes(error.response.status)) {
          throw new PromotexterError(
            error.response.data.code,
            error.response.status,
            error.response.data.message,
          );
        }
      }

      throw new Error('Promotexter provider error', { cause: error });
    }
  }

  async getAccountBalance() {
    return this.request<AccountBalance>('/account/balance', 'GET');
  }

  protected async sendViberOtpMsg(endpoint: string, payload: SendViberTemplateRequest) {
    return this.request<SendViberResponse>(endpoint, 'POST', { ...payload });
  }

  protected async sendTemplateMsg(endpoint: string, payload: SendViberTemplateRequest) {
    return this.request<SendViberResponse>(endpoint, 'POST', { ...payload });
  }

  protected async sendRichMsg(endpoint: string, payload: SendViberRichMsgRequest) {
    return this.request<SendViberResponse>(endpoint, 'POST', { ...payload });
  }

  protected async sendSmsMsg(endpoint: string, payload: SendSmsRequest) {
    return this.request<SendSmsResponse>(endpoint, 'POST', payload);
  }
}
