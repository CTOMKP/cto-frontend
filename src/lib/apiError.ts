import { ERROR_MESSAGES } from "@/utils/constants";

export class ApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly body: unknown;

  constructor(status: number, statusText: string, body: unknown) {
    super(ApiError.messageFromBody(status, body));
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }

  static messageFromBody(status: number, body: unknown): string {
    if (typeof body === "string" && body.trim()) {
      const trimmed = body.trim();
      if (trimmed.length > 280) return `${trimmed.slice(0, 277)}…`;
      return trimmed;
    }

    if (body && typeof body === "object") {
      const o = body as Record<string, unknown>;
      const nested = o.data && typeof o.data === "object" ? (o.data as Record<string, unknown>) : null;

      const pick = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

      const msg =
        pick(o.message) ||
        pick(o.error) ||
        pick(nested?.message) ||
        (Array.isArray(o.errors) && o.errors.length > 0 ? pick(String(o.errors[0])) : null);

      if (msg) return msg;
    }

    if (status === 401) return ERROR_MESSAGES.auth.sessionExpired;
    if (status === 403) return "You do not have permission to perform this action.";
    if (status === 404) return "The requested resource was not found.";
    if (status === 408) return "The request timed out. Please try again.";
    if (status === 429) return "Too many requests. Please wait and try again.";
    if (status >= 500) return ERROR_MESSAGES.general.networkError;

    return ERROR_MESSAGES.general.unknownError;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
