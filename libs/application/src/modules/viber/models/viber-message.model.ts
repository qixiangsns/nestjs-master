import { ExtractStrict } from 'type-fest';

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

export type ViberTemplateMessage = {
  id: string;
  params: Record<string, string>;
};

/**
 * Free form viber message content with components
 */
export const ViberMessageComponent = ['text', 'button', 'video', 'file', 'image'] as const;
export type ViberMessageComponent = (typeof ViberMessageComponent)[number];

export const ViberMessageContent = {
  TextOnly: ['text'],
  TextButton: ['text', 'button'],
  ImageOnly: ['image'],
  ImageText: ['image', 'text'],
  ImageButton: ['image', 'button'],
  ImageButtonText: ['image', 'button', 'text'],
  VideoOnly: ['video'],
  VideoText: ['video', 'text'],
  VideoButton: ['video', 'button'],
  VideoButtonText: ['video', 'button', 'text'],
} as const satisfies Record<string, ViberMessageComponent[]>;

export type ViberMessageContent = keyof typeof ViberMessageContent;

export type ViberMessageTextOnly = {
  type: ExtractStrict<ViberMessageContent, 'TextOnly'>;
  text: string;
};

export type ViberMessageTextButton = {
  type: ExtractStrict<ViberMessageContent, 'TextButton'>;
  text: string;
};
