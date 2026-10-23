import { Module } from '@nestjs/common';
import { ApplicationModule } from '@application';
import { ViberLogConsumerService } from './services/viber-log-consumer.service.js';
import { EmailLogConsumerService } from './services/email-log-consumer.service.js';
import { SmsLogConsumerService } from './services/sms-log-consumer.service.js';
import { HealthModule } from '@framework/health/index.js';
import { HealthController } from './controllers/health/health.controller.js';

@Module({
  imports: [ApplicationModule, HealthModule],
  controllers: [HealthController],
  providers: [SmsLogConsumerService, ViberLogConsumerService, EmailLogConsumerService],
})
export class LogConsumerModule {}
