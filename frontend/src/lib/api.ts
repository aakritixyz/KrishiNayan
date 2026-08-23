const DEFAULT_API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://krishinayan-comet.onrender.com"
    : "http://127.0.0.1:8000";

// Use NEXT_PUBLIC_API_BASE_URL on Vercel/Netlify when the backend
// URL changes. The production fallback keeps deployed pages from
// accidentally calling localhost in the farmer's browser.
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, "");

export const AUTH_TOKEN_STORAGE_KEY = "krishiNayanAuthToken";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;

  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  }
}

/**
 * fetch wrapper that attaches the saved auth token (if any) as a
 * Bearer header. Safe to call whether or not the user is logged in
 * -  routes that don't require auth simply ignore the extra header,
 * and personalize their response when it's present.
 */
export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getStoredToken();
  const controller = new AbortController();
  const timeout = window.setTimeout(() => {
    controller.abort();
  }, 60000);

  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    return await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(
        "Backend is taking too long to respond. Please try again.",
        408
      );
    }

    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

/**
 * Same as apiFetch, but parses JSON and throws ApiError with the
 * backend's detail message on non-2xx responses.
 */
export async function apiJson<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await apiFetch(path, options);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(extractErrorMessage(data), response.status);
  }

  return data as T;
}

function extractErrorMessage(data: unknown): string {
  if (!data || typeof data !== "object" || !("detail" in data)) {
    return "Something went wrong. Please try again.";
  }

  const detail = (data as { detail?: unknown }).detail;

  if (typeof detail === "string") return detail;

  // FastAPI/Pydantic validation errors come back as a list of
  // {loc, msg, type} objects - stitch the messages together.
  if (Array.isArray(detail)) {
    return detail
      .map((item) =>
        item && typeof item === "object" && "msg" in item
          ? String((item as { msg?: unknown }).msg)
          : String(item)
      )
      .join(" ");
  }

  return "Something went wrong. Please try again.";
}
