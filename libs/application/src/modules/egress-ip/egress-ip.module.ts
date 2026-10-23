import { Module } from '@nestjs/common';
import { EgressIpService } from './services/egress-ip.service.js';

@Module({
  providers: [EgressIpService],
  exports: [EgressIpService],
})
export class EgressIpModule {}
