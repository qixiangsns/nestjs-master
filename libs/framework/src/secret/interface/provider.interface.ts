export interface SecretProvider {
  /**
   * @throws {InvalidSchemaException} if the schema is invalid
   *
   * Get the secret from the provider
   */
  get: () => unknown;
}
