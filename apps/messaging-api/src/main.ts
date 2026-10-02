import { NestFactory } from '@nestjs/core';
import { Logger, VersioningType, INestApplication } from '@nestjs/common';
import { Logger as PinoLogger } from 'nestjs-pino';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { ApiModule } from './messaging-api.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { API_ENV_TOKEN, ApiEnv } from './config';
import { DEFAULT_OPTIONS } from '@framework/scalar';
import { apiReference } from '@scalar/nestjs-api-reference';
import { version } from '@package';
import { otelSdk } from '@framework/trace';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule, {
    bufferLogs: true,
  });
  const env = app.get<ApiEnv>(API_ENV_TOKEN);

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
    logger.log({ url: `http://localhost:${env.PORT}/api` }, 'API documentation is hosted');
  });
}

function setupApiDocumentation(app: INestApplication) {
  const openApiDoc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Messaging API')
      .setDescription('Documentation for Messaging API')
      .setVersion(version)
      .build(),
  );

  app.use(
    '/api',
    apiReference({
      content: cleanupOpenApiDoc(openApiDoc),
      ...DEFAULT_OPTIONS,
    }),
  );
}

bootstrap();
