import { Test, TestingModule } from '@nestjs/testing';
import { SmsConsumerPldtSmppController } from './sms-consumer-pldt-smpp.controller';
import { SmsConsumerPldtSmppService } from './sms-consumer-pldt-smpp.service';

describe('SmsConsumerPldtSmppController', () => {
  let smsConsumerPldtSmppController: SmsConsumerPldtSmppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SmsConsumerPldtSmppController],
      providers: [SmsConsumerPldtSmppService],
    }).compile();

    smsConsumerPldtSmppController = app.get<SmsConsumerPldtSmppController>(SmsConsumerPldtSmppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(smsConsumerPldtSmppController.getHello()).toBe('Hello World!');
    });
  });
});
