import { Options } from 'pino-http';
import { PrettyOptions } from 'pino-pretty';
import { callerMixin, traceMixin, versionMixin } from './mixins';
const PRETTY_OPTIONS = {
  levelFirst: false,
  ignore: 'pid,hostname,time,context',
} as const satisfies PrettyOptions;

const DEFAULT_OPTIONS = {
  base: null,
  redact: {
    paths: ['reqId'],
    remove: true,
  },
  autoLogging: false,
  quietReqLogger: true,
  quietResLogger: true,
} as const satisfies Options;

const PRODUCTION_OPTIONS = {
  level: 'debug',
  mixin: () => ({ ...traceMixin(), ...versionMixin(), reqId: undefined }),
  transport: {
    targets: [
      {
        target: 'pino/file',
        options: {
          destination: 1,
        },
      },
    ],
  },
} as const satisfies Options;

const DEVELOPMENT_OPTIONS = {
  level: 'debug',
  transport: {
    target: 'pino-pretty',
    options: PRETTY_OPTIONS,
  },
  mixin: () => ({ ...callerMixin(new Error().stack) }),
} as const satisfies Options;

export const getPinoOptions = (isProduction: boolean): Options => ({
  ...DEFAULT_OPTIONS,
  ...(isProduction ? PRODUCTION_OPTIONS : DEVELOPMENT_OPTIONS),
});
