import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const LoginRequestSchema = z.object({
  username: z.string().trim().toLowerCase(),
  password: z.string().trim().min(8),
});

const LoginResponseSchema = z.object({
  isTfaEnabled: z.boolean(),
  tfaSecret: z.string().optional().describe('TFA setup key'),
});

export class LoginRequest extends createZodDto(LoginRequestSchema) {}
export class LoginResponse extends createZodDto(LoginResponseSchema) {}

const VerifyTfaRequestSchema = z.object({
  pin: z.string(),
});

const VerifyTfaResponseSchema = z.object({
  accessToken: z.string(),
});

export class VerifyTfaRequest extends createZodDto(VerifyTfaRequestSchema) {}
export class VerifyTfaResponse extends createZodDto(VerifyTfaResponseSchema) {}

const GetLarkLoginUrlResponseSchema = z.object({
  redirectUrl: z.string(),
});

export class GetLarkLoginUrlResponse extends createZodDto(GetLarkLoginUrlResponseSchema) {}

const LarkLoginCallbackRequestSchema = z.object({
  state: z.string(),
  code: z.string(),
});

export class LarkLoginCallbackRequest extends createZodDto(LarkLoginCallbackRequestSchema) {}
