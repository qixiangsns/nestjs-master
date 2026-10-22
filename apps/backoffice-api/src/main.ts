import 'zod/compile';
import '@framework/trace/register';
import { NestFactory } from '@nestjs/core';
import { Logger, VersioningType } from '@nestjs/common';
import { BackofficeApiModule } from './backoffice-api.module';
import { Logger as PinoLogger } from 'nestjs-pino';
import { ENV_TOKEN, Env } from './env';
import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { DocumentBuilder } from '@nestjs/swagger';
import { DEFAULT_OPTIONS } from '@framework/scalar';
import { version } from '@package';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { apiReference } from '@scalar/nestjs-api-reference';
import { createMarkdownFromOpenApi } from '@scalar/openapi-to-markdown';
import { Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(BackofficeApiModule, {
    bufferLogs: true,
  });
  const env = app.get<Env>(ENV_TOKEN);
  app.enableShutdownHooks();

  // Logging
  app.useLogger(app.get(PinoLogger));
  const logger = new Logger('Server');
  app.flushLogs();

  // API documentation
  app.enableVersioning({ type: VersioningType.URI });
  await setupApiDocumentation(app);

  app.listen(env.PORT).then(() => {
    logger.log({ url: `http://localhost:${env.PORT}` }, `Server is running`);
    logger.log({ url: `http://localhost:${env.PORT}/reference` }, `APIs documentation is hosted`);
    logger.log({ url: `http://localhost:${env.PORT}/llms.txt` }, 'LLM Text is hosted');
  });
}

async function setupApiDocumentation(app: INestApplication) {
  const openApiDoc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Backoffice API')
      .setDescription('Documentation for APIs for backoffice')
      .setVersion(version)
      .build(),
  );
  const content = cleanupOpenApiDoc(openApiDoc);
  const markdown = await createMarkdownFromOpenApi(JSON.stringify(content));

  app.use(
    '/reference',
    apiReference({
      content,
      ...DEFAULT_OPTIONS,
    }),
  );

  const http = app.getHttpAdapter();
  http.get('/llms.txt', (req: Request, res: Response) => res.type('txt').send(markdown));
}

bootstrap();
