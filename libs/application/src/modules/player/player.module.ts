import { Module } from '@nestjs/common';
import { PlayerGrpcService } from '@application/integrations/player-grpc';
import { ExternalSmsMissionApi } from '@application/integrations/external-sms-mission';
import { Secret, SECRET_TOKEN } from '@application/config';
import { PlayerService } from './player.service';

@Module({
  imports: [],
  exports: [PlayerService],
  providers: [
    PlayerService,
    {
      provide: PlayerGrpcService,
      useFactory: (secret: Secret) =>
        new PlayerGrpcService({
          baseUrl: secret.PLAYER_GRPC_URL,
        }),
      inject: [SECRET_TOKEN],
    },
    {
      provide: ExternalSmsMissionApi,
      useFactory: (secret: Secret) =>
        new ExternalSmsMissionApi({
          baseUrl: secret.EXTERNAL_SMS_MISSION_URL,
          timeoutMs: 10000,
        }),
      inject: [SECRET_TOKEN],
    },
  ],
})
export class PlayerModule {}
