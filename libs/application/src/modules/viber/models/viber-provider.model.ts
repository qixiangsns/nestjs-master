export const ViberProviderCode = {
  PROMOTEXTER: 'PROMOTEXTER',
  PROMOTEXTER_APIX: 'PROMOTEXTER_APIX',
  INFOBIP: 'INFOBIP',
} as const;

export type ViberProviderCode = (typeof ViberProviderCode)[keyof typeof ViberProviderCode];
export const ViberProviderCodes = Object.values(ViberProviderCode);

export interface ViberProvider {
  code: ViberProviderCode;
  name: string;
  urls: string[];
}
