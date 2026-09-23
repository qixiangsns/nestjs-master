import { Controller, Get } from '@nestjs/common';
import { SmsConsumerPldtService } from './sms-consumer-pldt.service';

@Controller()
export class SmsConsumerPldtController {
  constructor(private readonly smsConsumerPldtService: SmsConsumerPldtService) {}

  @Get()
  getHello(): string {
    return this.smsConsumerPldtService.getHello();
  }
}
