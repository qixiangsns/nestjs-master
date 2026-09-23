import { Module } from '@nestjs/common';
import { SmsRouterController } from './sms-router.controller';
import { SmsRouterService } from './sms-router.service';

@Module({
  imports: [],
  controllers: [SmsRouterController],
  providers: [SmsRouterService],
})
export class SmsRouterModule {}
