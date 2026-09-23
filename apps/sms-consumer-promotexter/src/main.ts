import { NestFactory } from '@nestjs/core';
import { SmsConsumerPromotexterModule } from './sms-consumer-promotexter.module';

async function bootstrap() {
  const app = await NestFactory.create(SmsConsumerPromotexterModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
