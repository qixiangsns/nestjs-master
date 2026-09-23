import { Module } from '@nestjs/common';
import { ApplicationModule } from '@application';
import { SecretsModule } from '@framework/secret/secret.module';
import { API_ENV_TOKEN, ApiEnvSchema } from './config';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { EmailController } from './controllers/email/email.controller';
import { SmsController } from './controllers/sms/sms.controller';
import { WhatsappController } from './controllers/whatsapp/whatsapp.controller';
import { ViberController } from './controllers/viber/viber.controller';

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
  ],
  controllers: [EmailController, SmsController, WhatsappController, ViberController],
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
