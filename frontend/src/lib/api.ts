const CONFIGURED_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

<<<<<<< HEAD
// Local development defaults to the local FastAPI server. Production has no
// hard-coded backend hostname: configure NEXT_PUBLIC_API_BASE_URL explicitly
// so a deployment can never silently talk to an obsolete project/backend.
export const API_BASE_URL = (
  CONFIGURED_API_BASE_URL ||
  (process.env.NODE_ENV === "development" ? "http://127.0.0.1:8000" : "")
=======
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  DEFAULT_API_BASE_URL
>>>>>>> origin/main
).replace(/\/$/, "");

export const AUTH_TOKEN_STORAGE_KEY =
  "krishiNayanAuthToken";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(
    AUTH_TOKEN_STORAGE_KEY
  );
}

export function setStoredToken(
  token: string | null
) {
  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    window.localStorage.setItem(
      AUTH_TOKEN_STORAGE_KEY,
      token
    );
  } else {
    window.localStorage.removeItem(
      AUTH_TOKEN_STORAGE_KEY
    );
  }
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  if (!API_BASE_URL) {
    throw new ApiError(
      "Backend URL is not configured. Set NEXT_PUBLIC_API_BASE_URL for this deployment.",
      503
    );
  }

  const token = getStoredToken();

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 60000);

  const headers = new Headers(
    options.headers
  );

  if (!(options.body instanceof FormData)) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  try {
    return await fetch(
      `${API_BASE_URL}${path}`,
      {
        ...options,
        headers,
        signal:
          options.signal ||
          controller.signal,
      }
    );
  } catch (error) {
    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      throw new ApiError(
        "Backend is taking too long to respond. Please try again.",
        408
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function apiJson<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await apiFetch(
    path,
    options
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      extractErrorMessage(data),
      response.status
    );
  }

  return data as T;
}

function extractErrorMessage(
  data: unknown
): string {
  if (
    !data ||
    typeof data !== "object" ||
    !("detail" in data)
  ) {
    return "Something went wrong. Please try again.";
  }

  const detail = (
    data as {
      detail?: unknown;
    }
  ).detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) =>
        item &&
        typeof item === "object" &&
        "msg" in item
          ? String(
              (
                item as {
                  msg?: unknown;
                }
              ).msg
            )
          : String(item)
      )
      .join(" ");
  }

  return "Something went wrong. Please try again.";
}