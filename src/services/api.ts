import { toast } from '../lib/toast.ts';
import { http } from './client.ts';
// Using generated OpenAPI schema aliases
import type {
  DashboardStats,
  RecentAudit,
  SipocDoc,
  Interview,
  InterviewResponse,
  Finding,
  ProcessMap,
  UploadUrlResponse,
  ClientsOverviewItem,
  PageMeta,
} from './models.ts';
// Local question bank placeholder type (not yet in spec)
export type Question = { id: string; text: string };

export type ApiEnvelope<T> = { status: string; data: T; meta?: PageMeta & Record<string, any> };

function withErrors<T>(fn: () => Promise<T>, errMsg = 'Request failed'): Promise<T> {
  return fn().catch((e: any) => {
    const msg = e?.message || errMsg;
    toast.error(msg);
    throw e;
  });
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return withErrors(() => http.get<DashboardStats>('/dashboard-stats'), 'Failed to load dashboard');
}

export async function getAuditRecentTouch(page = 1, limit = 7): Promise<RecentAudit[]> {
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  return withErrors(() => http.get<RecentAudit[]>(`/audit-recent-touch?${q}`), 'Failed to load recent audits');
}

// getLastAudit is no longer used on the dashboard; keeping mocks below for other features

// Live SIPOC endpoints
export async function getSipoc(auditId: number): Promise<SipocDoc> {
  return withErrors(() => http.get<SipocDoc>(`/audit-sipoc/${auditId}`), 'Failed to load SIPOC');
}

export async function putSipoc(auditId: number, payload: SipocDoc): Promise<SipocDoc> {
  return withErrors(() => http.put<SipocDoc>(`/audit-sipoc/${auditId}`, payload), 'Failed to save SIPOC');
}


// Live Interviews API
export async function listInterviews(
  page = 1, limit = 10, sort = 'scheduled_utc', order: 'asc' | 'desc' = 'desc'
): Promise<{ data: Interview[]; meta?: { page: number; limit: number; total?: number } }> {
  const q = new URLSearchParams({ page: String(page), limit: String(limit), sort, order });
  return withErrors(() => http.get(`/interviews?${q}`), 'Failed to load interviews');
}

export async function getInterview(id: number): Promise<Interview> {
  return withErrors(() => http.get(`/interviews/${id}`), 'Failed to load interview');
}

export async function createInterview(payload: Partial<Interview>): Promise<Interview> {
  return withErrors(() => http.post('/interviews', payload), 'Create interview failed');
}

export async function updateInterview(id: number, payload: Partial<Interview>): Promise<Interview> {
  return withErrors(() => http.put(`/interviews/${id}`, payload), 'Update interview failed');
}

export async function deleteInterview(id: number): Promise<{ ok: true }> {
  return withErrors(() => http.del(`/interviews/${id}`), 'Delete interview failed');
}

// Live Interview Responses API
export async function listInterviewResponses(
  interviewId: number, page = 1, limit = 100
): Promise<{ data: InterviewResponse[]; meta?: { page: number; limit: number; total?: number } }> {
  const q = new URLSearchParams({ page: String(page), limit: String(limit), interview_id: String(interviewId) });
  return withErrors(() => http.get(`/interview-responses?${q}`), 'Failed to load responses');
}

export async function createInterviewResponse(payload: Pick<InterviewResponse, 'interview_id'|'question_id'|'answer'>): Promise<InterviewResponse> {
  return withErrors(() => http.post('/interview-responses', payload), 'Create response failed');
}

export async function updateInterviewResponse(id: number, payload: Partial<InterviewResponse>): Promise<InterviewResponse> {
  return withErrors(() => http.put(`/interview-responses/${id}`, payload), 'Update response failed');
}

// completeInterview removed in favor of updateInterview

// Live Process Maps API
export async function listProcessMaps(
  page = 1, limit = 20, auditId?: number
): Promise<{ data: ProcessMap[]; meta?: { page: number; limit: number; total?: number } }> {
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (auditId) q.set('audit_id', String(auditId));
  return withErrors(() => http.get(`/process-maps?${q.toString()}`), 'Failed to load process maps');
}

export async function createProcessMap(payload: Omit<ProcessMap,'process_map_id'|'uploaded_utc'>): Promise<ProcessMap> {
  return withErrors(() => http.post('/process-maps', payload), 'Create process map failed');
}

export async function deleteProcessMap(id: number): Promise<{ ok: true }> {
  return withErrors(() => http.del(`/process-maps/${id}`), 'Delete process map failed');
}

export async function requestUploadUrl(auditId: number, fileName: string, contentType: string): Promise<UploadUrlResponse> {
  return withErrors(() => http.post('/process-maps/upload-url', { audit_id: auditId, file_name: fileName, content_type: contentType }), 'Upload URL request failed');
}

// Live Findings API
export async function getFindings(auditId: number): Promise<Finding> {
  return withErrors(() => http.get(`/findings/${auditId}`), 'Failed to load findings');
}

export async function putFindings(auditId: number, payload: Finding): Promise<Finding> {
  const headers: Record<string, string> = {};
  if (payload.updated_utc) headers['If-Match'] = payload.updated_utc;
  return withErrors(() => http.put(`/findings/${auditId}`, payload, headers), 'Failed to save findings');
}

export async function getQuestionBank(): Promise<Question[]> {
  // If/when provided by API; keep mock fallback minimal until then
  return [];
}

// Additional: Clients and Audits endpoints (spec currently provides list shapes inline)
export type Client = { client_id?: number; name?: string; is_active?: boolean; created_utc?: string };
export type Audit = { audit_id?: number; client_id?: number; title?: string; status?: string; created_utc?: string; updated_utc?: string };

export async function listClients(page = 1, limit = 20, sort = 'name', order: 'asc' | 'desc' = 'asc'):
  Promise<{ data: Client[]; meta?: PageMeta }> {
  const q = new URLSearchParams({ page: String(page), limit: String(limit), sort, order });
  return withErrors(() => http.get(`/clients?${q}`), 'Failed to load clients');
}

// Create client (spec snapshot currently lacks POST /clients; backend supports it)
export async function createClient(name: string, is_active = true): Promise<{ status?: string; data?: { client_id?: number } }> {
  return withErrors(() => http.post('/clients', { name, is_active }), 'Create client failed');
}

export async function listAudits(page = 1, limit = 20, sort = 'created_utc', order: 'asc' | 'desc' = 'desc'):
  Promise<{ data: Audit[]; meta?: PageMeta }> {
  const q = new URLSearchParams({ page: String(page), limit: String(limit), sort, order });
  return withErrors(() => http.get(`/audits?${q}`), 'Failed to load audits');
}

export async function getClientsOverview(limit = 50): Promise<ApiEnvelope<ClientsOverviewItem[]>> {
  const q = new URLSearchParams({ limit: String(limit) });
  return withErrors(() => http.get<ApiEnvelope<ClientsOverviewItem[]>>(`/clients-overview?${q}`), 'Failed to load clients overview');
}
