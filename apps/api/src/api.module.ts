import { Module } from '@nestjs/common';
import { AuthController, DataReportController } from './controllers';
import { ApplicationModule } from '@application';
import { SecretsModule } from '@framework/secret/secret.module';
import { API_ENV_TOKEN, ApiEnvSchema } from './config';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

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
  controllers: [AuthController, DataReportController],
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
