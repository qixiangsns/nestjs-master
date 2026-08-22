import { ZodType } from 'zod';
import { z } from 'zod';

export interface SecretProvider {
  /**
   * @throws {InvalidSchemaException} if the schema is invalid
   *
   * Get the secret from the provider
   */
  get: () => Promise<unknown> | unknown;
}
