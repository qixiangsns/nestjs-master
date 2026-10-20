import { Tracer, Span, SpanStatusCode } from '@opentelemetry/api';
import { getActiveSpanParamIndices } from './active-span.decorator';

type TraceOptions = {
  name: string;
  tracer: Tracer;
};

/**
 * Starts a root trace span wrapping the decorated service method.
 * The span is ended automatically when the method resolves or throws.
 *
 * @param name  Defaults to `ClassName.methodName` when omitted.
 * @param tracer    Defaults to the global tracer named 'app'.
 *
 */
export function TraceCron(options: TraceOptions): MethodDecorator {
  return (target, propertyKey, descriptor: PropertyDescriptor) => {
    const { name, tracer } = options;
    const originalMethod = descriptor.value as (...args: unknown[]) => unknown;
    const spanName = name ?? `${target.constructor.name}.${String(propertyKey)}`;

    const wrapped = async function (this: unknown, ...args: unknown[]) {
      // Inject the span into any @ActiveSpan() parameters.
      const spanParamIndices = getActiveSpanParamIndices(target, propertyKey);

      return await tracer.startActiveSpan(spanName, async (span: Span) => {
        for (const index of spanParamIndices) {
          args[index] = span;
        }

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

    // Preserve metadata set by decorators applied before this one (e.g. @Cron via SetMetadata).
    for (const key of Reflect.getMetadataKeys(originalMethod)) {
      Reflect.defineMetadata(key, Reflect.getMetadata(key, originalMethod), wrapped);
    }
    Object.defineProperty(wrapped, 'name', { value: originalMethod.name });

    descriptor.value = wrapped;
    return descriptor;
  };
}
