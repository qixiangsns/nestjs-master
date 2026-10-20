import { context, propagation } from '@opentelemetry/api';

/**
 * W3C trace context headers (e.g. `traceparent`) for the current active span.
 * Send them with an outgoing message so `@TraceConsumer` can continue the trace.
 */
export function getTraceHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  propagation.inject(context.active(), headers);
  return headers;
}
