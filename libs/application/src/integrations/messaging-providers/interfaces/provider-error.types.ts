// Generic provider errors
type ProviderBaseError = { success: false; errorMessage: string; cause?: unknown };

export type ProviderErrorType =
  | 'rate_limit_exceeded'
  | 'system_maintenance'
  | 'ip_not_whitelisted'
  | 'invalid_params'
  | 'insufficient_balance'
  | 'unauthorized'
  | 'provider_error'
  | 'unhandled';

export type ProviderErrorResult = ProviderBaseError & { errorCode: ProviderErrorType };
