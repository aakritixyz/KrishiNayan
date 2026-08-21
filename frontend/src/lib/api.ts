// Matches the backend port already used by the scan page
// (see src/app/scan/page.tsx). Kept as one shared constant so the
// Policy Dashboard and AI Chatbot call the same backend.
export const API_BASE_URL = "http://127.0.0.1:8000";

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

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  return response;
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
