import { defineConfig } from '@hey-api/openapi-ts';

/**
 * Hey API: generates a typed client from each service's OpenAPI spec.
 * Docs: https://heyapi.dev/openapi-ts/configuration
 */
export default defineConfig({
  input: './apps/messaging-api/src/openapi/openapi.json',
  output: {
    path: './clients/messaging-api/src',
    postProcess: ['prettier'],
  },
  plugins: ['@hey-api/client-fetch', '@hey-api/typescript', '@hey-api/sdk', 'zod'],
});
