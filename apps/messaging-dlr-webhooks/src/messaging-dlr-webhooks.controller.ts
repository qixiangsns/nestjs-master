import { Controller, Get } from '@nestjs/common';
import { MessagingDlrWebhooksService } from './messaging-dlr-webhooks.service';

@Controller()
export class MessagingDlrWebhooksController {
  constructor(private readonly messagingDlrWebhooksService: MessagingDlrWebhooksService) {}

  @Get()
  getHello(): string {
    return this.messagingDlrWebhooksService.getHello();
  }
}
