export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://taco-bell-api.404kidwiz.workers.dev";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  backoffMs?: number;
}

export class ApiError extends Error {
  public status: number;
  public data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// ── Timeout wrapper ────────────────────────────────────────────────────────────

function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new ApiError("Request timed out", 408));
    }, timeoutMs);

    fetch(url, init)
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// ── Sleep helper ───────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Core fetch with retry ──────────────────────────────────────────────────────

export async function apiFetch<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const {
    method = "GET",
    body,
    headers = {},
    timeout = 5000,
    retries = 3,
    backoffMs = 500,
  } = options;

  const url = `${API_BASE}${path}`;
  const fetchInit: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body !== undefined) {
    fetchInit.body = JSON.stringify(body);
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, fetchInit, timeout);

      if (response.ok) {
        const text = await response.text();
        // Handle empty responses
        if (!text) return undefined as T;
        return JSON.parse(text) as T;
      }

      // Non-OK response — don't retry client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        const errorData = await response.text().catch(() => null);
        let parsedError: unknown;
        try {
          parsedError = JSON.parse(errorData || "{}");
        } catch {
          parsedError = errorData;
        }
        throw new ApiError(
          `API error: ${response.status}`,
          response.status,
          parsedError
        );
      }

      // Server error (5xx) — retry
      lastError = new ApiError(`Server error: ${response.status}`, response.status);
    } catch (err: any) {
      // Network error or timeout — retry
      lastError = err instanceof ApiError ? err : new Error(err.message || "Network error");

      // Don't retry if it's a client error or abort
      if (err.name === "AbortError") throw err;
    }

    // If we've exhausted retries, throw
    if (attempt === retries) {
      throw lastError;
    }

    // Exponential backoff: 500ms, 1000ms, 2000ms, ...
    const delay = backoffMs * Math.pow(2, attempt);
    await sleep(delay);
  }

  // Should never reach here, but TypeScript needs a return
  throw lastError ?? new Error("Unknown API error");
}

// ── Convenience methods ────────────────────────────────────────────────────────

export const api = {
  get: <T>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body: unknown, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...options, method: "POST", body }),

  patch: <T>(path: string, body: unknown, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...options, method: "PATCH", body }),

  put: <T>(path: string, body: unknown, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...options, method: "PUT", body }),

  delete: <T>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...options, method: "DELETE" }),
};
