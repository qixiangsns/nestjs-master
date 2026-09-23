import { Controller, Get } from '@nestjs/common';
import { SmsConsumerPldtSmppService } from './sms-consumer-pldt-smpp.service';

@Controller()
export class SmsConsumerPldtSmppController {
  constructor(private readonly smsConsumerPldtSmppService: SmsConsumerPldtSmppService) {}

  @Get()
  getHello(): string {
    return this.smsConsumerPldtSmppService.getHello();
  }
}
