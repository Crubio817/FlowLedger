import { toast } from '../lib/toast.ts';

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:4001';
const API_BASE_INDUSTRIES = (import.meta as any).env?.VITE_API_BASE_URL_INDUSTRIES || API_BASE;

async function parse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(()=> '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

async function req<T>(base: string, path: string, init: RequestInit): Promise<T> {
  try {
    const res = await fetch(base + path, {
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
      ...init,
    });
    return await parse<T>(res);
  } catch (e: any) {
    const msg = e?.message || 'Request failed';
    toast.error(msg);
    throw e;
  }
}

export const http = {
  get: <T>(path: string, { industries }:{ industries?: boolean } = {}) => req<T>(industries ? API_BASE_INDUSTRIES : API_BASE, path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown, { industries }:{ industries?: boolean } = {}) => req<T>(industries ? API_BASE_INDUSTRIES : API_BASE, path, { method: 'POST', body: body!=null ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown, { industries }:{ industries?: boolean } = {}) => req<T>(industries ? API_BASE_INDUSTRIES : API_BASE, path, { method: 'PUT', body: body!=null ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown, { industries }:{ industries?: boolean } = {}) => req<T>(industries ? API_BASE_INDUSTRIES : API_BASE, path, { method: 'PATCH', body: body!=null ? JSON.stringify(body) : undefined }),
  del: <T>(path: string, { industries }:{ industries?: boolean } = {}) => req<T>(industries ? API_BASE_INDUSTRIES : API_BASE, path, { method: 'DELETE' }),
};

export type ApiEnvelope<T> = { status?: string; data: T; meta?: any };
