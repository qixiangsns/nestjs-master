import axios, { AxiosInstance } from 'axios';

type Options = {
  baseUrl: string;
  timeoutMs: number;
};

export class ExternalSmsMissionClient {
  private readonly http: AxiosInstance;

  constructor(private readonly options: Options) {
    this.http = axios.create({
      baseURL: this.options.baseUrl,
      timeout: this.options.timeoutMs || 10_000,
    });
  }

  public async getPlayerPhoneNumber(playerId: string) {
    const response = await this.http.post<{ phoneNo: string }>('/getPlayerPhoneNoByPlayerId', {
      playerId,
    });

    return response.data.phoneNo;
  }
}
