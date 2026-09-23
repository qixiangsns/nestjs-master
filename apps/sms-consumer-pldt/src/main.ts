import { NestFactory } from '@nestjs/core';
import { SmsConsumerPldtModule } from './sms-consumer-pldt.module';

async function bootstrap() {
  const app = await NestFactory.create(SmsConsumerPldtModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
