import { ZodError } from 'zod';

export class InvalidSchemaException extends Error {
  public invalidFields: Record<string, string>[];
  constructor(
    private readonly type: string, // env/vault
    zodError: ZodError,
  ) {
    super(`Invalid schema for secret`);
    this.invalidFields = zodError.issues.map((issue) => ({
      [issue.path.join('.')]: issue.message,
    }));
    this.name = 'InvalidSchemaException';
    this.stack = undefined;
  }
}
