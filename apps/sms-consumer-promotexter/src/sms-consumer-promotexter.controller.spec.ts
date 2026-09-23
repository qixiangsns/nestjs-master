import { Test, TestingModule } from '@nestjs/testing';
import { SmsConsumerPromotexterController } from './sms-consumer-promotexter.controller';
import { SmsConsumerPromotexterService } from './sms-consumer-promotexter.service';

describe('SmsConsumerPromotexterController', () => {
  let smsConsumerPromotexterController: SmsConsumerPromotexterController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SmsConsumerPromotexterController],
      providers: [SmsConsumerPromotexterService],
    }).compile();

    smsConsumerPromotexterController = app.get<SmsConsumerPromotexterController>(SmsConsumerPromotexterController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(smsConsumerPromotexterController.getHello()).toBe('Hello World!');
    });
  });
});
