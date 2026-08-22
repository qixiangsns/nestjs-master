import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const LoginRequestSchema = z.object({
  username: z.string().trim().toLowerCase(),
  password: z.string().trim().min(8),
});

const LoginResponseSchema = z
  .object({
    token: z.string(),
    expiresAt: z.iso.datetime(),
  })
  .meta({
    title: 'LoginResponse',
    description: 'The response for login',
  });

export class LoginRequest extends createZodDto(LoginRequestSchema) {}
export class LoginResponse extends createZodDto(LoginResponseSchema) {}
