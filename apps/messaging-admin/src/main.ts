import { NestFactory } from '@nestjs/core';
import { Logger, VersioningType } from '@nestjs/common';
import { MessagingAdminModule } from './messaging-admin.module';
import { Logger as PinoLogger } from 'nestjs-pino';
import { ENV_TOKEN, Env } from './env';
import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { DocumentBuilder } from '@nestjs/swagger';
import { DEFAULT_OPTIONS } from '@framework/scalar';
import { version } from '@package';
import { otelSdk } from '@framework/trace';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const app = await NestFactory.create(MessagingAdminModule, {
    bufferLogs: true,
  });
  const env = app.get<Env>(ENV_TOKEN);

  // Logging
  app.useLogger(app.get(PinoLogger));
  const logger = new Logger('Server');
  app.flushLogs();

  // Open Telemetry
  otelSdk.start();

  // API documentation
  app.enableVersioning({ type: VersioningType.URI });
  setupApiDocumentation(app);

  app.listen(env.PORT).then(() => {
    logger.log({ url: `http://localhost:${env.PORT}` }, `Server is running`);
    logger.log({ url: `http://localhost:${env.PORT}/reference` }, `APIs documentation is hosted`);
  });
}

function setupApiDocumentation(app: INestApplication) {
  const openApiDoc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Backoffice API')
      .setDescription('Documentation for APIs for backoffice')
      .setVersion(version)
      .build(),
  );

  app.use(
    '/reference',
    apiReference({
      content: cleanupOpenApiDoc(openApiDoc),
      ...DEFAULT_OPTIONS,
    }),
  );
}

bootstrap();
