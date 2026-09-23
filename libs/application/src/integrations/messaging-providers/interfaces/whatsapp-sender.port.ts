import { ProviderErrorResult, ProviderErrorType } from './provider-error.types';

export type WhatsappTemplatesResult = { success: true; templates: unknown[] } | ProviderErrorResult;
export type SendWhatsappTemplateMsgResult = { success: true; messageId: string } | ProviderErrorResult;
export type SendWhatsappMsgResult = { success: true; messageId: string } | ProviderErrorResult;
export type SendWhatsappMsgRequest = { success: true; messageId: string } | ProviderErrorResult;

export type SendWhatsappTemplateMsgRequest = { to: string; from: string; templateName: string; language: string };
export interface WhatsappSender {
  // sendWhatsappTemplateMsg: () => Promise<SendWhatsappMsgResult>;
  // sendWhatsappMsg: () => Promise<void>;
  getWhatsappTemplates: (senderId: string) => Promise<WhatsappTemplatesResult>;
}
