/**
 * Standard backend envelope (TransformInterceptor).
 * All successful JSON responses use this wrapper unless noted.
 */
export interface ApiEnvelope<T> {
  data: T;
  statusCode: number;
  timestamp: string;
}

export interface ApiErrorBody {
  statusCode: number;
  message: string;
  error?: string;
  timestamp?: string;
}
