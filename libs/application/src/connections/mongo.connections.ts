import { MongooseModule } from '@nestjs/mongoose';
import { Secret, SECRET_TOKEN } from '../config/index.js';

export const MONGO_CONN_NAME = {
  PRIMARY: 'MONGO_CONN',
} as const;

export const MongoDbConnection = () =>
  MongooseModule.forRootAsync({
    connectionName: MONGO_CONN_NAME.PRIMARY,
    useFactory: (secret: Secret) => ({ uri: secret.MONGO_DB_URL }),
    inject: [SECRET_TOKEN],
  });
