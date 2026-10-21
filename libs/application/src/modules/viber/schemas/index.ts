import { MONGO_CONN_NAME } from '@application/connections';
import { MongooseModule } from '@nestjs/mongoose';
import { VIBER_LOG_MODEL, ViberLogSchema } from './viber-log.schema';
import { VIBER_PROVIDER_MODEL, ViberProviderSchema } from './viber-provider.schema';
import { VIBER_ROUTE_CONFIG_MODEL, ViberRouteConfigSchema } from './viber-route-config.schema';
import {
  VIBER_ACCOUNT_MODEL,
  VIBER_ACCOUNT_API_TOKEN_MODEL,
  VIBER_ACCOUNT_API_KEY_SECRET_MODEL,
  VIBER_ACCOUNT_BEARER_TOKEN_MODEL,
  ViberAccountApiTokenSchema,
  ViberAccountApiKeySecretSchema,
  ViberAccountBearerTokenSchema,
  ViberAccountBaseSchema,
} from './viber-account.schema';
import { AccountType } from '../models/viber-account.model';

export const MongoSchemaModule = MongooseModule.forFeature(
  [
    {
      name: VIBER_ACCOUNT_MODEL,
      schema: ViberAccountBaseSchema,
      discriminators: [
        {
          name: VIBER_ACCOUNT_API_TOKEN_MODEL,
          schema: ViberAccountApiTokenSchema,
          value: 'ApiToken' satisfies AccountType,
        },
        {
          name: VIBER_ACCOUNT_API_KEY_SECRET_MODEL,
          schema: ViberAccountApiKeySecretSchema,
          value: 'ApiKeySecret' satisfies AccountType,
        },
        {
          name: VIBER_ACCOUNT_BEARER_TOKEN_MODEL,
          schema: ViberAccountBearerTokenSchema,
          value: 'BearerToken' satisfies AccountType,
        },
      ],
    },
    {
      name: VIBER_LOG_MODEL,
      schema: ViberLogSchema,
    },
    {
      name: VIBER_PROVIDER_MODEL,
      schema: ViberProviderSchema,
    },
    {
      name: VIBER_ROUTE_CONFIG_MODEL,
      schema: ViberRouteConfigSchema,
    },
  ],
  MONGO_CONN_NAME.PRIMARY,
);
