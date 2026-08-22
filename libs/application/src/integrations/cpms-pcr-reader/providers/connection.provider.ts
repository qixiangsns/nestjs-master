import { ClickhouseModule } from '@framework/clickhouse';
import { Secret, SECRET_TOKEN } from '@application/config';

export const CONNECTION_TOKEN = Symbol('CPMS_PCR_READER_CLICKHOUSE');

export const ConnectionProvider = ClickhouseModule.forRootAsync({
  provide: CONNECTION_TOKEN,
  useFactory: (secret: Secret) => ({
    url: secret.CLICKHOUSE_URL,
    database: 'player_consumption_record',
  }),
  inject: [SECRET_TOKEN],
});
