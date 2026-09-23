import { z, infer } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { OffsetPaginationQuerySchema, OffsetPaginationSchema, offsetPaginated } from '@framework/pagination';

const EmailAccountStatus = z.enum(['active', 'suspended']);
const EmailRouteConfigStatus = z.enum(['active', 'disabled']);
const EmailSendStatus = z.enum(['queued', 'sent', 'failed']);
const EmailLogStatus = z.enum(['queued', 'sent', 'failed']);
const EmailDlrStatus = z.enum(['pending', 'delivered', 'bounced', 'complained', 'rejected']);
const EmailProviderCode = z.enum(['aws', 'aliyun']);
const EmailAccountAuthType = z.enum(['smtp', 'vpc']);

/**
 * Provider credentials are opaque here: each provider declares its own required
 * keys (see `requiredCredentials` on the provider listing). They are write-only
 * and never echoed back on an account response.
 */
const EmailCredentialSmtp = z.object({
  host: z.string(),
  secure: z.boolean(),
  port: z.number(),
  username: z.string(),
  password: z.string(),
});

const EmailCredentialApiKey = z.object({
  apiKey: z.string(),
  apiSecret: z.string(),
});

/* -------------------------------------------------------------------------- */
/*                              Manage accounts                               */
/* -------------------------------------------------------------------------- */

const EmailAccountSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    provider: EmailProviderCode,
    fromEmail: z.email(),
    fromName: z.string().nullable(),
    status: EmailAccountStatus,
    dailyQuota: z.number().int().nullable().describe('Maximum messages per day, null when unlimited'),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .meta({
    title: 'EmailAccount',
    description: 'An email sending account bound to a provider',
  });

const CreateEmailAccountRequestSchema = z.object({
  name: z.string().trim().min(1),
  authType: EmailAccountAuthType,
  provider: EmailProviderCode,
  senderAddress: z.email(),
  senderName: z.string(),
  dailyQuota: z.coerce.number().int().min(1).optional(),
  credentials: z.union([EmailCredentialApiKey, EmailCredentialSmtp]),
});

const GetEmailAccountListRequestSchema = OffsetPaginationQuerySchema.extend({
  items: z.array(
    z.object({
      provider: z.string().trim().optional(),
      status: EmailAccountStatus.optional(),
    }),
  ),
});

const PatchEmailAccountRequestSchema = z
  .object({
    name: z.string().trim().min(1),
    fromEmail: z.email(),
    fromName: z.string().trim().min(1).nullable(),
    replyToEmail: z.email().nullable(),
    status: EmailAccountStatus,
    dailyQuota: z.coerce.number().int().min(1).nullable(),
    credentials: z.union([EmailCredentialApiKey, EmailCredentialSmtp]),
  })
  .partial();

export class CreateEmailAccountRequest extends createZodDto(CreateEmailAccountRequestSchema) {}
export class CreateEmailAccountResponse extends createZodDto(EmailAccountSchema) {}
export class GetEmailAccountListRequest extends createZodDto(GetEmailAccountListRequestSchema) {}
export class GetEmailAccountListResponse extends createZodDto(GetEmailAccountListRequestSchema) {}
export class PatchEmailAccountRequest extends createZodDto(PatchEmailAccountRequestSchema) {}
export class PatchEmailAccountResponse extends createZodDto(EmailAccountSchema) {}

/* -------------------------------------------------------------------------- */
/*                              Manage providers                              */
/* -------------------------------------------------------------------------- */

const EmailProviderSchema = z
  .object({
    code: EmailProviderCode,
    baseUrl: z.string(),
  })
  .meta({
    title: 'EmailProvider',
    description: 'An email provider available to sending accounts',
  });

const GetEmailProviderListSchema = OffsetPaginationSchema.extend({
  items: z.array(EmailProviderSchema),
});

export class GetEmailProviderListResponse extends createZodDto(GetEmailProviderListSchema) {}

/* -------------------------------------------------------------------------- */
/*                                Manage logs                                 */
/* -------------------------------------------------------------------------- */

const EmailLogSchema = z
  .object({
    id: z.string(),
    messageId: z.string(),
    provider: z.string(),
    from: z.email(),
    to: z.array(z.email()),
    subject: z.string(),
    status: EmailLogStatus,
    dlrStatus: EmailDlrStatus,
    campaignId: z.string().nullable(),
    deliveryErrorCode: z.string().nullable(),
    sentAt: z.iso.datetime().nullable(),
    deliveredAt: z.iso.datetime().nullable(),
    createdAt: z.iso.datetime(),
  })
  .meta({
    title: 'EmailLog',
    description: 'A single email delivery attempt',
  });

const GetEmailLogListRequestSchema = z.object({
  status: EmailLogStatus.optional(),
  dlrStatus: EmailDlrStatus.optional(),
  messageId: z.string().trim().optional(),
  accountId: z.string().trim().optional(),
  provider: z.string().trim().optional(),
  campaignId: z.string().trim().optional(),
  recipient: z.email().optional().describe('Match logs addressed to this recipient'),
  startTime: z.iso.datetime(),
  endTime: z.iso.datetime(),
});

const GetEmailLogListResponseSchema = OffsetPaginationQuerySchema.extend({
  items: z.array(EmailLogSchema),
});
export class GetEmailLogListRequest extends createZodDto(GetEmailLogListRequestSchema) {}
export class GetEmailLogListResponse extends createZodDto(GetEmailLogListResponseSchema) {}

/* -------------------------------------------------------------------------- */
/*                                  Test API                                  */
/* -------------------------------------------------------------------------- */

const SendEmailRequestSchema = z.object({
  accountId: z.string().trim().min(1).describe('Sending account to use, routing is bypassed when set').optional(),
  to: z.array(z.email()).min(1),
  cc: z.array(z.email()).optional(),
  bcc: z.array(z.email()).optional(),
  replyTo: z.email().optional(),
  subject: z.string().trim().min(1),
  text: z.string().optional(),
  html: z.string().optional(),
});

const SendEmailResponseSchema = z
  .object({
    messageId: z.string(),
    accountId: z.string(),
    provider: z.string(),
    status: EmailSendStatus,
    acceptedAt: z.iso.datetime(),
  })
  .meta({
    title: 'EmailSendResult',
    description: 'Result of a test email submission',
  });

export class SendEmailRequest extends createZodDto(SendEmailRequestSchema) {}
export class SendEmailResponse extends createZodDto(SendEmailResponseSchema) {}

/* -------------------------------------------------------------------------- */
/*                             Routing management                             */
/* -------------------------------------------------------------------------- */

const EmailRouteCriteriaSchema = z
  .object({
    recipientDomains: z.array(z.string().trim().min(1)).optional().describe('Match on the recipient address domain'),
    campaignIds: z.array(z.string().trim().min(1)).optional(),
    tags: z.array(z.string().trim().min(1)).optional(),
  })
  .meta({
    title: 'EmailRouteCriteria',
    description: 'Conditions a message must match for the route to apply, an empty object matches everything',
  });

const EmailRouteConfigSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    accountId: z.string().describe('Account messages matching this route are sent through'),
    fallbackAccountId: z.string().nullable().describe('Account to retry with when the primary account fails'),
    priority: z.number().int().describe('Lower values are evaluated first'),
    weight: z.number().int().describe('Relative share when several routes share a priority'),
    status: EmailRouteConfigStatus,
    criteria: EmailRouteCriteriaSchema,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .meta({
    title: 'EmailRouteConfig',
    description: 'A routing rule selecting the account used to send an email',
  });

const GetEmailRouteConfigListRequestSchema = OffsetPaginationQuerySchema.extend({
  accountId: z.string().trim().optional(),
  status: EmailRouteConfigStatus.optional(),
});

const CreateEmailRouteConfigRequestSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  accountId: z.string().trim().min(1),
  fallbackAccountId: z.string().trim().min(1).optional(),
  priority: z.coerce.number().int().min(0).default(0),
  weight: z.coerce.number().int().min(1).default(1),
  status: EmailRouteConfigStatus.default('active'),
  criteria: EmailRouteCriteriaSchema.default({}),
});

const PatchEmailRouteConfigRequestSchema = z
  .object({
    name: z.string().trim().min(1),
    description: z.string().trim().min(1).nullable(),
    accountId: z.string().trim().min(1),
    fallbackAccountId: z.string().trim().min(1).nullable(),
    priority: z.coerce.number().int().min(0),
    weight: z.coerce.number().int().min(1),
    status: EmailRouteConfigStatus,
    criteria: EmailRouteCriteriaSchema,
  })
  .partial();

export class GetEmailRouteConfigListRequest extends createZodDto(GetEmailRouteConfigListRequestSchema) {}
export class GetEmailRouteConfigListResponse extends createZodDto(
  offsetPaginated(EmailRouteConfigSchema, {
    title: 'EmailRouteConfigList',
    description: 'Paginated email routing rules',
  }),
) {}
export class CreateEmailRouteConfigRequest extends createZodDto(CreateEmailRouteConfigRequestSchema) {}
export class CreateEmailRouteConfigResponse extends createZodDto(EmailRouteConfigSchema) {}
export class PatchEmailRouteConfigRequest extends createZodDto(PatchEmailRouteConfigRequestSchema) {}
export class PatchEmailRouteConfigResponse extends createZodDto(EmailRouteConfigSchema) {}
