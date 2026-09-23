import { Module } from '@nestjs/common';
import { MessagingDlrWebhooksController } from './messaging-dlr-webhooks.controller';
import { MessagingDlrWebhooksService } from './messaging-dlr-webhooks.service';

@Module({
  imports: [],
  controllers: [MessagingDlrWebhooksController],
  providers: [MessagingDlrWebhooksService],
})
export class MessagingDlrWebhooksModule {}
