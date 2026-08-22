import { Injectable, Inject, Logger } from '@nestjs/common';
import { CLIENT_TOKEN, type QueryClient } from '../providers/query.provider';
import { formatDateTime } from '@framework/clickhouse';

@Injectable()
export class DynamicJackpotReader {
  private logger: Logger = new Logger(DynamicJackpotReader.name);
  constructor(@Inject(CLIENT_TOKEN) private readonly client: QueryClient) {}

  async getTotalJackpotAmount(createdAt: {
    gte: Date;
    lt: Date;
  }): Promise<number> {
    const query = this.client
      .table('dynamicJackpotRecord')
      .where('createdAt', 'gte', formatDateTime(createdAt.gte))
      .where('createdAt', 'lt', formatDateTime(createdAt.lt))
      .sum('jackpotAmount', 'total_jackpot');

    const result = await query.settings({ max_execution_time: 100 }).execute();

    return result[0]?.total_jackpot ? Number(result[0].total_jackpot) : 0;
  }
}
