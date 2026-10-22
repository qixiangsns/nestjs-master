import { Module } from '@nestjs/common';
import { EgressIpService } from './services/egress-ip.service';

@Module({
  providers: [EgressIpService],
  exports: [EgressIpService],
})
export class EgressIpModule {}
