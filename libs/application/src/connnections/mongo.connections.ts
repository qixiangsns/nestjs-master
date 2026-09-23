import { MongooseModule } from '@nestjs/mongoose';
import { Secret, SECRET_TOKEN } from '../config';

export const MONGO_CONN_NAME = {
  PRIMARY: 'PRIMARY',
} as const;

export const MongoDbConnection = () =>
  MongooseModule.forRootAsync({
    connectionName: MONGO_CONN_NAME.PRIMARY,
    useFactory: (secret: Secret) => ({ uri: secret.MONGO_DB_URL }),
    inject: [SECRET_TOKEN],
  });
