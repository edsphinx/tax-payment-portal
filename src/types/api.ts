/**
 * API-related types and interfaces
 */

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  error: string;
  details?: unknown;
  existingId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}
