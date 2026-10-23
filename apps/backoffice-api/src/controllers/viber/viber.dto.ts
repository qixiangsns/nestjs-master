import { createZodDto } from 'nestjs-zod';
import {
  CreateViberAccountSchema,
  CreateViberRouteConfigSchema,
  GetViberAccountListResponseSchema,
  GetViberLogListRequestSchema,
  GetViberLogListResponseSchema,
  GetViberProviderListResponseSchema,
  GetViberRouteConfigRequestSchema,
  GetViberRouteConfigResponseSchema,
  PatchViberAccountSchema,
  PatchViberRouteConfigSchema,
} from '@application/modules/viber/index.js';

export class GetViberProviderListResponse extends createZodDto(
  GetViberProviderListResponseSchema,
) {}
export class GetViberAccountListResponse extends createZodDto(GetViberAccountListResponseSchema) {}
export class CreateViberAccountRequest extends createZodDto(CreateViberAccountSchema) {}
export class PatchViberAccountRequest extends createZodDto(PatchViberAccountSchema) {}
export class GetViberLogListRequest extends createZodDto(GetViberLogListRequestSchema) {}
export class GetViberLogListResponse extends createZodDto(GetViberLogListResponseSchema) {}
export class GetViberRouteConfigRequest extends createZodDto(GetViberRouteConfigRequestSchema) {}
export class GetViberRouteConfigResponse extends createZodDto(GetViberRouteConfigResponseSchema) {}
export class CreateViberRouteConfigRequest extends createZodDto(CreateViberRouteConfigSchema) {}
export class PatchViberRouteConfigRequest extends createZodDto(PatchViberRouteConfigSchema) {}
