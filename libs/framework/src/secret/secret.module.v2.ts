import { ConfigurableModuleBuilder, DynamicModule, Logger, Module, Provider } from '@nestjs/common';
import { SecretOptions, SecretsModuleExtras } from './interface/secret-options.interface.js';
import { loadSecret } from './load-secret.util.js';

export const DEFAULT_SECRET = Symbol('DEFAULT_SECRET');
export const SECRETS_MODULE_OPTIONS = Symbol('SECRETS_MODULE_OPTIONS');

const { ConfigurableModuleClass, OPTIONS_TYPE, ASYNC_OPTIONS_TYPE } =
  new ConfigurableModuleBuilder<SecretOptions>({
    optionsInjectionToken: SECRETS_MODULE_OPTIONS,
    alwaysTransient: true,
  })
    .setClassMethodName('forRoot')
    .setExtras<SecretsModuleExtras>(
      { provide: DEFAULT_SECRET },
      (definition, extras): DynamicModule => {
        const provider: Provider = {
          provide: extras.provide,
          useFactory: async (options: SecretOptions): Promise<unknown> => {
            const logger = new Logger(SecretsModuleV2.name);
            const secret = await loadSecret(options);
            logger.debug(`Secret loaded for ${extras.provide.toString()}`, { secret });
            return secret;
          },
          inject: [SECRETS_MODULE_OPTIONS],
        };

        return {
          ...definition,
          providers: [...(definition.providers ?? []), provider],
          exports: [provider],
          global: true,
        };
      },
    )
    .build();

// the generated methods mark every extra as optional, keep `schema` required
export type SecretsModuleV2Options = typeof OPTIONS_TYPE;
export type SecretsModuleV2AsyncOptions = typeof ASYNC_OPTIONS_TYPE;

@Module({})
export class SecretsModuleV2 extends ConfigurableModuleClass {}
