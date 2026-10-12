import { Module } from '@nestjs/common';
import { ViberConsumerPromotexterService } from './viber-consumer-promotexter.service';
import { ApplicationModule } from '@application';
import { RedisSubscriberConnection } from '@application/connnections';

@Module({
  imports: [ApplicationModule, RedisSubscriberConnection()],
  controllers: [],
  providers: [ViberConsumerPromotexterService],
})
export class ViberConsumerPromotexterModule {}
