import { Provider } from '@nestjs/common';
import { createQueryBuilder, logger } from '@hypequery/clickhouse';
import type { IntrospectedSchema } from '../schemas/database.schema';
import { ClickHouseClient } from '@framework/clickhouse';
import { CONNECTION_TOKEN } from './connection.provider';

export const CLIENT_TOKEN = Symbol('CPMS_PCR_READER_CLICKHOUSE_QUERY_CLIENT');
export type QueryClient = ReturnType<
  typeof createQueryBuilder<IntrospectedSchema>
>;
export const QueryClientProvider: Provider = {
  provide: CLIENT_TOKEN,
  useFactory: (client: ClickHouseClient): QueryClient => {
    logger.configure({
      enabled: false,
    });
    const db = createQueryBuilder<IntrospectedSchema>({ client });
    return db;
  },
  inject: [CONNECTION_TOKEN],
};
