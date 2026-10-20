const SPAN_PARAM_METADATA = 'tracing:span';

/**
 * Injects the active {@link Span} created by `@TraceCron` into the
 * decorated parameter.
 * @warning
 * The value is `undefined` when called outside a `@TraceCron`-decorated method.
 *
 * @example
 * async handleCron(@ActiveSpan() span?: Span) {
 *   span?.setAttribute('attr', 'attr_value');
 * }
 */
export function ActiveSpan(): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    const existing: number[] = Reflect.getMetadata(SPAN_PARAM_METADATA, target, propertyKey!) ?? [];

    Reflect.defineMetadata(SPAN_PARAM_METADATA, [...existing, parameterIndex], target, propertyKey!);
  };
}

/** Indices of the `@ActiveSpan()` parameters on a method. */
export function getActiveSpanParamIndices(target: object, propertyKey: string | symbol): number[] {
  return Reflect.getMetadata(SPAN_PARAM_METADATA, target, propertyKey) ?? [];
}
