import { MONGO_CONN_NAME } from '@application/connnections';
import { MongooseModule } from '@nestjs/mongoose';
import { LimiterPool, LimiterPoolSchema } from './limiter-pool.schema';

export const MongoSchemaModule = MongooseModule.forFeature(
  [{ name: LimiterPool.name, schema: LimiterPoolSchema }],
  MONGO_CONN_NAME.PRIMARY,
);
