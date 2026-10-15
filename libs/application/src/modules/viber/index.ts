// Public contract of the viber module. Import from '@application/modules/viber' only, never from nested paths.

// Nest module
export * from './viber.module';

// Domain models
export * from './models/viber-account.model';
export * from './models/viber-log.model';
export * from './models/viber-message.model';
export * from './models/viber-provider.model';
export * from './models/viber-route-config.model';

// API request/response contracts
export * from './dtos';

// Services
export * from './services/viber-provider.service';
export * from './services/viber-account.service';
export * from './services/viber-log.service';
export * from './services/viber-route-config.service';
export * from './services/viber-sender.service';

// Messaging contracts (topic/channel names + payloads); producers stay internal
export * from './events/viber-log.events';
export * from './signals/viber-account.signals';
export * from './signals/viber-route-config.signals';

// Workers
export { ViberWorkerManagerFactory } from './workers/viber-worker-manager.factory';
export type { ViberWorkerManager } from './workers/viber-worker.manager';
