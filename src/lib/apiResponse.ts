export function unwrapApiData<T = unknown>(res: unknown): T {
  return ((res as { data?: unknown })?.data ?? res) as T;
}

export function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

