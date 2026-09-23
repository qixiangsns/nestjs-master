import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { OffsetPaginationSchema } from '@framework/pagination';

const AdminRole = z.enum(['manager', 'tester', 'superadmin']);
const AdminStatus = z.enum(['active', 'suspended']);

const AdminSchema = z
  .object({
    id: z.string(),
    username: z.string(),
    name: z.string(),
    email: z.email(),
    role: AdminRole,
    status: AdminStatus,
    lastLoginAt: z.iso.datetime().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .meta({
    title: 'Admin',
    description: 'An admin account',
  });

const GetAdminListRequestSchema = z.object({
  role: AdminRole,
  status: AdminStatus,
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

const GetAdminListResponseSchema = OffsetPaginationSchema.extend({
  items: z.array(AdminSchema),
}).meta({
  title: 'AdminList',
  description: 'Paginated admin accounts',
});

export class GetAdminListRequest extends createZodDto(GetAdminListRequestSchema) {}
export class GetAdminListResponse extends createZodDto(GetAdminListResponseSchema) {}
export class GetAdminInfoResponse extends createZodDto(AdminSchema) {}

const PatchAdminInfoRequestSchema = z
  .object({
    name: z.string().trim().min(1),
    email: z.email(),
    role: AdminRole,
  })
  .partial();

export class PatchAdminInfoRequest extends createZodDto(PatchAdminInfoRequestSchema) {}
export class PatchAdminInfoResponse extends createZodDto(AdminSchema) {}

const ResetAdminPasswordResponseSchema = z
  .object({
    temporaryPassword: z.string().describe('Temporary password the admin must change on next login'),
    expiresAt: z.iso.datetime(),
  })
  .meta({
    title: 'AdminTemporaryPassword',
    description: 'Temporary credentials issued after a forced password reset',
  });

export class ResetAdminPasswordResponse extends createZodDto(ResetAdminPasswordResponseSchema) {}

const ResetAdminTfaResponseSchema = z
  .object({
    isTfaEnabled: z.boolean(),
    resetAt: z.iso.datetime(),
  })
  .meta({
    title: 'AdminTfaReset',
    description: 'Result of clearing the admin 2FA registration',
  });

export class ResetAdminTfaResponse extends createZodDto(ResetAdminTfaResponseSchema) {}

const UpdateAdminStatusRequestSchema = z.object({
  status: AdminStatus,
  reason: z.string().trim().optional(),
});

const UpdateAdminStatusResponseSchema = z
  .object({
    id: z.string(),
    status: AdminStatus,
    updatedAt: z.iso.datetime(),
  })
  .meta({
    title: 'AdminStatus',
    description: 'Current status of the admin account',
  });

export class UpdateAdminStatusRequest extends createZodDto(UpdateAdminStatusRequestSchema) {}
export class UpdateAdminStatusResponse extends createZodDto(UpdateAdminStatusResponseSchema) {}
