import { z } from 'zod';
import { isValidObjectId } from 'mongoose';
import { ViberProviderCode } from '../models/viber-provider.model';
import { AccountType } from '../models/viber-account.model';

const LimiterPoolIdsSchema = z
  .array(z.string().refine(isValidObjectId, 'Invalid limiter pool id'))
  .refine((ids) => new Set(ids).size === ids.length, 'Limiter pool ids must not repeat');

export const GetViberAccountListResponseSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    providerCode: z.enum(ViberProviderCode),
    type: z.enum(AccountType),
    url: z.string(),
    senderIds: z.array(z.string()),
    limiterPoolIds: z.array(z.string()),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .meta({
    title: 'ViberAccount',
    description: 'A viber sending account bound to a provider',
  });

export const CreateViberAccountSchema = z.object({
  name: z.string().trim().min(1),
  providerCode: z.enum(ViberProviderCode),
  url: z.url(),
  senderIds: z.array(z.string().trim().min(1)).min(1),
  limiterPoolIds: LimiterPoolIdsSchema.default([]),
  credentials: z.xor([
    z
      .object({
        type: z.literal('ApiToken' satisfies AccountType),
        apiToken: z.string().min(1),
      })
      .meta({ title: 'ApiToken' }),
    z
      .object({
        type: z.literal('ApiKeySecret' satisfies AccountType),
        apiKey: z.string().min(1),
        apiSecret: z.string().min(1),
      })
      .meta({ title: 'ApiKeySecret' }),
  ]),
});

export type CreateViberAccount = z.output<typeof CreateViberAccountSchema>;

export const PatchViberAccountSchema = CreateViberAccountSchema.pick({
  name: true,
  senderIds: true,
})
  .extend({ limiterPoolIds: LimiterPoolIdsSchema })
  .partial();

export type PatchViberAccount = z.output<typeof PatchViberAccountSchema>;
