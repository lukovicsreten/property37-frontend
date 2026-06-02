const RAW = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8080";
export const API_BASE_URL = RAW.replace(/\/$/, "");

const TOKEN_KEY = "p37_token";

export const tokenStore = {
  get: () => (typeof localStorage !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export async function apiFetch<T>(
  path: string,
  opts: { method?: string; body?: unknown; params?: Record<string, unknown>; auth?: boolean } = {},
): Promise<T> {
  const { method = "GET", body, params, auth = true } = opts;
  const url = new URL(API_BASE_URL + path);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.append(k, String(v));
    }
  }
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = tokenStore.get();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  let parsed: unknown = undefined;
  if (text) {
    try { parsed = JSON.parse(text); } catch { parsed = text; }
  }
  if (!res.ok) {
    const msg =
      (parsed && typeof parsed === "object" && "message" in parsed && typeof (parsed as { message: unknown }).message === "string"
        ? (parsed as { message: string }).message
        : null) ?? res.statusText ?? "Greška";
    if (res.status === 401 && typeof window !== "undefined") {
      tokenStore.clear();
    }
    throw new ApiError(res.status, msg, parsed);
  }
  return parsed as T;
}