import { trace } from '@opentelemetry/api';

export function traceMixin() {
  const activeSpan = trace.getActiveSpan();
  return {
    ...(activeSpan
      ? {
          trace_id: activeSpan.spanContext().traceId,
          span_id: activeSpan.spanContext().spanId,
        }
      : {}),
  };
}
