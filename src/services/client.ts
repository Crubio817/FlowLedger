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
    resolvedBase = 'http://localhost:4000/api';
  } else {
    // At runtime (preview/prod), prefer local backend when the site is opened on localhost in the browser
    try {
      const host = typeof window !== 'undefined' ? window.location.hostname : undefined;
      if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') {
        resolvedBase = 'http://localhost:4000/api';
      } else {
        resolvedBase = 'https://flowledger-api-func.azurewebsites.net/api';
      }
    } catch {
      resolvedBase = 'https://flowledger-api-func.azurewebsites.net/api';
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

export const http = {
  async get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { credentials: creds });
    return parseJSON<T>(res);
  },
  async post<T>(path: string, body?: unknown, headers: Record<string,string> = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST', credentials: creds,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return parseJSON<T>(res);
  },
  async put<T>(path: string, body?: unknown, headers: Record<string,string> = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'PUT', credentials: creds,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return parseJSON<T>(res);
  },
  async del<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { method: 'DELETE', credentials: creds });
    return parseJSON<T>(res);
  },
};
