export const ViberProviderCode = [
  'Promotexter',
  'PromotexterApix',
  'Infobip',
  'MockProvider',
] as const;
export type ViberProviderCode = (typeof ViberProviderCode)[number];

export interface ViberProvider {
  code: ViberProviderCode;
  name: string;
  urls: string[];
}
