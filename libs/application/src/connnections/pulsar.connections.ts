import { PulsarModule } from '@framework/pulsar/pulsar.module';
import { AuthenticationToken } from 'pulsar-client';
import { Secret, SECRET_TOKEN } from '../config';

export const PULSAR_TOKEN = {
  PRIMARY: Symbol('PRIMARY'),
};

export const PulsarConnection = () =>
  PulsarModule.forRootAsync({
    provide: PULSAR_TOKEN.PRIMARY,
    useFactory: (secret: Secret) => ({
      serviceUrl: secret.PULSAR_URL,
      authentication: new AuthenticationToken({ token: secret.PULSAR_TOKEN }),
    }),
    inject: [SECRET_TOKEN],
  });
