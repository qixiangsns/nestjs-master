import { Injectable, Inject, Logger } from '@nestjs/common';
import { CLIENT_TOKEN, type QueryClient } from '../providers/query.provider';
import { formatDateTime } from '@framework/clickhouse';
import { rawAs } from '@hypequery/clickhouse';

type GameWinlossReportFilter = {
  settlementTime: { gte: Date; lt: Date };
  platforms: string[];
  providers: string[];
  limit: number;
};

@Injectable()
export class PcrReader {
  private logger: Logger = new Logger(PcrReader.name);
  constructor(@Inject(CLIENT_TOKEN) private readonly client: QueryClient) {}

  async getTotalBetAmount(settlementTime: { gte: Date; lt: Date }): Promise<number> {
    const query = this.client
      .table('PCR')
      .where('settlementTime', 'gte', formatDateTime(settlementTime.gte))
      .where('settlementTime', 'lt', formatDateTime(settlementTime.lt))
      .sum('amount', 'total_bet');

    const result = await query.settings({ max_execution_time: 100 }).execute();
    return result[0]?.total_bet ? Number(result[0].total_bet) : 0;
  }

  async getGameStats(filter: GameWinlossReportFilter) {
    let lowestGgrGamesQuery = this.client
      .table('PCR')
      .select([
        'gameName',
        'providerName',
        'providerId',
        rawAs(`SUM(amount - (amount + bonusAmount))`, 'ggr'),
        rawAs(`(SUM(amount - (amount + bonusAmount)) / SUM(validAmount)) * 100`, 'profitRate'),
        rawAs(`(SUM(CASE WHEN (amount - bonusAmount) > 0 THEN 1 ELSE 0 END) / COUNT(*)) * 100`, 'winRate'),
      ])
      .countDistinct('playerName', 'uniquePlayers')
      .count('betId', 'betCount')
      .sum('amount', 'totalBetAmount')
      .sum('validAmount', 'totalValidAmount')
      .prewhere('settlementTime', 'gte', formatDateTime(filter.settlementTime.gte))
      .prewhere('settlementTime', 'lt', formatDateTime(filter.settlementTime.lt))
      .where('platformId', 'in', filter.platforms)
      .groupBy(['gameName', 'providerName', 'providerId'])
      .orderBy('ggr', 'ASC')
      .limit(filter.limit);

    if (filter.providers.length > 0) {
      lowestGgrGamesQuery = lowestGgrGamesQuery.where('providerId', 'in', filter.providers);
    }

    const lowestGgrGames = await lowestGgrGamesQuery.execute();

    const lowestGgrGamesPlayerGgr = await this.client.rawQuery<{
      gameName: string;
      providerName: string;
      providerId: string;
      positiveGgr: number;
      negativeGgr: number;
    }>(
      `SELECT
        gameName,
        providerName,
        providerId,
        sumIf(playerGGR, playerGGR > 0) AS positiveGgr,
        sumIf(playerGGR, playerGGR < 0) AS negativeGgr
      FROM (
        SELECT
          gameName,
          providerName,
          providerId,
          playerName,
          SUM(amount - (amount + bonusAmount)) AS playerGGR
        FROM player_consumption_record.PCR
        WHERE 
          (settlementTime >= ? AND settlementTime <= ?) 
          AND platformId IN (?)
          AND (gameName, providerId) IN (?)
        GROUP BY gameName, providerName, providerId, playerName
      )
      GROUP BY gameName, providerName, providerId`,
      [
        formatDateTime(filter.settlementTime.gte),
        formatDateTime(filter.settlementTime.lt),
        filter.platforms,
        lowestGgrGames.map((game) => [game.gameName, game.providerName]),
      ],
    );
  }
}
