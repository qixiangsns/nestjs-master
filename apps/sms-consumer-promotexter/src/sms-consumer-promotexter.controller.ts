import { Controller, Get } from '@nestjs/common';
import { SmsConsumerPromotexterService } from './sms-consumer-promotexter.service';

@Controller()
export class SmsConsumerPromotexterController {
  constructor(private readonly smsConsumerPromotexterService: SmsConsumerPromotexterService) {}

  @Get()
  getHello(): string {
    return this.smsConsumerPromotexterService.getHello();
  }
}
