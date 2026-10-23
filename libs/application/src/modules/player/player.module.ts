import { Module } from '@nestjs/common';
import { FpmsPlayerGrpcClient } from '@application/integrations/fpms-player-grpc/index.js';
import { ExternalSmsMissionClient } from '@application/integrations/external-sms-mission/index.js';
import { Secret, SECRET_TOKEN } from '@application/config/index.js';
import { PlayerService } from './player.service.js';

@Module({
  imports: [],
  exports: [PlayerService],
  providers: [
    PlayerService,
    {
      provide: FpmsPlayerGrpcClient,
      useFactory: (secret: Secret) =>
        new FpmsPlayerGrpcClient({
          baseUrl: secret.PLAYER_GRPC_URL,
        }),
      inject: [SECRET_TOKEN],
    },
    {
      provide: ExternalSmsMissionClient,
      useFactory: (secret: Secret) =>
        new ExternalSmsMissionClient({
          baseUrl: secret.EXTERNAL_SMS_MISSION_URL,
          timeoutMs: 10000,
        }),
      inject: [SECRET_TOKEN],
    },
  ],
})
export class PlayerModule {}
