import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

type Options = {
  baseUrl: string;
  timeoutMs: number;
};
@Injectable()
export class ExternalSmsMissionApi {
  private readonly client: AxiosInstance;

  constructor(private readonly options: Options) {
    this.client = axios.create({
      baseURL: this.options.baseUrl,
      timeout: this.options.timeoutMs || 10_000,
    });
  }

  public async getPlayerPhoneNumber(playerId: string) {
    const response = await this.client.post<{ phoneNo: string }>('/getPlayerPhoneNoByPlayerId', {
      playerId,
    });

    return response.data.phoneNo;
  }
}
