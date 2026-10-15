import { Module } from '@nestjs/common';
import { ApplicationModule } from '@application';
import { ViberLogConsumerService } from './services/viber-log-consumer.service';
import { EmailLogConsumerService } from './services/email-log-consumer.service';
import { SmsLogConsumerService } from './services/sms-log-consumer.service';

@Module({
  imports: [ApplicationModule],
  controllers: [],
  providers: [SmsLogConsumerService, ViberLogConsumerService, EmailLogConsumerService],
})
export class LogConsumerModule {}
