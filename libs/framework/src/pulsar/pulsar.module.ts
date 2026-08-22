import { Client, type ClientConfig } from 'pulsar-client';
import {
  DynamicModule,
  InjectionToken,
  Module,
  ModuleMetadata,
  OptionalFactoryDependency,
  Provider,
} from '@nestjs/common';

interface PulsarModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  provide: InjectionToken;
  useFactory: (...args: unknown[]) => Promise<ClientConfig> | ClientConfig;
  inject?: (InjectionToken | OptionalFactoryDependency)[];
}

@Module({})
/**
 * Register a global provider for the Pulsar client.
 */
export class PulsarModule {
  static forRootAsync(options: PulsarModuleAsyncOptions): DynamicModule {
    const provider: Provider<Client> = {
      provide: options.provide,
      useFactory: async (...args: unknown[]): Promise<Client> => {
        const connectionOptions = await options.useFactory(...args);
        const client = new Client(connectionOptions);
        return client;
      },
      inject: options.inject ?? [],
    };

    return {
      module: PulsarModule,
      providers: [provider],
      exports: [provider],
      imports: options.imports ?? [],
      global: true,
    };
  }
}
