import { Controller, Get } from '@nestjs/common';
import { SmsRouterService } from './sms-router.service';

@Controller()
export class SmsRouterController {
  constructor(private readonly smsRouterService: SmsRouterService) {}

  @Get()
  getHello(): string {
    return this.smsRouterService.getHello();
  }
}
