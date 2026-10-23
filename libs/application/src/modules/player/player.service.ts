import { FpmsPlayerGrpcClient } from '@application/integrations/fpms-player-grpc/index.js';
import { ExternalSmsMissionClient } from '@application/integrations/external-sms-mission/index.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PlayerService {
  constructor(
    private readonly externalSmsMission: ExternalSmsMissionClient,
    private readonly playerGrpcService: FpmsPlayerGrpcClient,
  ) {}

  async getPhoneNumber(playerId: string): Promise<string | null> {
    const phoneNumber = await this.externalSmsMission.getPlayerPhoneNumber(playerId);
    return phoneNumber.length > 0 ? phoneNumber : null;
  }

  async getEmailAddress(playerId: string): Promise<string | null> {
    const emailAddress = await this.playerGrpcService.getPlayerEmailByPlayerId(playerId);
    if (!emailAddress) return null;

    return emailAddress.length > 0 ? emailAddress : null;
  }
}
