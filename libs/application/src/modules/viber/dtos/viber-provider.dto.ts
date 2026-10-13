import { z } from 'zod';
import { ViberProviderCode } from '../models/viber-provider.model';

export const GetViberProviderListResponseSchema = z
  .object({
    code: z.enum(ViberProviderCode),
    name: z.string(),
    urls: z.array(z.string()),
  })
  .meta({
    title: 'ViberProvider',
    description: 'A viber provider that accounts can be bound to',
  });
