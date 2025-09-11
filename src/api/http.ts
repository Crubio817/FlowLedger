// Shim: use the unified HTTP client in services/client to ensure consistent URL joining and error handling.
export { http } from '../services/client.ts';
export type ApiEnvelope<T> = { status?: string; data: T; meta?: any };
