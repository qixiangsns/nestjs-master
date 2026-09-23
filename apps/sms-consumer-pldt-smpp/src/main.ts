import { NestFactory } from '@nestjs/core';
import { SmsConsumerPldtSmppModule } from './sms-consumer-pldt-smpp.module';

async function bootstrap() {
  const app = await NestFactory.create(SmsConsumerPldtSmppModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
