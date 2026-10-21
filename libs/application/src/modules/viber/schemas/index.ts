import { MONGO_CONN_NAME } from '@application/connections';
import { MongooseModule } from '@nestjs/mongoose';
import { ViberLog, ViberLogSchema } from './viber-log.schema';
import { ViberProvider, ViberProviderSchema } from './viber-provider.schema';
import { ViberRouteConfig, ViberRouteConfigSchema } from './viber-route-config.schema';
import {
  ViberAccountBase,
  ViberAccountApiToken,
  ViberAccountApiTokenSchema,
  ViberAccountApiKeySecret,
  ViberAccountApiKeySecretSchema,
  ViberAccountBaseSchema,
} from './viber-account.schema';
import { AccountType } from '../models/viber-account.model';

export const MongoSchemaModule = MongooseModule.forFeature(
  [
    {
      name: ViberAccountBase.name,
      schema: ViberAccountBaseSchema,
      discriminators: [
        {
          name: ViberAccountApiToken.name,
          schema: ViberAccountApiTokenSchema,
          value: 'ApiToken' satisfies AccountType,
        },
        {
          name: ViberAccountApiKeySecret.name,
          schema: ViberAccountApiKeySecretSchema,
          value: 'ApiKeySecret' satisfies AccountType,
        },
      ],
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
