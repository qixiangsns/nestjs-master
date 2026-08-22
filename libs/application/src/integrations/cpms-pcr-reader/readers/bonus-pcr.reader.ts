import { Injectable, Inject, Logger } from '@nestjs/common';
import { type QueryClient, CLIENT_TOKEN } from '../providers/query.provider';
import { formatDateTime } from '@framework/clickhouse';

@Injectable()
export class BonusPcrReader {
  private logger: Logger = new Logger(BonusPcrReader.name);
  constructor(@Inject(CLIENT_TOKEN) private readonly client: QueryClient) {}

  async getTotalBonusAmount(settlementTime: {
    gte: Date;
    lt: Date;
  }): Promise<number> {
    const query = this.client
      .table('BONUS_PCR')
      .sum('bonusAmount', 'total_bonus_amount')
      .where('createTime', 'gte', formatDateTime(settlementTime.gte))
      .where('createTime', 'lt', formatDateTime(settlementTime.lt));

    const result = await query.execute();
    return result[0].total_bonus_amount
      ? Number(result[0].total_bonus_amount)
      : 0;
  }
}
