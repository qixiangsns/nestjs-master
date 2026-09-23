import { z } from 'zod';

/**
 * Query schema for offset (page number) based pagination.
 * Extend it with the endpoint's own filters:
 *
 * ```ts
 * const GetAdminListRequestSchema = OffsetPaginationQuerySchema.extend({
 *   keyword: z.string().trim().optional(),
 * });
 * ```
 */
export const OffsetPaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * Query schema for cursor based pagination. The cursor is opaque to clients:
 * it is only ever echoed back from a previous response.
 */
export const CursorPaginationQuerySchema = z.object({
  cursor: z.string().optional().describe('Opaque cursor returned by a previous response'),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * Pagination metadata returned alongside an offset based listing.
 */
export const OffsetPaginationSchema = z
  .object({
    page: z.number().int(),
    pageSize: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  })
  .meta({
    title: 'OffsetPagination',
    description: 'Page number based pagination metadata',
  });

/**
 * Pagination metadata returned alongside a cursor based listing.
 * No total is exposed: counting a cursor query usually costs a second full scan.
 */
export const CursorPaginationSchema = z
  .object({
    limit: z.number().int(),
    nextCursor: z.string().nullable(),
    prevCursor: z.string().nullable(),
    hasMore: z.boolean(),
  })
  .meta({
    title: 'CursorPagination',
    description: 'Cursor based pagination metadata',
  });

export type OffsetPagination = z.infer<typeof OffsetPaginationSchema>;
export type CursorPagination = z.infer<typeof CursorPaginationSchema>;

export type OffsetPaginated<T> = { items: T[]; pagination: OffsetPagination };
export type CursorPaginated<T> = { items: T[]; pagination: CursorPagination };

type EnvelopeMeta = {
  title?: string;
  description?: string;
};

/**
 * Wrap an item schema in the offset paginated response envelope.
 *
 * Returns a schema rather than a DTO class so the Swagger component keeps the
 * name of the class that extends it:
 *
 * ```ts
 * export class GetAdminListResponse extends createZodDto(
 *   offsetPaginated(AdminSchema, { title: 'AdminList' }),
 * ) {}
 * ```
 */
export function offsetPaginated<T extends z.ZodTypeAny>(item: T, meta: EnvelopeMeta = {}) {
  return z
    .object({
      items: z.array(item),
      pagination: OffsetPaginationSchema,
    })
    .meta(meta);
}

/**
 * Wrap an item schema in the cursor paginated response envelope.
 * See {@link offsetPaginated} for usage.
 */
export function cursorPaginated<T extends z.ZodTypeAny>(item: T, meta: EnvelopeMeta = {}) {
  return z
    .object({
      items: z.array(item),
      pagination: CursorPaginationSchema,
    })
    .meta(meta);
}
