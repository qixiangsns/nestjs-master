import { MongooseModule } from '@nestjs/mongoose';
import { Secret, SECRET_TOKEN } from '../config';

export const MONGO_TOKEN = {
  PRIMARY: Symbol('PRIMARY'),
};

export const MongoDbConnection = () =>
  MongooseModule.forRootAsync({
    useFactory: (secret: Secret) => ({ uri: secret.MONGO_DB_URL }),
    inject: [SECRET_TOKEN],
  });
