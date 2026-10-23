import { PulsarModuleV2 } from '@framework/pulsar/index.js';
import Pulsar from 'pulsar-client';
import { Secret, SECRET_TOKEN } from '../config/index.js';

export const PULSAR_CONN_TOKEN = {
  PRIMARY: Symbol('PULSAR_CONN'),
};

export const PulsarConnection = () =>
  PulsarModuleV2.forRootAsync({
    provide: PULSAR_CONN_TOKEN.PRIMARY,
    useFactory: (secret: Secret) => ({
      serviceUrl: secret.PULSAR_URL,
      authentication: new Pulsar.AuthenticationToken({ token: secret.PULSAR_TOKEN }),
    }),
    inject: [SECRET_TOKEN],
  });
