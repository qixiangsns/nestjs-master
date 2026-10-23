import { trace } from '@opentelemetry/api';

export function traceMixin() {
  const activeSpan = trace.getActiveSpan();

  if (!activeSpan) return {};

  return {
    trace_id: activeSpan.spanContext().traceId,
    span_id: activeSpan.spanContext().spanId,
  };
}
