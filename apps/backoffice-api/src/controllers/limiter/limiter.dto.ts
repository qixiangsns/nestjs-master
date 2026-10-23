import { createZodDto } from 'nestjs-zod';
import {
  CreateLimiterPoolSchema,
  GetLimiterPoolListResponseSchema,
  PatchLimiterPoolSchema,
  PatchLimiterPoolStatusSchema,
} from '@application/modules/limiter/index.js';

export class GetLimiterPoolListResponse extends createZodDto(GetLimiterPoolListResponseSchema) {}
export class CreateLimiterPoolRequest extends createZodDto(CreateLimiterPoolSchema) {}
export class PatchLimiterPoolRequest extends createZodDto(PatchLimiterPoolSchema) {}
export class PatchLimiterPoolStatusRequest extends createZodDto(PatchLimiterPoolStatusSchema) {}
