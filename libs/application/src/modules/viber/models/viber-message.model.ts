import { Except, ExtractStrict } from 'type-fest';
import { ViberLog } from './viber-log.model';
import { ViberAccount } from './viber-account.model';

export type ViberOtp = {
  messageId: string;
  otp: string;
  ttl: number;
  templateId: string;
  senderId: string;
};

export type SendViberResult = {
  referenceId: string;
  messageId: string;
};

const ViberMessageType = ['Otp', 'Template', 'Content'] as const;
type ViberMessageType = (typeof ViberMessageType)[number];

/**
 * Viber pre-approved template
 * Usage: transactional/notification message
 */
export type ViberTemplateMessage = {
  type: ExtractStrict<ViberMessageType, 'Template'>;
  templateId: string;
  templateLang: string;
  templateParams: Record<string, string>;
};

/**
 * Viber UI-based message (accept UI components)
 * Usage: marketing/promotional message
 */
export const ViberContentComponent = ['Text', 'Button', 'Video', 'File', 'Image'] as const;
export type ViberContentComponent = (typeof ViberContentComponent)[number];

export const ViberContentType = [
  'TextOnly',
  'TextButton',
  'ImageOnly',
  'ImageText',
  'ImageButton',
  'ImageButtonText',
  'VideoOnly',
  'VideoText',
  'VideoButton',
  'VideoButtonText',
] as const;
export type ViberContentType = (typeof ViberContentType)[number];

export const ViberContent = {
  TextOnly: ['Text'],
  TextButton: ['Text', 'Button'],
  ImageOnly: ['Image'],
  ImageText: ['Image', 'Text'],
  ImageButton: ['Image', 'Button'],
  ImageButtonText: ['Image', 'Button', 'Text'],
  VideoOnly: ['Video'],
  VideoText: ['Video', 'Text'],
  VideoButton: ['Video', 'Button'],
  VideoButtonText: ['Video', 'Button', 'Text'],
} as const satisfies Record<ViberContentType, ViberContentComponent[]>;

export type ViberContentTextOnly = {
  contentType: ExtractStrict<ViberContentType, 'TextOnly'>;
  text: string;
};

export type ViberContentTextButton = {
  contentType: ExtractStrict<ViberContentType, 'TextButton'>;
  text: string;
  buttonText: string;
  buttonUrl?: string;
};

export type ViberContentImageOnly = {
  contentType: ExtractStrict<ViberContentType, 'ImageOnly'>;
  imageUrl: string;
};

export type ViberContentImageText = {
  contentType: ExtractStrict<ViberContentType, 'ImageText'>;
  imageUrl: string;
  text: string;
};

export type ViberContentImageButton = {
  contentType: ExtractStrict<ViberContentType, 'ImageButton'>;
  imageUrl: string;
  buttonText: string;
  buttonUrl?: string;
};

export type ViberContentImageButtonText = {
  contentType: ExtractStrict<ViberContentType, 'ImageButtonText'>;
  imageUrl: string;
  buttonText: string;
  buttonUrl?: string;
  text: string;
};

export type ViberContentButtonText = {
  contentType: ExtractStrict<ViberContentType, 'ImageButtonText'>;
  imageUrl: string;
  buttonText: string;
  buttonUrl?: string;
  text: string;
};

export type ViberContentVideoOnly = {
  contentType: ExtractStrict<ViberContentType, 'VideoOnly'>;
  videoUrl: string;
};

export type ViberContentVideoText = {
  contentType: ExtractStrict<ViberContentType, 'VideoText'>;
  videoUrl: string;
  text: string;
};

export type ViberContentVideoButton = {
  contentType: ExtractStrict<ViberContentType, 'VideoButton'>;
  videoUrl: string;
  buttonText: string;
  buttonUrl?: string;
};

export type ViberContentVideoButtonText = {
  contentType: ExtractStrict<ViberContentType, 'VideoButtonText'>;
  videoUrl: string;
  buttonText: string;
  buttonUrl?: string;
  text: string;
};

export type ViberContentRequest = {
  type: ExtractStrict<ViberMessageType, 'Content'>;
  templateContent:
    | ViberContentTextOnly
    | ViberContentTextButton
    | ViberContentImageOnly
    | ViberContentImageText
    | ViberContentImageButton
    | ViberContentImageButtonText
    | ViberContentVideoOnly
    | ViberContentVideoText
    | ViberContentVideoButton
    | ViberContentVideoButtonText;
};

/**
 * Viber OTP message
 * Usage: Login/Register OTP
 */
export type ViberOtpRequest = {
  type: ExtractStrict<ViberMessageType, 'Otp'>;
  templateId: string;
  otp: string;
  otpValidityMinutes: number;
};

/**
 * Viber request payload
 */
type ViberRequestBase = {
  id: string;
  platformId: string;
  phoneNo: string;
  playerId?: string;
  campaignId?: string;
  campaignSender?: string;
};

type ViberRequestType = ViberOtpRequest | ViberContentRequest | ViberTemplateMessage;

export type ViberRequest = ViberRequestBase &
  ViberRequestType & { deliverBy: Except<ViberAccount, 'id' | 'createdAt' | 'updatedAt'> };
