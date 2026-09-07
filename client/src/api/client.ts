import type { ApiResponse } from "../types";

export class ApiClientError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Demo mode (npm run dev:demo): every request is served from an in-memory
// mock "backend" instead of hitting the real Express API, so the frontend
// can run and be presented with no server/database at all. See src/mocks/.
// Off (undefined/false) in every normal dev/build, so this branch never
// runs against the real app.
const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === "true";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (MOCK_MODE) {
    const { mockRequest } = await import("../mocks/router");
    const body = typeof options.body === "string" ? JSON.parse(options.body) : undefined;
    return mockRequest<T>(options.method ?? "GET", path, body);
  }

  const res = await fetch(`/api${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? ((await res.json()) as ApiResponse<T>) : null;

  if (!res.ok) {
    throw new ApiClientError(res.status, body?.message || "Something went wrong. Please try again.");
  }

  return (body?.data as T) ?? (undefined as T);
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "POST", body: data !== undefined ? JSON.stringify(data) : undefined }),
  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "PATCH", body: data !== undefined ? JSON.stringify(data) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
