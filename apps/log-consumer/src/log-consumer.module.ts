import { Module } from '@nestjs/common';
import { ApplicationModule } from '@application';
import { ViberLogConsumerService } from './services/viber-log-consumer.service';
import { EmailLogConsumerService } from './services/email-log-consumer.service';
import { SmsLogConsumerService } from './services/sms-log-consumer.service';
import { HealthModule } from '@framework/health';
import { HealthController } from './controllers/health/health.controller';

@Module({
  imports: [ApplicationModule, HealthModule],
  controllers: [HealthController],
  providers: [SmsLogConsumerService, ViberLogConsumerService, EmailLogConsumerService],
})
export class LogConsumerModule {}
