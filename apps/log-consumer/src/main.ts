import 'zod/compile';
import '@framework/trace/register';
import { NestFactory } from '@nestjs/core';
import { LogConsumerModule } from './log-consumer.module';
import { Logger as PinoLogger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(LogConsumerModule, {
    bufferLogs: true,
  });
  app.enableShutdownHooks();
  app.useLogger(app.get(PinoLogger));
  app.flushLogs();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
