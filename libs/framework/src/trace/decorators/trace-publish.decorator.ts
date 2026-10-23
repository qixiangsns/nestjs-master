import { Tracer, Span, SpanKind, SpanStatusCode } from '@opentelemetry/api';

type TracePublishOptions = {
  name: string;
  tracer: Tracer;
};

/**
 * Starts a producer span around the decorated publish method. The span is the active span
 * inside the method, so call `getTraceHeaders()` there and send the headers with the message
 * (e.g. as message headers/properties) so consumers can continue the trace.
 * Use `trace.getActiveSpan()` to enrich the producer span.
 * Transport-agnostic: works with any queue/broker the method publishes to.
 *
 * @param name    Span name.
 * @param tracer  Tracer used to start the span.
 *
 * @example
 * ```typescript
 *
 * const tracer = trace.getTracer('viber-log-dispatcher');
 *
 * @TracePublish({ name: 'dispatch-viber-log', tracer })
 * async dispatchViberLog(payload: ViberLog) {
 *    trace.getActiveSpan()?.setAttribute('viber.log.id', payload.id);
 *    await this.dispatcher.dispatch(payload, getTraceHeaders());
 * }
 *
 *
 * ```
 */
export function TracePublish(options: TracePublishOptions): MethodDecorator {
  return (target, propertyKey, descriptor: PropertyDescriptor) => {
    const { name, tracer } = options;
    const originalMethod = descriptor.value as (...args: unknown[]) => unknown;
    const spanName = name ?? `${target.constructor.name}.${String(propertyKey)}`;

    const wrapped = async function (this: unknown, ...args: unknown[]) {
      return await tracer.startActiveSpan(
        spanName,
        { kind: SpanKind.PRODUCER },
        async (span: Span) => {
          try {
            const result = await originalMethod.apply(this, args);
            span.setStatus({ code: SpanStatusCode.OK });
            return result;
          } catch (err) {
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: err instanceof Error ? err.message : String(err),
            });
            span.recordException(err as Error);
            throw err;
          } finally {
            span.end();
          }
        },
      );
    };

    // Preserve metadata set by decorators applied before this one (e.g. Nest's SetMetadata).
    for (const key of Reflect.getMetadataKeys(originalMethod)) {
      Reflect.defineMetadata(key, Reflect.getMetadata(key, originalMethod), wrapped);
    }
    Object.defineProperty(wrapped, 'name', { value: originalMethod.name });

    descriptor.value = wrapped;
    return descriptor;
  };
}
