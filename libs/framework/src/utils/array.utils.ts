/**
 * Check every value in the array appears only once, e.g. `[1, 2, 3]` -> true, `[1, 2, 1]` -> false.
 */
export function isArrayUnique<T>(values: readonly T[]): boolean {
  return new Set(values).size === values.length;
}
