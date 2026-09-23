import { MONGO_CONN_NAME } from '@application/connnections';
import { MongooseModule } from '@nestjs/mongoose';
import { ViberAccount, ViberAccountSchema } from './viber-account.schema';
import { ViberLog, ViberLogSchema } from './viber-log.schema';
import { ViberProvider, ViberProviderSchema } from './viber-provider.schema';
import { ViberRouteConfig, ViberRouteConfigSchema } from './viber-route-config.schema';

export const MongoSchemaModule = MongooseModule.forFeature(
  [
    {
      name: ViberAccount.name,
      schema: ViberAccountSchema,
    },
    {
      name: ViberLog.name,
      schema: ViberLogSchema,
    },
    {
      name: ViberProvider.name,
      schema: ViberProviderSchema,
    },
    {
      name: ViberRouteConfig.name,
      schema: ViberRouteConfigSchema,
    },
  ],
  MONGO_CONN_NAME.PRIMARY,
);
