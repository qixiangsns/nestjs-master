import { MONGO_CONN_NAME } from '@application/connections';
import { MongooseModule } from '@nestjs/mongoose';
import { LIMITER_POOL_MODEL, LimiterPoolSchema } from './limiter-pool.schema';

export const MongoSchemaModule = MongooseModule.forFeature(
  [{ name: LIMITER_POOL_MODEL, schema: LimiterPoolSchema }],
  MONGO_CONN_NAME.PRIMARY,
);
