/**
 * Base API client for making requests to the Next.js API routes.
 * This abstraction allows easy migration to an external backend later.
 */

import { ApiResponse, ApiError } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  const data: ApiResponse<T> = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || "An error occurred",
      response.status,
      data.details
    );
  }

  return data.data as T;
}

export const apiClient = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: "GET" }),

  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
};
