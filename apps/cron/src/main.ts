import 'zod/compile';
import '@framework/trace/register';
import { NestFactory } from '@nestjs/core';
import { CronModule } from './cron.module';

async function bootstrap() {
  const app = await NestFactory.create(CronModule);
  app.enableShutdownHooks();
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
