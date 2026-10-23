import { type ViberProvider } from '@application/modules/viber/index.js';

export const VIBER_PROVIDERS: ViberProvider[] = [
  { code: 'Promotexter', name: 'Promotexter', urls: ['https://api.promotexter.com'] },
  { code: 'PromotexterApix', name: 'Promotexter APIX', urls: ['https://apix.promotexter.com'] },
  { code: 'Infobip', name: 'Infobip', urls: ['https://api.infobip.com'] },
  { code: 'MockProvider', name: 'Mock Provider', urls: ['mock://success'] },
];
