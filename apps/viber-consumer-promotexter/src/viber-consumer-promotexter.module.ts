import { Module } from '@nestjs/common';
import { ViberConsumerPromotexterService } from './viber-consumer-promotexter.service';
import { ApplicationModule } from '@application';
import { SecretsModule } from '@framework/secret';
import { CONSUMER_ENV_TOKEN, ConsumerEnvSchema } from './env';

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
  ],
  controllers: [],
  providers: [ViberConsumerPromotexterService],
})
export class ViberConsumerPromotexterModule {}
