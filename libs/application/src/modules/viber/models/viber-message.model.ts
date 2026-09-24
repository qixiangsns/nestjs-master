export type ViberOtp = {
  messageId: string;
  otp: string;
  ttl: number;
  templateId: string;
  senderId: string;
};

export type ViberMessage = {
  referenceId: string;
  messageId: string;
};

export type ViberTemplate = {
  id: string;
  params: Record<string, string>;
};
