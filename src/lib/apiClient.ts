import { clearSessionStorage, getAuthToken } from "@/lib/authSession";
import { ApiError } from "@/lib/apiError";

const DEFAULT_BASE = "https://api.ctomarketplace.com";

export function getBackendBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || DEFAULT_BASE;
  return base.replace(/\/$/, "");
}

export type ApiRequestOptions = {
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** When true (default), sends Bearer token if present. */
  auth?: boolean;
  /** When true, clears stored auth token on 401 after throwing. */
  clearSessionOn401?: boolean;
};

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

/**
 * Typed JSON request. Throws {@link ApiError} on non-OK responses.
 */
export async function apiRequest<T>(options: ApiRequestOptions): Promise<T> {
  const {
    path,
    method = "GET",
    body,
    headers = {},
    signal,
    auth = true,
    clearSessionOn401 = true,
  } = options;

  const url = path.startsWith("http") ? path : `${getBackendBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  const h = new Headers({
    Accept: "application/json",
    "Content-Type": "application/json",
    ...headers,
  });

  if (auth) {
    const token = getAuthToken();
    if (token) h.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, {
    method,
    headers: h,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  if (res.status === 204 || res.status === 205) {
    return undefined as T;
  }

  const parsed = await parseBody(res);

  if (!res.ok) {
    if (clearSessionOn401 && res.status === 401) {
      clearSessionStorage();
    }
    throw new ApiError(res.status, res.statusText, parsed);
  }

  return parsed as T;
}

export function apiGet<T>(path: string, init?: Omit<ApiRequestOptions, "path" | "method" | "body">) {
  return apiRequest<T>({ ...init, path, method: "GET" });
}

export function apiPost<T>(path: string, body?: unknown, init?: Omit<ApiRequestOptions, "path" | "method" | "body">) {
  return apiRequest<T>({ ...init, path, method: "POST", body });
}

export function apiPut<T>(path: string, body?: unknown, init?: Omit<ApiRequestOptions, "path" | "method" | "body">) {
  return apiRequest<T>({ ...init, path, method: "PUT", body });
}

export function apiPatch<T>(path: string, body?: unknown, init?: Omit<ApiRequestOptions, "path" | "method" | "body">) {
  return apiRequest<T>({ ...init, path, method: "PATCH", body });
}

export function apiDelete<T>(path: string, init?: Omit<ApiRequestOptions, "path" | "method" | "body">) {
  return apiRequest<T>({ ...init, path, method: "DELETE" });
}
