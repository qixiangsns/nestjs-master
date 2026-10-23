import { Module } from '@nestjs/common';
import { SmsController } from './controllers/sms/sms.controller.js';
import { AuthController } from './controllers/auth/auth.controller.js';
import { EmailController } from './controllers/email/email.controller.js';
import { AdminsController } from './controllers/admins/admins.controller.js';
import { ViberController } from './controllers/viber/viber.controller.js';
import { LimiterController } from './controllers/limiter/limiter.controller.js';
import { SecretsModule } from '@framework/secret/index.js';
import { ENV_TOKEN, EnvSchema } from './env.js';
import { ApplicationModule } from '@application';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { HealthModule } from '@framework/health/index.js';
import { HealthController } from './controllers/health/health.controller.js';

@Module({
  imports: [
    ApplicationModule,
    SecretsModule.forRoot([
      {
        provide: ENV_TOKEN,
        schema: EnvSchema,
        providerType: 'env',
        envFilePath: ['.env.backoffice-api'],
      },
    ]),
    HealthModule,
  ],
  controllers: [
    SmsController,
    AuthController,
    EmailController,
    AdminsController,
    ViberController,
    LimiterController,
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
export class BackofficeApiModule {}
