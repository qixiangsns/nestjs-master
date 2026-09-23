import { Module } from '@nestjs/common';
import { SmsConsumerPldtSmppController } from './sms-consumer-pldt-smpp.controller';
import { SmsConsumerPldtSmppService } from './sms-consumer-pldt-smpp.service';

@Module({
  imports: [],
  controllers: [SmsConsumerPldtSmppController],
  providers: [SmsConsumerPldtSmppService],
})
export class SmsConsumerPldtSmppModule {}
