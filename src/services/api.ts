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
          // for HTTP 5xx provide a compact message
          if (e.code >= 500 && !msg) msg = `Server error (${e.code})`;
        } else if (e?.message && typeof e.message === 'string') {
          // non-HttpError with textual message (e.g., fetch TypeError)
          const raw = e.message;
          try {
            const parsed = JSON.parse(raw);
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
    // rethrow so callers can inspect and handle
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
export async function createClient(name: string, is_active = true, primaryContactId: number | null = null): Promise<any> {
  // Use stored procedure endpoint - include PrimaryContactId (backend expects the field present)
  const payload: Record<string, any> = {
    Name: name,
    IsActive: is_active,
    // include multiple key variants to accommodate different API validators/binders
    PrimaryContactId: primaryContactId,
    primaryContactId: primaryContactId,
    primary_contact_id: primaryContactId,
    // helpful defaults which backend may accept
  PlaybookCode: 'DEFAULT',
  playbookCode: 'DEFAULT',
  playbook_code: 'DEFAULT',
  OwnerUserId: null,
  };

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

export async function listAudits(page = 1, limit = 20, sort = 'created_utc', order: 'asc' | 'desc' = 'desc'):
  Promise<{ data: Audit[]; meta?: PageMeta }> {
  const q = new URLSearchParams({ page: String(page), limit: String(limit), sort, order });
  return withErrors(() => http.get(`/audits?${q}`), 'Failed to load audits');
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
