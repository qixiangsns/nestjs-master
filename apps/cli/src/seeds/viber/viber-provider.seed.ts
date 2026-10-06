import { ViberProvider } from '@application/modules/viber/models/viber-provider.model';

export const VIBER_PROVIDERS: ViberProvider[] = [
  { code: 'Promotexter', name: 'Promotexter', urls: ['https://api.promotexter.com'] },
  { code: 'PromotexterApix', name: 'Promotexter APIX', urls: ['https://apix.promotexter.com'] },
  { code: 'Infobip', name: 'Infobip', urls: ['https://api.infobip.com'] },
];
