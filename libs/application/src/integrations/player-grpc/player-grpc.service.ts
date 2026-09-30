import { createChannel, createClient, Channel, ChannelCredentials } from 'nice-grpc';
import { PlayerServiceClient, PlayerServiceDefinition } from './types/player';
import { OnModuleDestroy, Injectable } from '@nestjs/common';

type Options = {
  baseUrl: string;
};

@Injectable()
export class PlayerGrpcService implements OnModuleDestroy {
  private clientGrpc: PlayerServiceClient;
  private clientChannel: Channel;

  constructor(option: Options) {
    this.clientChannel = createChannel(option.baseUrl, ChannelCredentials.createInsecure());
    this.clientGrpc = createClient(PlayerServiceDefinition, this.clientChannel);
  }

  async getPlayerEmailByPlayerId(playerId: string) {
    const { data } = await this.clientGrpc.getPlayerEmailByPlayerId({
      playerId,
    });

    return data?.email || null;
  }

  async onModuleDestroy() {
    this.clientChannel.close();
  }
}
