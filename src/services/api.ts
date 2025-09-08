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
    // Normalize message: server sometimes returns a JSON string in e.message.
    let msg = errMsg;
    try {
      if (e && typeof e === 'object') {
        // If the fetch wrapper threw our HttpError shape
        if (typeof e.code === 'number' && typeof e.message === 'string') {
          // try parsing message as JSON
          const raw = e.message;
          try {
            const parsed = JSON.parse(raw);
            // attach parsed body to error for callers
            e.parsed = parsed;
            if (parsed?.error?.message) msg = String(parsed.error.message);
            else if (parsed?.message) msg = String(parsed.message);
            else msg = raw;
            if (parsed?.error?.code === 'ETIMEOUT') {
              msg = 'Server timeout (DB connect). Please try again shortly.';
            }
          } catch {
            // not JSON
            msg = String(e.message || errMsg);
          }
          // Detect common SQL Server error text for missing column and provide an actionable hint
          try {
            const m = /invalid column name '?"?([a-zA-Z0-9_]+)"?'?/i.exec(msg || '');
            if (m && m[1]) {
              msg = `Backend schema error: missing column '${m[1]}'. Ask the backend team to adjust the query or add a migration.`;
            }
          } catch {}
          // for HTTP 5xx provide a compact message
          if (e.code >= 500 && !msg) msg = `Server error (${e.code})`;
        } else if (e?.message && typeof e.message === 'string') {
          // non-HttpError with textual message (e.g., fetch TypeError)
          const raw = e.message;
          try {
            const parsed = JSON.parse(raw);
            e.parsed = parsed;
            if (parsed?.error?.message) msg = String(parsed.error.message);
            else if (parsed?.message) msg = String(parsed.message);
            else msg = raw;
            if (parsed?.error?.code === 'ETIMEOUT') msg = 'Server timeout (DB connect). Please try again shortly.';
          } catch {
            msg = raw || errMsg;
          }
        } else {
          msg = errMsg;
        }
      } else {
        msg = String(e) || errMsg;
      }
    } catch (_inner) {
      msg = errMsg;
    }

    // Show a friendly toast
    toast.error(msg);
  // attach normalized message for callers and rethrow so callers can inspect and handle
  e.normalizedMessage = msg;
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
export async function createClient(name: string, is_active = true, primaryContactId: number | null = null, pack: string | number | null = null, extras?: Record<string, any>): Promise<any> {
  // Use stored procedure endpoint - include PrimaryContactId (backend expects the field present)
  const payload: Record<string, any> = {
    Name: name,
    IsActive: is_active,
    // include multiple key variants to accommodate different API validators/binders
    PrimaryContactId: primaryContactId,
    primaryContactId: primaryContactId,
    primary_contact_id: primaryContactId,
    // helpful defaults which backend may accept
  // Playbook/Pack code defaults. If the caller provided a string code use that for playbook; otherwise default to 'DEFAULT'
  PlaybookCode: typeof pack === 'string' ? pack : 'DEFAULT',
  playbookCode: typeof pack === 'string' ? pack : 'DEFAULT',
  playbook_code: typeof pack === 'string' ? pack : 'DEFAULT',
  // PackCode always present as string; if caller passed numeric pack id we'll stringify it
  PackCode: pack !== null && pack !== undefined ? String(pack) : 'DEFAULT',
  packCode: pack !== null && pack !== undefined ? String(pack) : 'DEFAULT',
  pack_code: pack !== null && pack !== undefined ? String(pack) : 'DEFAULT',
  // Also provide PackId variants when numeric id is provided
  ...(typeof pack === 'number' ? { PackId: pack, packId: pack, pack_id: pack } : {}),
  OwnerUserId: null,
  };

  // Merge any additional nested arrays or fields the caller wants to include
  if (extras && typeof extras === 'object') {
    // shallow merge - extras may include arrays like client_contacts, notes, locations, client_industries
    Object.assign(payload, extras);
  }

  // Defensive: some backend deployments expect slightly different payload shapes or
  // may not accept null for PrimaryContactId. Try the straightforward call first,
  // and if the server responds with the specific missing-field error, retry with
  // alternate shapes so we can be robust across envs without server changes.
  try {
    // debug: log payload so we can confirm PrimaryContactId is present in requests
    // (remove or guard this in prod if sensitive)
    // eslint-disable-next-line no-console
    console.debug('[api] createClient payload:', JSON.stringify(payload));
    return await http.post('/clients/create-proc', payload);
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.debug('[api] createClient error:', e && (e.message || JSON.stringify(e)));
    // If backend explicitly complains about PrimaryContactId missing, try alternate shapes
    const msg = (e && (e.message || (e.message === '' && JSON.stringify(e)))) || '';
    const lower = String(msg).toLowerCase();
    if (lower.includes('missing required field') && lower.includes('primarycontactid')) {
      // Try sending payload wrapped under common envelope keys
      const alternates = [ { data: payload }, { client: payload }, { payload } ];
      for (const alt of alternates) {
        try {
          return await http.post('/clients/create-proc', alt);
        } catch (innerErr) {
          // continue to next alternate
        }
      }
    }
    // rethrow original error if all retries fail
    throw e;
  }
}

// Update client (deactivate, reactivate, etc.)
export async function updateClient(id: number, payload: { is_active?: boolean; client_name?: string; logo_url?: string }): Promise<any> {
  return withErrors(() => http.put(`/clients/${id}`, payload), 'Update client failed');
}

// Delete client completely
export async function deleteClient(id: number): Promise<any> {
  return withErrors(() => http.del(`/clients/${id}`), 'Delete client failed');
}

export async function listAudits(page = 1, limit = 20, sort = 'created_utc', order: 'asc' | 'desc' = 'desc'):
  Promise<{ data: Audit[]; meta?: PageMeta }> {
  const q = new URLSearchParams({ page: String(page), limit: String(limit), sort, order });
  return withErrors(() => http.get(`/audits?${q}`), 'Failed to load audits');
}

// Path templates (audit types)
export type PathTemplate = { path_id: number; name: string; description?: string; version?: string; active?: boolean };
export async function listPathTemplates(page = 1, limit = 200): Promise<{ data: PathTemplate[]; meta?: PageMeta }> {
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  return withErrors(() => http.get(`/path-templates?${q.toString()}`), 'Failed to load path templates');
}

// Task packs (optional feature on some backends)
export type TaskPack = { pack_id?: number; pack_code?: string; pack_name?: string; description?: string };

export type TaskPackDetailed = {
  pack_id: number;
  pack_code: string;
  pack_name: string;
  description?: string | null;
  status_scope?: 'active' | 'prospect' | 'any';
  is_active?: boolean;
  effective_from_utc?: string | null;
  effective_to_utc?: string | null;
};

export type PackTask = {
  pack_task_id: number;
  pack_id: number;
  name: string;
  sort_order?: number | null;
  due_days?: number | null;
  status_scope?: string | null;
  is_active?: boolean;
};
export async function listTaskPacks(page = 1, limit = 200): Promise<ApiEnvelope<TaskPack[]>> {
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  return withErrors(() => http.get<ApiEnvelope<TaskPack[]>>(`/task-packs?${q.toString()}`), 'Failed to load task packs');
}

export async function getPathTemplate(pathId: number): Promise<PathTemplate> {
  return withErrors(() => http.get(`/path-templates/${pathId}`), 'Failed to load template');
}

// New path template management endpoints
export async function publishPathTemplate(pathId: number, new_version: string): Promise<PathTemplate> {
  return withErrors(() => http.post(`/path-templates/${pathId}/publish`, { new_version }), 'Publish template failed');
}

export async function clonePathTemplate(pathId: number): Promise<PathTemplate> {
  return withErrors(() => http.post(`/path-templates/${pathId}/clone`), 'Clone template failed');
}

export type PathStep = { step_id: number; path_id: number; seq: number; title: string; state_gate?: string; required?: boolean; agent_key?: string; input_contract?: any; output_contract?: any };
export async function listPathSteps(pathId: number, page = 1, limit = 500): Promise<{ data: PathStep[]; meta?: PageMeta }> {
  const q = new URLSearchParams({ page: String(page), limit: String(limit), path_id: String(pathId) });
  return withErrors(() => http.get(`/path-steps?${q.toString()}`), 'Failed to load path steps');
}

export async function reorderPathSteps(pathId: number, order: number[]): Promise<PathStep[]> {
  return withErrors(() => http.put('/path-steps/reorder', { path_id: pathId, order }), 'Reorder steps failed');
}

export async function getPathTemplateUsage(pathId: number): Promise<{ audit_count: number; audits: any[] }> {
  return withErrors(() => http.get(`/path-templates/${pathId}/usage`), 'Failed to load template usage');
}

// Path step CRUD
export async function createPathStep(pathId: number, payload: Partial<PathStep>): Promise<PathStep> {
  const body = { ...payload, path_id: pathId };
  return withErrors(() => http.post('/path-steps', body), 'Create step failed');
}

export async function updatePathStep(stepId: number, payload: Partial<PathStep>): Promise<PathStep> {
  return withErrors(() => http.put(`/path-steps/${stepId}`, payload), 'Update step failed');
}

export async function deletePathStep(stepId: number): Promise<{ ok: true }> {
  return withErrors(() => http.del(`/path-steps/${stepId}`), 'Delete step failed');
}

// Template meta update
export async function updatePathTemplate(pathId: number, payload: { name?: string; description?: string; domain_tags?: string[]; notes?: string }): Promise<PathTemplate> {
  return withErrors(() => http.put(`/path-templates/${pathId}`, payload), 'Update template failed');
}

// Create audit
export async function createAudit(payload: { engagement_id?: number; title: string; domain?: string | null; audit_type?: string | null; owner_contact_id?: number | null; path_id?: number; start_utc?: string | null; notes?: string | null }): Promise<any> {
  return withErrors(() => http.post('/audits', payload), 'Create audit failed');
}

// Audit workspace endpoints
export async function getAudit(auditId: number): Promise<any> {
  return withErrors(() => http.get(`/audits/${auditId}`), 'Failed to load audit');
}

export async function putAuditPath(auditId: number, payload: { path_id: number }): Promise<any> {
  return withErrors(() => http.put(`/audits/${auditId}/path`, payload), 'Failed to set audit path');
}

export async function postAuditProgress(auditId: number, payload: { step_id: number; status: string; output_json?: any; notes?: string | null }): Promise<any> {
  return withErrors(() => http.post(`/audits/${auditId}/progress`, payload), 'Save progress failed');
}

export async function postAdvanceStep(auditId: number, payload: { step_id?: number; advance?: boolean }): Promise<any> {
  return withErrors(() => http.post(`/audits/${auditId}/advance-step`, payload), 'Advance step failed');
}

export async function postAdvanceToStep(auditId: number, payload: { step_id: number }): Promise<any> {
  return withErrors(() => http.post(`/audits/${auditId}/advance-to-step`, payload), 'Advance to step failed');
}

export async function postRecalcPercent(auditId: number): Promise<any> {
  return withErrors(() => http.post(`/audits/${auditId}/recalc-percent`), 'Recalculate percent failed');
}

// Delete an audit
export async function deleteAudit(auditId: number): Promise<{ deleted?: number } | any> {
  return withErrors(() => http.del(`/audits/${auditId}`), 'Delete audit failed');
}

// Create a single engagement
export async function createEngagement(payload: { client_id: number; name: string; status?: string; start_utc?: string | null; end_utc?: string | null; notes?: string | null }): Promise<any> {
  // Try the straightforward call first, then retry with alternate key names/envelopes
  try {
    return await withErrors(() => http.post('/client-engagements', payload), 'Create engagement failed');
  } catch (e: any) {
    // If server complains about missing required fields, try common alternate shapes
    const raw = e && (e.message || (e.response && JSON.stringify(e.response)) || '');
    const lower = String(raw).toLowerCase();
    if (lower.includes('required') || lower.includes('missing') || lower.includes('required field')) {
      // Build some common alternate payload shapes
      const alternates: any[] = [];
      // common name/title variants
      alternates.push({ ...payload, title: payload.name });
      alternates.push({ ...payload, engagement_name: payload.name });
      alternates.push({ ...payload, engagementTitle: payload.name });
      // common date key variants
      alternates.push({ ...payload, start_date: payload.start_utc, end_date: payload.end_utc });
      alternates.push({ ...payload, startDate: payload.start_utc, endDate: payload.end_utc });
      // wrapped envelopes
      alternates.push({ data: payload });
      alternates.push({ engagement: payload });
      alternates.push({ payload });

      for (const alt of alternates) {
        try {
          // eslint-disable-next-line no-console
          console.debug('[api] createEngagement retry alt payload:', JSON.stringify(alt));
          return await withErrors(() => http.post('/client-engagements', alt), 'Create engagement failed (retry)');
        } catch (inner) {
          // continue to next alternate
        }
      }
    }
    // rethrow original error if all retries fail
    throw e;
  }
}

// Types for tag suggestion feature (AI-assisted)
export type TagSuggestion = { tag_id?: number; tag_name: string; reason?: string };
export type TagSuggestResponse = { existing: TagSuggestion[]; new: TagSuggestion[]; rationale?: string };

// Suggest tags for a client note using AI endpoint
export async function suggestTags(payload: { client_id?: number; note: string; maxExisting?: number; maxNew?: number }): Promise<ApiEnvelope<TagSuggestResponse>> {
  // backend may accept requests with or without a client_id; keep helper flexible
  return withErrors(() => http.post<ApiEnvelope<TagSuggestResponse>>('/ai/tag-suggest', payload), 'Tag suggestion failed');
}

// Apply or create a tag for a client. Assumption: backend exposes POST /clients/{clientId}/tags with { tag_name }
// If your backend exposes a different route, adjust accordingly.
export async function applyTagToClient(clientId: number, tagName: string): Promise<any> {
  // Legacy helper: create tag if needed then map to client
  // Prefer using createClientTag + createClientTagMap directly for explicit control.
  try {
    const created: any = await http.post('/client-tags', { tag_name: tagName });
    const tagId = (created && (created.tag_id || created.data?.tag_id));
    if (!tagId) throw new Error('Tag creation failed');
    return await http.post('/client-tag-map', { client_id: clientId, tag_id: Number(tagId) });
  } catch (e: any) {
    // Fallback: try mapping by retrieving tags list
    const list = await http.get<ApiEnvelope<ClientTag[]>>('/client-tags');
    const found = (list && (list.data ?? list)).find(t => String(t.tag_name).toLowerCase() === String(tagName).toLowerCase());
    if (found && found.tag_id) {
      return await http.post('/client-tag-map', { client_id: clientId, tag_id: found.tag_id });
    }
    throw e;
  }
}

// Create/Delete client->tag mapping
export async function createClientTagMap(clientId: number, tagId: number): Promise<any> {
  return withErrors(() => http.post('/client-tag-map', { client_id: clientId, tag_id: tagId }), 'Create client->tag mapping failed');
}

export async function deleteClientTagMap(clientId: number, tagId: number): Promise<any> {
  const q = new URLSearchParams({ client_id: String(clientId), tag_id: String(tagId) });
  return withErrors(() => http.del(`/client-tag-map?${q.toString()}`), 'Delete client->tag mapping failed');
}

export async function listClientTagMap(page = 1, limit = 200, engagementId?: number): Promise<{ data: { engagement_id: number; tag_id: number }[]; meta?: PageMeta }> {
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  // API may not accept engagement_id as filter; pass none and filter caller-side
  const res = await withErrors(() => http.get(`/client-tag-map?${q.toString()}`), 'Failed to load tag mappings');
  return res as any;
}

// Client tags management (list/create/update/delete)
export type ClientTag = { tag_id: number; tag_name: string };

export async function listClientTags(page = 1, limit = 100): Promise<ApiEnvelope<ClientTag[]>> {
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  return withErrors(() => http.get<ApiEnvelope<ClientTag[]>>(`/client-tags?${q.toString()}`), 'Failed to load client tags');
}

export async function createClientTag(payload: { tag_name: string }): Promise<ClientTag> {
  return withErrors(() => http.post('/client-tags', payload), 'Create tag failed');
}

export async function updateClientTag(id: number, payload: { tag_name: string }): Promise<ClientTag> {
  return withErrors(() => http.put(`/client-tags/${id}`, payload), 'Update tag failed');
}

export async function deleteClientTag(id: number): Promise<{ ok: true } | any> {
  return withErrors(() => http.del(`/client-tags/${id}`), 'Delete tag failed');
}

export async function getClientsOverview(limit = 50, query?: string): Promise<ApiEnvelope<ClientsOverviewItem[]>> {
  const q = new URLSearchParams({ limit: String(limit) });
  if (query) q.set('q', String(query));
  return withErrors(() => http.get<ApiEnvelope<ClientsOverviewItem[]>>(`/clients-overview?${q.toString()}`), 'Failed to load clients overview');
}

// New client creation flow (AI-assisted) - matches /api/clients/create-proc endpoint
export type CreateProcBody = {
  Name: string; // Required - client name
  IsActive?: boolean;
  PackCode?: string | null;
  PrimaryContactId?: number | null;
  OwnerUserId?: number | null;
  LogoUrl?: string | null;
  // Child arrays - inserted in separate transaction
  contacts?: Array<{
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    title?: string;
    is_primary: boolean;
    is_active: boolean;
  }>;
  notes?: Array<{
    title: string;
    content: string;
    note_type: string;
    is_important: boolean;
    is_active: boolean;
    created_by?: number;
  }>;
  locations?: Array<{
    label: string;
    line1: string;
    line2?: string;
    city: string;
    state_province: string;
    postal_code: string;
    country: string;
    is_primary: boolean;
  }>;
  client_industries?: Array<{
    industry_id: number;
    is_primary: boolean;
  }>;
  client_tag_map?: Array<{
    engagement_id: number;
    tag_id: number;
  }>;
  contact_social_profiles?: Array<{
    contact_id?: number;
    contact_email?: string;
    contact_index?: number;
    provider: string;
    profile_url: string;
    is_primary: boolean;
  }>;
} & Record<string, any>;

export async function extractClientFromUrl(url: string): Promise<ApiEnvelope<any>> {
  return withErrors(() => http.post<ApiEnvelope<any>>('/clients/fetch-from-url', { url }), 'Extract client from URL failed');
}

export async function createClientProc(body: CreateProcBody): Promise<ApiEnvelope<any>> {
  return withErrors(() => http.post<ApiEnvelope<any>>('/clients/create-proc', body), 'Create client failed');
}

// Client engagements types & CRUD (per OpenAPI)
export type ClientEngagement = {
  engagement_id?: number;
  client_id: number;
  title: string;
  start_date?: string | null;
  end_date?: string | null;
  status?: string | null;
};

export async function listClientEngagements(page = 1, limit = 50, clientId?: number): Promise<{ data: ClientEngagement[]; meta?: PageMeta }> {
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (clientId) q.set('client_id', String(clientId));
  return withErrors(() => http.get(`/client-engagements?${q.toString()}`), 'Failed to load engagements');
}

export async function getClientEngagement(id: number): Promise<ClientEngagement> {
  return withErrors(() => http.get(`/client-engagements/${id}`), 'Failed to load engagement');
}

export async function updateClientEngagement(id: number, payload: Partial<ClientEngagement>): Promise<ClientEngagement> {
  return withErrors(() => http.put(`/client-engagements/${id}`, payload), 'Update engagement failed');
}

export async function deleteClientEngagement(id: number): Promise<{ deleted?: number }> {
  return withErrors(() => http.del(`/client-engagements/${id}`), 'Delete engagement failed');
}

// Engagement tag mapping
export async function createEngagementTagMap(engagementId: number, tagId: number): Promise<any> {
  return withErrors(() => http.post('/client-tag-map', { engagement_id: engagementId, tag_id: tagId }), 'Create engagement->tag mapping failed');
}
export async function deleteEngagementTagMap(engagementId: number, tagId: number): Promise<any> {
  const q = new URLSearchParams({ engagement_id: String(engagementId), tag_id: String(tagId) });
  return withErrors(() => http.del(`/client-tag-map?${q.toString()}`), 'Delete engagement->tag mapping failed');
}

// Onboarding tasks
export type OnboardingTask = {
  task_id: number;
  client_id: number;
  name: string;
  description?: string | null;
  status?: string; // "open", "done", etc.
  due_utc?: string | null; // ISO date-time
};
// Onboarding Tasks API
export async function listOnboardingTasks(
  page = 1, 
  limit = 20, 
  clientId?: number, 
  status?: string, 
  q?: string
): Promise<{ data: OnboardingTask[]; meta?: PageMeta }> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (clientId) params.set('client_id', String(clientId));
  if (status) params.set('status', status);
  if (q) params.set('q', q);
  return withErrors(() => http.get(`/client-onboarding-tasks?${params.toString()}`), 'Failed to load onboarding tasks');
}

export async function getOnboardingTask(taskId: number): Promise<OnboardingTask> {
  return withErrors(() => http.get(`/client-onboarding-tasks/${taskId}`), 'Failed to load onboarding task');
}

export async function createOnboardingTask(payload: {
  client_id: number;
  name: string;
  description?: string;
  status?: string;
  due_utc?: string;
}): Promise<OnboardingTask> {
  return withErrors(() => http.post('/client-onboarding-tasks', payload), 'Create onboarding task failed');
}

export async function updateOnboardingTask(id: number, payload: {
  name?: string;
  description?: string;
  status?: string;
  due_utc?: string;
}): Promise<OnboardingTask> {
  return withErrors(() => http.put(`/client-onboarding-tasks/${id}`, payload), 'Update onboarding task failed');
}

export async function deleteOnboardingTask(id: number): Promise<{ deleted: number }> {
  return withErrors(() => http.del(`/client-onboarding-tasks/${id}`), 'Delete onboarding task failed');
}

export async function completeOnboardingTask(id: number): Promise<OnboardingTask> {
  return withErrors(() => http.post(`/client-onboarding-tasks/${id}/complete`, {}), 'Complete onboarding task failed');
}

export async function reopenOnboardingTask(id: number): Promise<OnboardingTask> {
  return withErrors(() => http.put(`/client-onboarding-tasks/${id}/reopen`), 'Failed to reopen onboarding task');
}

// Module Management Types
export type Module = {
  module_id: string;
  key: string;
  name: string;
  scope: string;
  color: string;
  description?: string | null;
  created_utc?: string;
  updated_utc?: string;
};

export type ModuleVersion = {
  module_version_id: string;
  module_id: string;
  semver: string;
  status: string;
  created_utc?: string;
};

export type ModuleInstance = {
  module_instance_id: string;
  module_id: string;
  module_version_id: string;
  client_id: number;
  is_enabled: boolean;
  created_utc?: string;
};

export type ModuleConfig = {
  module_instance_id: string;
  cfg_json: string;
  is_active: boolean;
  created_utc?: string;
};

// Module API Functions
export async function getModulesRegistry(): Promise<{ data: Module[] }> {
  return withErrors(() => http.get('/modules/registry'), 'Failed to load modules registry');
}

export async function getModule(moduleId: string): Promise<Module> {
  return withErrors(() => http.get(`/modules/registry/${moduleId}`), 'Failed to load module');
}

export async function createModule(payload: {
  key: string;
  name: string;
  scope?: string;
  color?: string;
  description?: string;
}): Promise<Module> {
  return withErrors(() => http.post('/modules/registry', payload), 'Failed to create module');
}

export async function updateModule(moduleId: string, payload: {
  name?: string;
  scope?: string;
  color?: string;
  description?: string;
}): Promise<Module> {
  return withErrors(() => http.put(`/modules/registry/${moduleId}`, payload), 'Failed to update module');
}

export async function getModuleInstanceConfig(instanceId: string): Promise<{ cfg_json: string }> {
  return withErrors(() => http.get(`/modules/instances/${instanceId}/config`), 'Failed to load module config');
}

export async function updateModuleInstanceConfig(instanceId: string, payload: { cfg_json: string }): Promise<void> {
  return withErrors(() => http.put(`/modules/instances/${instanceId}/config`, payload), 'Failed to update module config');
}

export async function seedTasksFromPack(clientId: number, packCode: string): Promise<{ inserted: number }> {
  return withErrors(() => http.post('/client-onboarding-tasks/seed-from-pack', { 
    client_id: clientId, 
    pack_code: packCode 
  }), 'Seed tasks from pack failed');
}

// Task Packs API
export async function listTaskPacksDetailed(
  statusScope?: string,
  q?: string,
  includeInactive = false,
  page = 1,
  pageSize = 20
): Promise<{ data: TaskPackDetailed[]; meta?: PageMeta }> {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (statusScope) params.set('status_scope', statusScope);
  if (q) params.set('q', q);
  if (includeInactive) params.set('include_inactive', 'true');
  return withErrors(() => http.get(`/task-packs?${params.toString()}`), 'Failed to load task packs');
}

export async function getTaskPackDetailed(packId: number): Promise<TaskPackDetailed> {
  return withErrors(() => http.get(`/task-packs/${packId}`), 'Failed to load task pack');
}

export async function getTaskPackTasks(packId: number): Promise<{ data: PackTask[]; meta?: PageMeta }> {
  return withErrors(() => http.get(`/task-packs/${packId}/tasks`), 'Failed to load pack tasks');
}

// Client contacts types & CRUD
export type ClientContact = {
  contact_id?: number;
  client_id?: number;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  title?: string | null;
  is_primary?: boolean;
  is_active?: boolean;
  created_utc?: string | null;
  updated_utc?: string | null;
};

export async function listClientContacts(page = 1, limit = 25, clientId?: number): Promise<{ data: ClientContact[]; meta?: PageMeta }> {
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (clientId) q.set('client_id', String(clientId));
  return withErrors(() => http.get(`/client-contacts?${q.toString()}`), 'Failed to load client contacts');
}

export async function getClientContact(id: number): Promise<ClientContact> {
  return withErrors(() => http.get(`/client-contacts/${id}`), 'Failed to load contact');
}

export async function createClientContact(payload: Partial<ClientContact>): Promise<ClientContact> {
  return withErrors(() => http.post('/client-contacts', payload), 'Create contact failed');
}

// Contact social profiles (e.g., LinkedIn) CRUD
export type ContactSocialProfile = { id?: number; contact_id?: number; provider?: string; profile_url?: string; is_primary?: boolean; created_utc?: string };

export async function listContactSocialProfiles(page = 1, limit = 25, contactId?: number): Promise<{ data: ContactSocialProfile[]; meta?: PageMeta }> {
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (contactId) q.set('contact_id', String(contactId));
  return withErrors(() => http.get(`/contact-social-profiles?${q.toString()}`), 'Failed to load contact social profiles');
}

export async function createContactSocialProfile(payload: { contact_id: number; provider: string; profile_url: string; is_primary?: boolean }): Promise<ContactSocialProfile> {
  return withErrors(() => http.post('/contact-social-profiles', payload), 'Create contact social profile failed');
}

export async function updateClientContact(id: number, payload: Partial<ClientContact>): Promise<ClientContact> {
  return withErrors(() => http.put(`/client-contacts/${id}`, payload), 'Update contact failed');
}

export async function deleteClientContact(id: number): Promise<{ deleted?: number }> {
  return withErrors(() => http.del(`/client-contacts/${id}`), 'Delete contact failed');
}

// Post-creation client setup (idempotent orchestration on backend)
export async function clientSetup(clientId: number, payload: { PrimaryContactId?: number | null; PlaybookCode?: string; OwnerUserId?: number | null }): Promise<any> {
  return withErrors(() => http.post(`/clients/${clientId}/setup`, payload), 'Client setup failed');
}

// Ensure stored-proc create aligns with success envelope { status: 'ok', data: ... }
export async function createClientViaProcedure(payload: {
  Name: string;
  IsActive?: boolean;
  PackCode?: string | null;
  PrimaryContactId?: number | null;
  OwnerUserId?: number | null;
}): Promise<any> {
  const res = await http.post<ApiEnvelope<any>>('/clients/create-proc', payload);
  return (res as any)?.data ?? res;
}

// Contact Enrichment API
export type EnrichmentJob = {
  job_id: string;
  client_id: number;
  contact_id?: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  provider: string;
  contact_name: string;
  contact_email?: string;
  company?: string;
  domain?: string;
  created_date: string;
  updated_date?: string;
  error_message?: string;
  enriched_data?: any;
};

export type EnrichmentRequest = {
  first_name: string;
  last_name: string;
  email?: string;
  company?: string;
  domain?: string;
};

export type EnrichmentStats = {
  total: number;
  pending: number;
  completed: number;
  failed: number;
};

// MCP Server integration for enrichment
const MCP_BASE_URL = 'http://localhost:4001/mcp';

export async function enrichContact(payload: EnrichmentRequest): Promise<{ job_id: string }> {
  const response = await fetch(MCP_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'enrich_contact',
        arguments: payload
      }
    })
  });
  
  if (!response.ok) {
    throw new Error(`MCP enrichment failed: ${response.statusText}`);
  }
  
  const result = await response.json();
  if (result.error) {
    throw new Error(result.error.message || 'Enrichment failed');
  }
  
  return result.result;
}

export async function getEnrichmentStatus(jobId: string): Promise<any> {
  const response = await fetch(MCP_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'get_enrichment',
        arguments: { job_id: jobId }
      }
    })
  });
  
  if (!response.ok) {
    throw new Error(`MCP status check failed: ${response.statusText}`);
  }
  
  const result = await response.json();
  if (result.error) {
    throw new Error(result.error.message || 'Status check failed');
  }
  
  return result.result;
}

// REST endpoints for enrichment job management
export async function createEnrichmentJob(payload: Partial<EnrichmentJob>): Promise<EnrichmentJob> {
  return withErrors(() => http.post('/enrichment-jobs', payload), 'Create enrichment job failed');
}

export async function listEnrichmentJobs(clientId?: number): Promise<{ data: EnrichmentJob[]; meta?: PageMeta }> {
  const params = new URLSearchParams();
  if (clientId) params.set('client_id', clientId.toString());
  
  return withErrors(() => http.get(`/enrichment-jobs?${params.toString()}`), 'Failed to load enrichment jobs');
}

export async function getEnrichmentJob(jobId: string): Promise<EnrichmentJob> {
  return withErrors(() => http.get(`/enrichment-jobs/${jobId}`), 'Failed to load enrichment job');
}

export async function updateEnrichmentJob(jobId: string, payload: Partial<EnrichmentJob>): Promise<EnrichmentJob> {
  return withErrors(() => http.put(`/enrichment-jobs/${jobId}`, payload), 'Update enrichment job failed');
}

export async function getEnrichmentStats(clientId?: number): Promise<EnrichmentStats> {
  const params = new URLSearchParams();
  if (clientId) params.set('client_id', clientId.toString());
  
  return withErrors(() => http.get(`/enrichment-jobs/stats?${params.toString()}`), 'Failed to load enrichment stats');
}

export async function getEnrichedContacts(jobId: string): Promise<any[]> {
  return withErrors(() => http.get(`/enrichment-contacts?job_id=${jobId}`), 'Failed to load enriched contacts');
}

// ================================
// IDENTITY & COMMS HUB API
// ================================

// Principal (Identity) Management Types
export type Principal = {
  principal_id: number;
  org_id: number;
  principal_type: "person" | "service" | "team";
  display_name?: string;
  primary_email?: string;
  is_internal: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// Communications Types
export type CommsThread = {
  thread_id: number;
  org_id: number;
  mailbox_id: number;
  channel: "email" | "ticket";
  subject: string;
  status: "active" | "pending" | "resolved" | "escalated" | "on_hold" | "reopened";
  process_state: "triage" | "in_processing" | "queued" | "done" | "archived";
  assigned_principal_id?: number;
  client_id?: number;
  sla_rule_id?: number;
  first_msg_at?: string;
  last_msg_at: string;
  internet_conv_id?: string;
  created_at: string;
  updated_at: string;
};

export type CommsMessage = {
  message_id: number;
  org_id: number;
  thread_id: number;
  direction: "in" | "out";
  provider: "graph" | "zammad";
  provider_msg_id: string;
  sent_at: string;
  snippet?: string;
  body_blob_url?: string;
  has_attachments: boolean;
  created_at: string;
};

export type CommsAttachment = {
  attachment_id: number;
  org_id: number;
  message_id: number;
  filename: string;
  content_type: string;
  size_bytes: number;
  blob_url?: string;
  created_at: string;
};

// ================================
// PRINCIPALS API
// ================================

export async function listPrincipals(filters: {
  org_id?: number;
  principal_type?: "person" | "service" | "team";
  is_internal?: boolean;
  is_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{ data: Principal[]; meta?: PageMeta }> {
  const params = new URLSearchParams();
  if (filters.org_id) params.set('org_id', filters.org_id.toString());
  if (filters.principal_type) params.set('principal_type', filters.principal_type);
  if (filters.is_internal !== undefined) params.set('is_internal', filters.is_internal.toString());
  if (filters.is_active !== undefined) params.set('is_active', filters.is_active.toString());
  if (filters.search) params.set('search', filters.search);
  if (filters.page) params.set('page', filters.page.toString());
  if (filters.limit) params.set('limit', filters.limit.toString());

  return withErrors(
    () => http.get<{ data: Principal[]; meta?: PageMeta }>(`/principals?${params.toString()}`),
    'Failed to load principals'
  );
}

export async function getPrincipal(principalId: number): Promise<Principal> {
  return withErrors(
    () => http.get<Principal>(`/principals/${principalId}`),
    'Failed to load principal'
  );
}

export async function createPrincipal(payload: {
  principal_type: "person" | "service" | "team";
  display_name?: string;
  primary_email?: string;
  is_internal?: boolean;
  is_active?: boolean;
}): Promise<Principal> {
  return withErrors(
    () => http.post<Principal>('/principals', payload),
    'Failed to create principal'
  );
}

export async function updatePrincipal(principalId: number, payload: Partial<Principal>): Promise<Principal> {
  return withErrors(
    () => http.put<Principal>(`/principals/${principalId}`, payload),
    'Failed to update principal'
  );
}

export async function deletePrincipal(principalId: number): Promise<{ ok: true }> {
  return withErrors(
    () => http.del<{ ok: true }>(`/principals/${principalId}`),
    'Failed to delete principal'
  );
}

// ================================
// COMMUNICATIONS API
// ================================

export async function listCommsThreads(filters: {
  org_id?: number;
  status?: CommsThread['status'];
  process_state?: CommsThread['process_state'];
  assigned_principal_id?: number;
  client_id?: number;
  channel?: "email" | "ticket";
  page?: number;
  limit?: number;
} = {}): Promise<{ data: CommsThread[]; meta?: PageMeta }> {
  const params = new URLSearchParams();
  if (filters.org_id) params.set('org_id', filters.org_id.toString());
  if (filters.status) params.set('status', filters.status);
  if (filters.process_state) params.set('process_state', filters.process_state);
  if (filters.assigned_principal_id) params.set('assigned_principal_id', filters.assigned_principal_id.toString());
  if (filters.client_id) params.set('client_id', filters.client_id.toString());
  if (filters.channel) params.set('channel', filters.channel);
  if (filters.page) params.set('page', filters.page.toString());
  if (filters.limit) params.set('limit', filters.limit.toString());

  return withErrors(
    () => http.get<{ data: CommsThread[]; meta?: PageMeta }>(`/comms/threads?${params.toString()}`),
    'Failed to load communication threads'
  );
}

export async function getCommsThread(threadId: number): Promise<CommsThread & { messages?: CommsMessage[] }> {
  return withErrors(
    () => http.get<CommsThread & { messages?: CommsMessage[] }>(`/comms/threads/${threadId}`),
    'Failed to load communication thread'
  );
}

export async function updateCommsThread(threadId: number, payload: {
  status?: CommsThread['status'];
  process_state?: CommsThread['process_state'];
  assigned_principal_id?: number;
  client_id?: number;
}): Promise<CommsThread> {
  return withErrors(
    () => http.put<CommsThread>(`/comms/threads/${threadId}`, payload),
    'Failed to update communication thread'
  );
}

export async function replyToCommsThread(threadId: number, payload: {
  body: string;
  attachments?: File[];
}): Promise<CommsMessage> {
  return withErrors(
    () => http.post<CommsMessage>(`/comms/threads/${threadId}/reply`, payload),
    'Failed to reply to communication thread'
  );
}

export async function linkCommsThreadToWorkItem(threadId: number, payload: {
  work_item_type: "audit" | "client" | "project";
  work_item_id: number;
}): Promise<{ ok: true }> {
  return withErrors(
    () => http.post<{ ok: true }>(`/comms/threads/${threadId}/link`, payload),
    'Failed to link communication thread to work item'
  );
}

export async function saveCommsAttachmentAsDocument(attachmentId: number, payload: {
  document_name?: string;
  client_id?: number;
  audit_id?: number;
}): Promise<{ document_id: number }> {
  return withErrors(
    () => http.post<{ document_id: number }>(`/comms/attachments/${attachmentId}/save-as-doc`, payload),
    'Failed to save attachment as document'
  );
}

// ================================
// COMMS HELPER FUNCTIONS
// ================================

export function getThreadStatusColor(status: CommsThread['status']): string {
  switch (status) {
    case 'active': return 'text-blue-400';
    case 'pending': return 'text-amber-400';
    case 'resolved': return 'text-emerald-400';
    case 'escalated': return 'text-red-400';
    case 'on_hold': return 'text-zinc-400';
    case 'reopened': return 'text-orange-400';
    default: return 'text-zinc-400';
  }
}

export function getProcessStateColor(processState: CommsThread['process_state']): string {
  switch (processState) {
    case 'triage': return 'text-amber-400';
    case 'in_processing': return 'text-blue-400';
    case 'queued': return 'text-purple-400';
    case 'done': return 'text-emerald-400';
    case 'archived': return 'text-zinc-400';
    default: return 'text-zinc-400';
  }
}

export function canTransitionThreadStatus(
  currentStatus: CommsThread['status'], 
  newStatus: CommsThread['status']
): boolean {
  const transitions: Record<CommsThread['status'], CommsThread['status'][]> = {
    active: ['pending', 'resolved', 'escalated', 'on_hold'],
    pending: ['active', 'resolved', 'escalated'],
    escalated: ['active', 'resolved', 'on_hold'],
    on_hold: ['active', 'escalated', 'resolved'],
    resolved: ['reopened'],
    reopened: ['active', 'resolved', 'escalated', 'on_hold'],
  };
  
  return transitions[currentStatus]?.includes(newStatus) || false;
}

// ================================
// ENHANCED COMMUNICATION HUB API
// ================================

// Enhanced types for new features
export interface FileUploadSession {
  session_id: string;
  filename: string;
  mime_type: string;
  total_size_bytes: number;
  chunk_size: number;
  total_chunks: number;
  uploaded_chunks: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  blob_url?: string;
  created_utc: string;
}

export interface SearchResult {
  id: number;
  type: 'thread' | 'message';
  title: string;
  content: string;
  thread_id: number;
  thread_subject: string;
  created_utc: string;
  relevance_score: number;
  highlights: string[];
}

export interface EmailTemplate {
  template_id: number;
  org_id: number;
  name: string;
  template_type: 'general' | 'response' | 'follow_up' | 'proposal';
  subject_template: string;
  body_template: string;
  variables: TemplateVariable[];
  is_active: boolean;
  created_utc: string;
  updated_utc?: string;
}

export interface TemplateVariable {
  variable_name: string;
  variable_type: 'text' | 'number' | 'date' | 'boolean';
  default_value?: string;
  description?: string;
  is_required: boolean;
}

export interface SearchOptions {
  type?: 'general' | 'threads' | 'messages';
  mailbox_id?: number;
  status?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  limit?: number;
}

// ================================
// WEBSOCKET API FUNCTIONS
// ================================

// Register WebSocket connection
export const registerWebSocketConnection = async (
  socketId: string,
  principalId: number,
  orgId: number
): Promise<any> => {
  return withErrors(async () => {
    const response = await http.post(`/comms/ws/connect?org_id=${orgId}`, {
      socket_id: socketId,
      principal_id: principalId,
      user_agent: navigator.userAgent,
      ip_address: null // Will be determined server-side
    });
    return response;
  }, 'Failed to register WebSocket connection');
};

// Unregister WebSocket connection
export const unregisterWebSocketConnection = async (
  socketId: string,
  orgId: number
): Promise<any> => {
  return withErrors(async () => {
    const response = await http.post(`/comms/ws/disconnect?org_id=${orgId}`, {
      socket_id: socketId
    });
    return response;
  }, 'Failed to unregister WebSocket connection');
};

// Subscribe to WebSocket updates
export const subscribeToWebSocketUpdates = async (
  socketId: string,
  subscriptionType: string,
  resourceId?: number,
  orgId?: number
): Promise<any> => {
  return withErrors(async () => {
    const params = new URLSearchParams();
    if (orgId) params.append('org_id', orgId.toString());
    
    const response = await http.post(`/comms/ws/subscribe?${params}`, {
      socket_id: socketId,
      subscription_type: subscriptionType,
      resource_id: resourceId
    });
    return response;
  }, 'Failed to subscribe to WebSocket updates');
};

// ================================
// FILE UPLOAD API FUNCTIONS
// ================================

// Initialize file upload session
export const initializeFileUpload = async (
  filename: string,
  mimeType: string,
  totalSize: number,
  threadId?: number,
  principalId?: number,
  orgId?: number
): Promise<FileUploadSession> => {
  return withErrors(async () => {
    const params = new URLSearchParams();
    if (orgId) params.append('org_id', orgId.toString());
    if (principalId) params.append('principal_id', principalId.toString());
    
    const response = await http.post<{ data: FileUploadSession }>(`/comms/upload/init?${params}`, {
      filename,
      mime_type: mimeType,
      total_size_bytes: totalSize,
      thread_id: threadId
    });
    return (response as any).data;
  }, 'Failed to initialize file upload');
};

// Upload file chunk
export const uploadFileChunk = async (
  sessionId: string,
  chunkIndex: number,
  chunkData: string
): Promise<any> => {
  return withErrors(async () => {
    const response = await http.post(`/comms/upload/${sessionId}/chunk`, {
      chunk_index: chunkIndex,
      chunk_data: chunkData // Base64 encoded
    });
    return response;
  }, 'Failed to upload file chunk');
};

// Get upload session status
export const getUploadStatus = async (sessionId: string): Promise<FileUploadSession> => {
  return withErrors(async () => {
    const response = await http.get<{ data: FileUploadSession }>(`/comms/upload/${sessionId}/status`);
    return (response as any).data;
  }, 'Failed to get upload status');
};

// Cancel upload session
export const cancelUpload = async (sessionId: string): Promise<any> => {
  return withErrors(async () => {
    const response = await http.del(`/comms/upload/${sessionId}`);
    return response;
  }, 'Failed to cancel upload');
};

// ================================
// ADVANCED SEARCH API FUNCTIONS
// ================================

// Search communications
export const searchCommunications = async (
  query: string,
  options: SearchOptions = {},
  principalId?: number,
  orgId?: number
): Promise<{ data: SearchResult[], meta: any }> => {
  return withErrors(async () => {
    const {
      type = 'general',
      mailbox_id,
      status,
      from_date,
      to_date,
      page = 1,
      limit = 20
    } = options;

    const params = new URLSearchParams();
    if (orgId) params.append('org_id', orgId.toString());
    if (principalId) params.append('principal_id', principalId.toString());
    params.append('q', query);
    params.append('type', type);
    if (mailbox_id) params.append('mailbox_id', mailbox_id.toString());
    if (status) params.append('status', status);
    if (from_date) params.append('from_date', from_date);
    if (to_date) params.append('to_date', to_date);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await http.get(`/comms/search?${params}`);
    return response as any;
  }, 'Failed to search communications');
};

// Save search query
export const saveSearchQuery = async (
  query: string,
  filters: any,
  principalId?: number,
  orgId?: number
): Promise<any> => {
  return withErrors(async () => {
    const params = new URLSearchParams();
    if (orgId) params.append('org_id', orgId.toString());
    
    const response = await http.post(`/comms/search/save?${params}`, {
      query,
      filters,
      principal_id: principalId
    });
    return response;
  }, 'Failed to save search query');
};

// ================================
// EMAIL TEMPLATE API FUNCTIONS
// ================================

// Get all email templates
export const getEmailTemplates = async (
  type?: string,
  isActive?: boolean,
  orgId?: number
): Promise<EmailTemplate[]> => {
  return withErrors(async () => {
    const params = new URLSearchParams();
    if (orgId) params.append('org_id', orgId.toString());
    if (type) params.append('type', type);
    if (isActive !== undefined) params.append('is_active', isActive.toString());
    
    const response = await http.get<{ data: EmailTemplate[] }>(`/comms/templates?${params}`);
    return (response as any).data;
  }, 'Failed to fetch email templates');
};

// Get specific email template
export const getEmailTemplate = async (
  templateId: number,
  orgId?: number
): Promise<EmailTemplate> => {
  return withErrors(async () => {
    const params = new URLSearchParams();
    if (orgId) params.append('org_id', orgId.toString());
    
    const response = await http.get<{ data: EmailTemplate }>(`/comms/templates/${templateId}?${params}`);
    return (response as any).data;
  }, 'Failed to fetch email template');
};

// Create new email template
export const createEmailTemplate = async (
  template: Omit<EmailTemplate, 'template_id' | 'org_id' | 'created_utc' | 'updated_utc'>,
  principalId?: number,
  orgId?: number
): Promise<EmailTemplate> => {
  return withErrors(async () => {
    const params = new URLSearchParams();
    if (orgId) params.append('org_id', orgId.toString());
    if (principalId) params.append('principal_id', principalId.toString());
    
    const response = await http.post<{ data: EmailTemplate }>(`/comms/templates?${params}`, template);
    return (response as any).data;
  }, 'Failed to create email template');
};

// Update email template
export const updateEmailTemplate = async (
  templateId: number,
  template: Partial<EmailTemplate>,
  orgId?: number
): Promise<EmailTemplate> => {
  return withErrors(async () => {
    const params = new URLSearchParams();
    if (orgId) params.append('org_id', orgId.toString());
    
    const response = await http.put<{ data: EmailTemplate }>(`/comms/templates/${templateId}?${params}`, template);
    return (response as any).data;
  }, 'Failed to update email template');
};

// Delete email template
export const deleteEmailTemplate = async (
  templateId: number,
  orgId?: number
): Promise<any> => {
  return withErrors(async () => {
    const params = new URLSearchParams();
    if (orgId) params.append('org_id', orgId.toString());
    
    const response = await http.del(`/comms/templates/${templateId}?${params}`);
    return response;
  }, 'Failed to delete email template');
};

// Apply template with variables
export const applyEmailTemplate = (
  template: EmailTemplate,
  variables: Record<string, any>
): { subject: string; body: string } => {
  let subject = template.subject_template;
  let body = template.body_template;

  // Replace variables in subject and body
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    const stringValue = value?.toString() || '';
    subject = subject.replace(regex, stringValue);
    body = body.replace(regex, stringValue);
  });

  return { subject, body };
};
