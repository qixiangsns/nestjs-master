import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { isAfter } from 'date-fns';

const stringToDate = z
  .string()
  .describe('ISO Datetime (Eg: 2026-08-21T03:30:44.585Z)')
  .transform((value) => {
    return new Date(value);
  });

const GameWinlossRequestSchema = z.object({
  platformId: z.string().optional(),
  startTime: stringToDate.optional(),
  endTime: stringToDate.optional(),
});

const GameWinlossResponseSchema = z
  .object({
    token: z.string(),
    expiresAt: stringToDate,
  })
  .meta({
    title: 'GameWinlossResponse',
    description: 'The game win/loss report for lowest ggr',
  });

export class GameWinlossRequest extends createZodDto(GameWinlossRequestSchema, {
  codec: true,
}) {}

export class GameWinlossResponse extends createZodDto(GameWinlossResponseSchema, {
  codec: true,
}) {}
