import { Test, TestingModule } from '@nestjs/testing';
import { SmsRouterController } from './sms-router.controller';
import { SmsRouterService } from './sms-router.service';

describe('SmsRouterController', () => {
  let smsRouterController: SmsRouterController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SmsRouterController],
      providers: [SmsRouterService],
    }).compile();

    smsRouterController = app.get<SmsRouterController>(SmsRouterController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(smsRouterController.getHello()).toBe('Hello World!');
    });
  });
});
