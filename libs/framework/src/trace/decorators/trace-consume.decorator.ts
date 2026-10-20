import { context, propagation, Tracer, Span, SpanKind, SpanStatusCode } from '@opentelemetry/api';

/** Returns the trace headers sent by `@TracePublish` from the consumer method's arguments. */
type HeadersExtractor<TArgs extends unknown[]> = (...args: TArgs) => Record<string, string> | undefined;

type TraceConsumerOptions<TArgs extends unknown[]> = {
  name: string;
  tracer: Tracer;
  getHeaders: HeadersExtractor<TArgs>;
};

type ConsumerMethod<TArgs extends unknown[]> = (...args: TArgs) => Promise<unknown>;

/**
 * Starts a consumer span around the decorated method, continuing the trace whose headers
 * (e.g. `traceparent`) were sent with the message by a `@TracePublish` producer.
 * When no headers are found, the span starts from the current active context instead.
 * The span is the active span inside the method; use `trace.getActiveSpan()` to enrich it.
 * The span is ended automatically when the method resolves or throws.
 *
 * @param name        Span name.
 * @param tracer      Tracer used to start the span.
 * @param getHeaders  Reads the propagated trace headers from the method arguments.
 *
 * @example
 * ```typescript
 *
 * const tracer = trace.getTracer('viber-message-consumer');
 *
 * `@TraceConsumer`({
 *   name: 'consume-viber-message',
 *   tracer,
 *   getHeaders: (message: Message) => message.getProperties(),
 * })
 * async handleMessage(message: Message) {
 *    trace.getActiveSpan()?.setAttribute('pulsar.message.id', message.getMessageId().toString());
 * }
 *
 * ```
 */
export function TraceConsumer<TArgs extends unknown[]>(options: TraceConsumerOptions<TArgs>) {
  return (target: object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<ConsumerMethod<TArgs>>) => {
    const { name, tracer, getHeaders } = options;
    const originalMethod = descriptor.value as ConsumerMethod<TArgs>;
    const spanName = name ?? `${target.constructor.name}.${String(propertyKey)}`;

    const wrapped = async function (this: unknown, ...args: TArgs) {
      const headers = getHeaders(...args);
      const parentContext = headers ? propagation.extract(context.active(), headers) : context.active();

      return await tracer.startActiveSpan(spanName, { kind: SpanKind.CONSUMER }, parentContext, async (span: Span) => {
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
      });
    };

    // Preserve metadata set by decorators applied before this one (e.g. Nest's SetMetadata).
    for (const key of Reflect.getMetadataKeys(originalMethod)) {
      Reflect.defineMetadata(key, Reflect.getMetadata(key, originalMethod), wrapped);
    }
    Object.defineProperty(wrapped, 'name', { value: originalMethod.name });

    // Mutate in place rather than returning the descriptor: its value is typed `Promise<unknown>`,
    // which would not be assignable back to the method's concrete return type.
    descriptor.value = wrapped;
  };
}
