import { Module } from '@nestjs/common';
import { SmsController } from './controllers/sms/sms.controller';
import { AuthController } from './controllers/auth/auth.controller';
import { EmailController } from './controllers/email/email.controller';
import { AdminsController } from './controllers/admins/admins.controller';
import { SecretsModule } from '@framework/secret';
import { ENV_TOKEN, EnvSchema } from './env';
import { ApplicationModule } from '@application';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

@Module({
  imports: [
    ApplicationModule,
    SecretsModule.forRoot([
      {
        provide: ENV_TOKEN,
        schema: EnvSchema,
        providerType: 'env',
        envFilePath: ['.env.messaging-admin'],
      },
    ]),
  ],
  controllers: [SmsController, AuthController, EmailController, AdminsController],
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
export class MessagingAdminModule {}
