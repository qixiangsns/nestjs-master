import { NestFactory } from '@nestjs/core';
import { ViberConsumerPromotexterModule } from './viber-consumer-promotexter.module';

async function bootstrap() {
  const app = await NestFactory.create(ViberConsumerPromotexterModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
