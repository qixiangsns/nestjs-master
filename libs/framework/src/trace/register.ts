/**
 * Starts the OpenTelemetry SDK. Import it as the first line of an app's `main.ts`,
 * before any other import, so auto-instrumentation can patch modules as they load.
 *
 * @example
 * import '@framework/trace/register';
 */
import { startTracing } from './setup/setup.trace.js';

startTracing();
