import { Test, TestingModule } from '@nestjs/testing';
import { SmsConsumerPldtController } from './sms-consumer-pldt.controller';
import { SmsConsumerPldtService } from './sms-consumer-pldt.service';

describe('SmsConsumerPldtController', () => {
  let smsConsumerPldtController: SmsConsumerPldtController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SmsConsumerPldtController],
      providers: [SmsConsumerPldtService],
    }).compile();

    smsConsumerPldtController = app.get<SmsConsumerPldtController>(SmsConsumerPldtController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(smsConsumerPldtController.getHello()).toBe('Hello World!');
    });
  });
});
