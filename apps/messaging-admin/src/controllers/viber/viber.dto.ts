import { createZodDto } from 'nestjs-zod';
import {
  CreateViberAccountSchema,
  GetViberAccountListResponseSchema,
  GetViberProviderListResponseSchema,
  PatchViberAccountSchema,
} from '@application/modules/viber';

export class GetViberProviderListResponse extends createZodDto(GetViberProviderListResponseSchema) {}
export class GetViberAccountListResponse extends createZodDto(GetViberAccountListResponseSchema) {}
export class CreateViberAccountRequest extends createZodDto(CreateViberAccountSchema) {}
export class PatchViberAccountRequest extends createZodDto(PatchViberAccountSchema) {}
