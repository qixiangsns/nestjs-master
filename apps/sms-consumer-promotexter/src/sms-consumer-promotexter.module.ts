import { Module } from '@nestjs/common';
import { SmsConsumerPromotexterController } from './sms-consumer-promotexter.controller';
import { SmsConsumerPromotexterService } from './sms-consumer-promotexter.service';

@Module({
  imports: [],
  controllers: [SmsConsumerPromotexterController],
  providers: [SmsConsumerPromotexterService],
})
export class SmsConsumerPromotexterModule {}
