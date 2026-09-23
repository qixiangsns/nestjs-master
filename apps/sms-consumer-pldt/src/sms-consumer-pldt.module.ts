import { Module } from '@nestjs/common';
import { SmsConsumerPldtController } from './sms-consumer-pldt.controller';
import { SmsConsumerPldtService } from './sms-consumer-pldt.service';

@Module({
  imports: [],
  controllers: [SmsConsumerPldtController],
  providers: [SmsConsumerPldtService],
})
export class SmsConsumerPldtModule {}
