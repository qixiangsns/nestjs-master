import { Injectable } from '@nestjs/common';

@Injectable()
export class MessagingDlrWebhooksService {
  getHello(): string {
    return 'Hello World!';
  }
}
