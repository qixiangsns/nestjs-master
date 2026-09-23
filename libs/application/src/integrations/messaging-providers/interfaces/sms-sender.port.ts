import { ProviderErrorResult, ProviderErrorType } from './provider-error.types';

type SmsErrorType = ProviderErrorType | 'duplicated_request' | 'invalid_phone_number';
export type SmsErrorResult = ProviderErrorResult & { errorCode: SmsErrorType };

export type Message = {
  to: string;
  from: string;
  senderId: string;
  text: string;
};

type SmsSuccessResult = {
  success: true;
  messageId: string;
};

export type SmsResult = SmsSuccessResult | SmsErrorResult;

export interface SmsSender {
  sendSms(message: Message): Promise<SmsResult>;
}
