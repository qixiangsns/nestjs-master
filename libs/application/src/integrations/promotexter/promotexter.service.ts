import axios, { AxiosError, AxiosInstance } from 'axios';
import * as jwt from 'jsonwebtoken';
type AuthConfigBearerToken = {
  type: 'bearer_token';
  accountId: string;
  privateKey: string;
  apiToken?: string; //
};

type AuthConfigApiKey = {
  type: 'api_key';
  apiKey: string;
  apiSecret: string;
};

type ClientOptions = {
  baseUrl: string;
  generateTokenUrl?: string;
  timeoutMs?: number;
  auth: AuthConfigApiKey | AuthConfigBearerToken;
};

type HttpMethod = 'POST' | 'GET' | 'PATCH' | 'DELETE';

type GenerateTokenResponse = {
  status: 'ok';
  data: 'string';
};

type GenerateTokenRequest = {
  expiresInSeconds: number;
};
export class Promotexter {
  private readonly client: AxiosInstance;

  constructor(private readonly options: ClientOptions) {
    this.client = axios.create({
      baseURL: this.options.baseUrl,
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
    const url = this.options.generateTokenUrl || 'https://api.promotexter.com/generate-token';
    const clientToken = this.generateClientToken(privateKey, accountId);

    const body: GenerateTokenRequest = {
      expiresInSeconds,
    };

    const response = await axios.post<GenerateTokenResponse>(url, body, {
      headers: { Authorization: `Bearer ${clientToken}` },
    });

    const { data: apiToken, status } = response.data;

    if (status === 'ok') {
      return apiToken;
    }

    return false;
  }

  private async request<T = unknown>(method: HttpMethod, body: unknown) {
    const response = await this.client.request<T>({
      method,
      data: body,
    });
    return response.data;
  }

  protected sendViberMsg(endpoint: string, content: string) {}

  protected sendViberTemplateMsg(endpoint: string, templateId: string, params: Record<string, string | number>) {}
  protected sendViberOtpMsg(endpoint: string, templateId: string, params: Record<string, string | number>) {}
  protected sendSms(endpoint: string, content: string) {}
}
