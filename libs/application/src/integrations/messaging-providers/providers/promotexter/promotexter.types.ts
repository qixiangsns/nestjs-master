export type AuthConfig = {
  apiSecret: string;
  apiKey: string;
};

export type Config = {
  baseUrl: string;
} & AuthConfig;

export type SendSmsRequest = AuthConfig & {
  to: string;
  from: string;
  text: string;
  dlrReport?: boolean;
  dlrCallbackUrl?: string;
  referenceId?: string;
};
