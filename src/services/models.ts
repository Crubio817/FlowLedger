// Generated schema aliases for convenience when importing across the app.
// NOTE: If backend spec changes, re-run `npm run gen:api:snapshot` to refresh.
import type { components } from './types.gen.js';

export type DashboardStats = components['schemas']['DashboardStats'];
export type RecentAudit = components['schemas']['RecentAudit'];
export type SipocDoc = components['schemas']['SipocDoc'];
export type Interview = components['schemas']['Interview'];
export type InterviewResponse = components['schemas']['InterviewResponse'];
export type Finding = components['schemas']['Finding'];
export type ProcessMap = components['schemas']['ProcessMap'];
export type UploadUrlResponse = components['schemas']['UploadUrlResponse'];
export type ClientsOverviewItem = components['schemas']['ClientsOverviewItem'];
export type PageMeta = components['schemas']['PageMeta'];

// Manual composite types (API returns arrays-with-meta envelopes frequently)
export interface ListEnvelope<T> { status?: 'ok'; data?: T[]; meta?: PageMeta }
export interface ItemEnvelope<T> { status?: 'ok'; data?: T; meta?: PageMeta }
