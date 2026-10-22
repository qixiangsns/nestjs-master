import { z } from 'zod';
import { LimiterStrategy, LimiterWindow } from '../models/limiter.model';

const LimiterRuleSchema = z.object({
  window: z.enum(LimiterWindow),
  limit: z.number().int().min(1),
  strategy: z.enum(LimiterStrategy).meta({
    description:
      'Shared: one limit for all pods together. IpExclusive: each egress IP (pod) gets the full limit, so the total grows with the number of pods',
  }),
});

export const GetLimiterPoolListResponseSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    rules: z.array(LimiterRuleSchema),
    isEnabled: z.boolean(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .meta({
    title: 'LimiterPool',
    description: 'A shared limit pool consumed by provider accounts, eg: one Promotexter pool for Viber + SMS',
  });

export const CreateLimiterPoolSchema = z.object({
  name: z.string().trim().min(1),
  rules: z.array(LimiterRuleSchema).min(1),
});

export type CreateLimiterPool = z.output<typeof CreateLimiterPoolSchema>;

export const PatchLimiterPoolSchema = CreateLimiterPoolSchema.partial();

export type PatchLimiterPool = z.output<typeof PatchLimiterPoolSchema>;

export const PatchLimiterPoolStatusSchema = z.object({
  isEnabled: z.boolean(),
});
