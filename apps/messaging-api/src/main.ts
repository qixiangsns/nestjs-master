import { NestFactory } from '@nestjs/core';
import { Logger, VersioningType } from '@nestjs/common';
import { ApiModule } from './messaging-api.module';
import { Logger as PinoLogger } from 'nestjs-pino';
import { API_ENV_TOKEN, ApiEnv } from './config';
import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { DocumentBuilder } from '@nestjs/swagger';
import { DEFAULT_OPTIONS } from '@framework/scalar';
import { apiReference } from '@scalar/nestjs-api-reference';
import { version } from '@package';
import { otelSdk } from '@framework/trace';
import { cleanupOpenApiDoc } from 'nestjs-zod';

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
