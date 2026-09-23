import { NestFactory } from '@nestjs/core';
import { MessagingDlrWebhooksModule } from './messaging-dlr-webhooks.module';

async function bootstrap() {
  const app = await NestFactory.create(MessagingDlrWebhooksModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
