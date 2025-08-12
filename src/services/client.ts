// Typed HTTP client wrapper using fetch and OpenAPI-generated types.
// Base URL resolution order:
// 1) VITE_API_BASE_URL env
// 2) In dev: "/api" to use Vite's proxy to localhost backend
// 3) In prod: Azure Function default URL

const env = (import.meta as any).env || {};
export const API_BASE_URL: string = env.VITE_API_BASE_URL
  || (env.DEV ? '/api' : 'https://flowledger-api-func.azurewebsites.net/api');

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
  const res = await fetch(`${API_BASE_URL}${path}`, { credentials: 'include' });
    return parseJSON<T>(res);
  },
  async post<T>(path: string, body?: unknown, headers: Record<string,string> = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST', credentials:'include',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return parseJSON<T>(res);
  },
  async put<T>(path: string, body?: unknown, headers: Record<string,string> = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'PUT', credentials:'include',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return parseJSON<T>(res);
  },
  async del<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { method: 'DELETE', credentials: 'include' });
    return parseJSON<T>(res);
  },
};
