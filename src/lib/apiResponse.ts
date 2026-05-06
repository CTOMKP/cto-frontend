/**
 * Your `fetch` helpers return the **parsed JSON body** as-is. Many backends still
 * wrap the real payload once under `data` (similar to axios `response.data`).
 *
 * Example:
 * `{ "data": { "id": "abc" } }` → `{ "id": "abc" }`
 */
export function unwrapApiData<T = unknown>(res: unknown): T {
  return ((res as { data?: unknown })?.data ?? res) as T;
}

/**
 * Some Nest-style stacks wrap the payload **more than once** (`TransformInterceptor`,
 * module boundaries, or `{ data: { data: … } }`). This walks `.data` repeatedly until
 * there is no nested `data` (or max depth), so you end up at the actual object/array.
 *
 * Prefer {@link unwrapApiJsonBody} at call sites unless you need only one step.
 */
export function unwrapApiEnvelope<T = unknown>(res: unknown): T {
  let current: unknown = res;
  const maxDepth = 6;
  for (let i = 0; i < maxDepth; i += 1) {
    if (!current || typeof current !== "object") break;
    const next = (current as { data?: unknown }).data;
    if (next === undefined) break;
    current = next;
  }
  return current as T;
}

/**
 * Normalizes a successful API JSON body to the innermost payload: first the usual
 * single `data` wrapper ({@link unwrapApiData}), then any extra nested `data` layers
 * ({@link unwrapApiEnvelope}). Use this in services instead of chaining both manually.
 */
export function unwrapApiJsonBody<T = unknown>(raw: unknown): T {
  return unwrapApiEnvelope(unwrapApiData(raw)) as T;
}

export function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

