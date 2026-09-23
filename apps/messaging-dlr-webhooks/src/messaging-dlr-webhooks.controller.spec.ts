import { Test, TestingModule } from '@nestjs/testing';
import { MessagingDlrWebhooksController } from './messaging-dlr-webhooks.controller';
import { MessagingDlrWebhooksService } from './messaging-dlr-webhooks.service';

describe('MessagingDlrWebhooksController', () => {
  let messagingDlrWebhooksController: MessagingDlrWebhooksController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MessagingDlrWebhooksController],
      providers: [MessagingDlrWebhooksService],
    }).compile();

    messagingDlrWebhooksController = app.get<MessagingDlrWebhooksController>(MessagingDlrWebhooksController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(messagingDlrWebhooksController.getHello()).toBe('Hello World!');
    });
  });
});
