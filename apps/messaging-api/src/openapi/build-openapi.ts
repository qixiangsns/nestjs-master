import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { version } from '@package';

/** OpenAPI spec for messaging-api. Used by the docs page (main.ts) and spec export (generate.ts). */
export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Messaging API')
    .setDescription('Documentation for Messaging API')
    .setVersion(version)
    .build();

  return cleanupOpenApiDoc(SwaggerModule.createDocument(app, config));
}
