import { Module } from '@nestjs/common';
import { ViberConsumerPromotexterService } from './viber-consumer-promotexter.service.js';
import { ApplicationModule } from '@application';
import { SecretsModule } from '@framework/secret/index.js';
import { CONSUMER_ENV_TOKEN, ConsumerEnvSchema } from './env.js';
import { HealthModule } from '@framework/health/index.js';
import { HealthController } from './controllers/health/health.controller.js';

@Module({
  imports: [
    SecretsModule.forRoot([
      {
        provide: CONSUMER_ENV_TOKEN,
        providerType: 'env',
        schema: ConsumerEnvSchema,
        envFilePath: ['.env.viber-consumer'],
      },
    ]),
    ApplicationModule,
    HealthModule,
  ],
  controllers: [HealthController],
  providers: [ViberConsumerPromotexterService],
})
export class ViberConsumerPromotexterModule {}
