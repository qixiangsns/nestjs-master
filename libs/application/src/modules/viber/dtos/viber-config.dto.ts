import { z } from 'zod';
import { ViberProviderCode } from '../models/viber-provider.model';
import { RouteStrategy, RouteType } from '../models/viber-route-config.model';

export const GetViberRouteConfigRequestSchema = z.object({
  platformId: z.string().trim().min(1),
  routeType: z.enum(RouteType),
});

export type GetViberRouteConfigRequest = z.output<typeof GetViberRouteConfigRequestSchema>;

export const GetViberRouteConfigResponseSchema = z
  .object({
    id: z.string(),
    type: z.enum(RouteType),
    platformId: z.string(),
    senderId: z.string(),
    strategy: z.enum(RouteStrategy),
    accounts: z.array(
      z.object({
        id: z.string(),
        isEnabled: z.boolean(),
        weight: z.number(),
        details: z.object({
          name: z.string(),
          providerCode: z.enum(ViberProviderCode),
          url: z.string(),
          senderIds: z.array(z.string()),
        }),
      }),
    ),
  })
  .meta({
    title: 'ViberRouteConfig',
    description: 'A viber route config with its account summaries, without credentials',
  });
