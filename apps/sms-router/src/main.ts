import { NestFactory } from '@nestjs/core';
import { SmsRouterModule } from './sms-router.module';

async function bootstrap() {
  const app = await NestFactory.create(SmsRouterModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
