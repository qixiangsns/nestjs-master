import { Module } from '@nestjs/common';
import { ApplicationModule } from '@application';
import { SecretsModule } from '@framework/secret/index.js';
import { API_ENV_TOKEN, ApiEnvSchema } from './config/index.js';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { EmailController } from './controllers/email/email.controller.js';
import { SmsController } from './controllers/sms/sms.controller.js';
import { WhatsappController } from './controllers/whatsapp/whatsapp.controller.js';
import { ViberController } from './controllers/viber/viber.controller.js';
import { HealthModule } from '@framework/health/index.js';
import { HealthController } from './controllers/health/health.controller.js';

@Module({
  imports: [
    SecretsModule.forRoot([
      {
        provide: API_ENV_TOKEN,
        schema: ApiEnvSchema,
        providerType: 'env',
        envFilePath: ['.env.api'],
      },
    ]),
    ApplicationModule,
    HealthModule,
  ],
  controllers: [
    EmailController,
    SmsController,
    WhatsappController,
    ViberController,
    HealthController,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
  ],
})
export class ApiModule {}
