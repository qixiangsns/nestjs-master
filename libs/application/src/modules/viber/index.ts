// Public contract of the viber module. Import from '@application/modules/viber' only, never from nested paths.

// Nest module
export * from './viber.module.js';

// Domain models
export * from './models/viber-account.model.js';
export * from './models/viber-log.model.js';
export * from './models/viber-message.model.js';
export * from './models/viber-provider.model.js';
export * from './models/viber-route-config.model.js';

// API request/response contracts
export * from './dtos/index.js';

// Services
export * from './services/viber-provider.service.js';
export * from './services/viber-account.service.js';
export * from './services/viber-log.service.js';
export * from './services/viber-route-config.service.js';
export * from './services/viber-sender.service.js';

// Messaging contracts (topic/channel names + payloads); producers stay internal
export * from './queues/viber-log.queues.js';
export * from './signals/viber-account.signals.js';
export * from './signals/viber-route-config.signals.js';

// Workers
export { ViberWorkerManagerFactory } from './workers/viber-worker-manager.factory.js';
export type { ViberWorkerManager } from './workers/viber-worker.manager.js';
