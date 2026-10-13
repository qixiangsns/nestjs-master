import '@framework/trace';
import { NestFactory } from '@nestjs/core';
import { Logger, VersioningType, INestApplication } from '@nestjs/common';
import { Logger as PinoLogger } from 'nestjs-pino';
import { ApiModule } from './messaging-api.module';
import { API_ENV_TOKEN, ApiEnv } from './config';
import { DEFAULT_OPTIONS } from '@framework/scalar';
import { buildOpenApiDocument } from './openapi';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule, {
    bufferLogs: true,
  });
  const env = app.get<ApiEnv>(API_ENV_TOKEN);

  // Logging
  app.useLogger(app.get(PinoLogger));
  const logger = new Logger('Server');
  app.flushLogs();

  // API documentation
  app.enableVersioning({ type: VersioningType.URI });
  setupApiDocumentation(app);

  app.listen(env.PORT).then(() => {
    logger.log({ url: `http://localhost:${env.PORT}` }, `Server is running`);
    logger.log({ url: `http://localhost:${env.PORT}/api` }, 'API documentation is hosted');
  });
}

function setupApiDocumentation(app: INestApplication) {
  const document = buildOpenApiDocument(app);

  app.use('/api', apiReference({ content: document, ...DEFAULT_OPTIONS }));
}

bootstrap();
