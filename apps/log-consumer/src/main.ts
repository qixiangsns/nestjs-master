import { NestFactory } from '@nestjs/core';
import { LogConsumerModule } from './log-consumer.module';

async function bootstrap() {
  const app = await NestFactory.create(LogConsumerModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
