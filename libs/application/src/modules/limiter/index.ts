// Public contract of the limiter module. Import from '@application/modules/limiter' only, never from nested paths.

// Nest module
export * from './limiter.module.js';

// Domain models
export * from './models/limiter.model.js';
export * from './models/limiter-pool.model.js';

// Mongoose model names for cross-module refs; entities stay internal
export { LIMITER_POOL_MODEL } from './schemas/limiter-pool.schema.js';

// API request/response contracts
export * from './dtos/index.js';

// Services
export * from './services/limiter.service.js';
export * from './services/limiter-pool.service.js';

// Messaging contracts (channel names + payloads); broadcaster stays internal
export * from './signals/limiter-pool.signals.js';
