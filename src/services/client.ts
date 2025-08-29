// Typed HTTP client wrapper using fetch and OpenAPI-generated types.
// Base URL resolution order:
// 1) VITE_API_BASE_URL env
// 2) In dev: "/api" to use Vite's proxy to localhost backend
// 3) In prod: Azure Function default URL

const env = (import.meta as any).env || {};
// Prefer explicit VITE_API_BASE_URL; if not set and in dev, point to local backend on port 4000
// Resolve API base URL with runtime fallback so preview served on localhost can reach local backend
let resolvedBase = env.VITE_API_BASE_URL as string | undefined;
if (!resolvedBase) {
  if (env.DEV) {
    resolvedBase = 'http://localhost:4001/api';
  } else {
    // At runtime (preview/prod), prefer local backend when the site is opened on localhost in the browser
    try {
      const host = typeof window !== 'undefined' ? window.location.hostname : undefined;
      if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') {
        resolvedBase = 'http://localhost:4001/api';
      } else {
  resolvedBase = 'https://flowledger-api-web.azurewebsites.net/api';
      }
    } catch {
  resolvedBase = 'https://flowledger-api-web.azurewebsites.net/api';
    }
  }
}
export const API_BASE_URL: string = resolvedBase;

function resolveCredentialsMode(): RequestCredentials {
  // If base URL is relative we are proxying (same origin) so include cookies; otherwise omit to avoid CORS credential rejections
  if (API_BASE_URL.startsWith('/')) return 'include';
  try {
    const apiOrigin = new URL(API_BASE_URL, window.location.origin).origin;
    if (apiOrigin === window.location.origin) return 'include';
  } catch {/* ignore */}
  return 'omit';
}
const creds = resolveCredentialsMode();

export type HttpError = { code: number; message: string };

async function parseJSON<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const message = text || `HTTP ${res.status}`;
    const err: HttpError = { code: res.status, message };
    throw err;
  }
  // 204 No Content handling
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

async function requestWithRetry<T>(url: string, fetchOpts: RequestInit, tries = 3): Promise<T> {
  let attempt = 0;
  let lastErr: any = null;
  while (attempt < tries) {
    try {
      const res = await fetch(url, fetchOpts);
      return await parseJSON<T>(res);
    } catch (e: any) {
      lastErr = e;
      attempt += 1;
      // Decide if we should retry: transient network or server errors
      const msg = String(e?.message || '').toLowerCase();
      const isTransient = (typeof e?.code === 'number' && e.code >= 500) || msg.includes('etimeout') || msg.includes('failed to connect') || msg.includes('connect') || msg.includes('timeout') || msg.includes('econnrefused');
      if (!isTransient || attempt >= tries) break;
      // progressive backoff
      const backoff = 200 * attempt;
      // eslint-disable-next-line no-console
      console.debug(`[http] transient error, retrying in ${backoff}ms (attempt ${attempt}/${tries})`, e && (e.message || e));
      await sleep(backoff);
      continue;
    }
  }
  throw lastErr;
}

export const http = {
  async get<T>(path: string): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
    return requestWithRetry<T>(url, { method: 'GET', credentials: creds });
  },
  async post<T>(path: string, body?: unknown, headers: Record<string,string> = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
    return requestWithRetry<T>(url, { method: 'POST', credentials: creds, headers: { 'Content-Type': 'application/json', ...headers }, body: body !== undefined ? JSON.stringify(body) : undefined });
  },
  async put<T>(path: string, body?: unknown, headers: Record<string,string> = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
    return requestWithRetry<T>(url, { method: 'PUT', credentials: creds, headers: { 'Content-Type': 'application/json', ...headers }, body: body !== undefined ? JSON.stringify(body) : undefined });
  },
  async del<T>(path: string): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
    return requestWithRetry<T>(url, { method: 'DELETE', credentials: creds });
  },
};
