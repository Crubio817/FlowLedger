// Workstream Module v2.1 - API Service Layer
// Comprehensive API client for Signal → Candidate → Pursuit → Engagement flow

import { http } from './client.ts';
import { toast } from '../lib/toast.ts';
import type {
  Signal,
  Candidate,
  Pursuit,
  Proposal,
  WorkEvent,
  DripSchedule,
  SlaBreach,
  PursuitChecklist,
  TodayPanelItem,
  WorkstreamApiResponse,
  SignalFilters,
  CandidateFilters,
  PursuitFilters,
  McpEnrichResult,
  McpAnalysisResult,
  McpProposalDraft,
} from './workstream.types.ts';

// Error handling wrapper
function withErrors<T>(fn: () => Promise<T>, errMsg = 'Request failed'): Promise<T> {
  return fn().catch((e: any) => {
    const msg = e?.message || errMsg;
    toast.error(msg);
    throw e;
  });
}

// ================================
// SIGNALS API
// ================================

export async function listSignals(
  filters: SignalFilters = {},
  page = 1,
  limit = 50
): Promise<WorkstreamApiResponse<Signal[]>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (filters.clustered !== undefined) params.set('clustered', filters.clustered.toString());
  if (filters.source) params.set('source', filters.source);
  if (filters.urgency_min !== undefined) params.set('urgency_min', filters.urgency_min.toString());
  if (filters.owner !== undefined) params.set('owner', filters.owner.toString());
  if (filters.status) params.set('status', filters.status);

  return withErrors(
    () => http.get<WorkstreamApiResponse<Signal[]>>(`/workstream/signals?${params.toString()}`),
    'Failed to load signals'
  );
}

export async function getSignal(signalId: number): Promise<Signal> {
  return withErrors(
    () => http.get<Signal>(`/workstream/signals/${signalId}`),
    'Failed to load signal'
  );
}

export async function createSignal(payload: {
  snippet: string;
  source_type: Signal['source_type'];
  urgency_score?: number;
  metadata_json?: any;
  idempotency_key?: string;
}): Promise<Signal> {
  return withErrors(
    () => http.post<Signal>('/workstream/signals', payload),
    'Failed to create signal'
  );
}

export async function createCandidateFromSignal(
  signalId: number,
  payload: {
    title: string;
    client_id?: number;
    contact_name?: string;
    contact_email?: string;
    value_band?: Candidate['value_band'];
    notes?: string;
  }
): Promise<Candidate> {
  return withErrors(
    () => http.post<Candidate>(`/workstream/signals/${signalId}/create-candidate`, payload),
    'Failed to create candidate from signal'
  );
}

export async function ignoreSignal(signalId: number, reason?: string): Promise<{ ok: true }> {
  return withErrors(
    () => http.post<{ ok: true }>(`/workstream/signals/${signalId}/ignore`, { reason }),
    'Failed to ignore signal'
  );
}

// ================================
// CANDIDATES API  
// ================================

export async function listCandidates(
  filters: CandidateFilters = {},
  page = 1,
  limit = 50
): Promise<WorkstreamApiResponse<Candidate[]>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (filters.status) params.set('status', filters.status);
  if (filters.owner !== undefined) params.set('owner', filters.owner.toString());
  if (filters.client !== undefined) params.set('client', filters.client.toString());
  if (filters.sla) params.set('sla', filters.sla);
  if (filters.value_band) params.set('value_band', filters.value_band);

  return withErrors(
    () => http.get<WorkstreamApiResponse<Candidate[]>>(`/workstream/candidates?${params.toString()}`),
    'Failed to load candidates'
  );
}

export async function getCandidate(candidateId: number): Promise<Candidate> {
  return withErrors(
    () => http.get<Candidate>(`/workstream/candidates/${candidateId}`),
    'Failed to load candidate'
  );
}

export async function createCandidate(payload: {
  title: string;
  signal_id?: number;
  client_id?: number;
  contact_name?: string;
  contact_email?: string;
  value_band: Candidate['value_band'];
  confidence?: number;
  notes?: string;
}): Promise<Candidate> {
  return withErrors(
    () => http.post<Candidate>('/workstream/candidates', payload),
    'Failed to create candidate'
  );
}

export async function updateCandidate(
  candidateId: number,
  payload: Partial<Candidate>
): Promise<Candidate> {
  return withErrors(
    () => http.put<Candidate>(`/workstream/candidates/${candidateId}`, payload),
    'Failed to update candidate'
  );
}

export async function promoteCandidate(
  candidateId: number,
  payload: {
    title?: string;
    description?: string;
    forecast_value_usd?: number;
    due_date?: string;
  }
): Promise<Pursuit> {
  return withErrors(
    () => http.post<Pursuit>(`/workstream/candidates/${candidateId}/promote`, payload),
    'Failed to promote candidate'
  );
}

export async function triggerDrip(candidateId: number): Promise<{ ok: true }> {
  return withErrors(
    () => http.post<{ ok: true }>(`/workstream/candidates/${candidateId}/drip`),
    'Failed to trigger drip campaign'
  );
}

// ================================
// PURSUITS API
// ================================

export async function listPursuits(
  filters: PursuitFilters = {},
  page = 1,
  limit = 50
): Promise<WorkstreamApiResponse<Pursuit[]>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (filters.stage) params.set('stage', filters.stage);
  if (filters.owner !== undefined) params.set('owner', filters.owner.toString());
  if (filters.due_before) params.set('due_before', filters.due_before);
  if (filters.sla) params.set('sla', filters.sla);
  if (filters.client !== undefined) params.set('client', filters.client.toString());

  return withErrors(
    () => http.get<WorkstreamApiResponse<Pursuit[]>>(`/workstream/pursuits?${params.toString()}`),
    'Failed to load pursuits'
  );
}

export async function getPursuit(pursuitId: number): Promise<Pursuit> {
  return withErrors(
    () => http.get<Pursuit>(`/workstream/pursuits/${pursuitId}`),
    'Failed to load pursuit'
  );
}

export async function createPursuit(payload: {
  candidate_id?: number;
  title: string;
  client_id?: number;
  description?: string;
  forecast_value_usd?: number;
  due_date?: string;
}): Promise<Pursuit> {
  return withErrors(
    () => http.post<Pursuit>('/workstream/pursuits', payload),
    'Failed to create pursuit'
  );
}

export async function updatePursuit(
  pursuitId: number,
  payload: Partial<Pursuit>
): Promise<Pursuit> {
  return withErrors(
    () => http.put<Pursuit>(`/workstream/pursuits/${pursuitId}`, payload),
    'Failed to update pursuit'
  );
}

export async function changePursuitStage(
  pursuitId: number,
  stage: Pursuit['stage'],
  notes?: string
): Promise<Pursuit> {
  return withErrors(
    () => http.post<Pursuit>(`/workstream/pursuits/${pursuitId}/stage`, { stage, notes }),
    'Failed to change pursuit stage'
  );
}

export async function submitPursuit(
  pursuitId: number,
  submissionNotes?: string
): Promise<Pursuit> {
  return withErrors(
    () => http.post<Pursuit>(`/workstream/pursuits/${pursuitId}/submit`, { notes: submissionNotes }),
    'Failed to submit pursuit'
  );
}

export async function markPursuitWon(
  pursuitId: number,
  wonValue?: number,
  notes?: string
): Promise<Pursuit> {
  return withErrors(
    () => http.post<Pursuit>(`/workstream/pursuits/${pursuitId}/won`, { value: wonValue, notes }),
    'Failed to mark pursuit as won'
  );
}

export async function markPursuitLost(
  pursuitId: number,
  lostReason?: string,
  notes?: string
): Promise<Pursuit> {
  return withErrors(
    () => http.post<Pursuit>(`/workstream/pursuits/${pursuitId}/lost`, { reason: lostReason, notes }),
    'Failed to mark pursuit as lost'
  );
}

// ================================
// PROPOSALS API
// ================================

export async function createProposal(
  pursuitId: number,
  payload: {
    title?: string;
    content?: string;
  }
): Promise<Proposal> {
  return withErrors(
    () => http.post<Proposal>(`/workstream/pursuits/${pursuitId}/proposals`, payload),
    'Failed to create proposal'
  );
}

export async function getProposal(proposalId: number): Promise<Proposal> {
  return withErrors(
    () => http.get<Proposal>(`/workstream/proposals/${proposalId}`),
    'Failed to load proposal'
  );
}

export async function sendProposal(
  proposalId: number,
  payload: {
    expires_at?: string;
    notes?: string;
  }
): Promise<Proposal> {
  return withErrors(
    () => http.post<Proposal>(`/workstream/proposals/${proposalId}/send`, payload),
    'Failed to send proposal'
  );
}

// ================================
// TODAY PANEL API
// ================================

export async function getTodayPanel(): Promise<TodayPanelItem[]> {
  return withErrors(
    () => http.get<TodayPanelItem[]>('/workstream/today'),
    'Failed to load today panel'
  );
}

// ================================
// CHECKLISTS API
// ================================

export async function getPursuitChecklist(pursuitId: number): Promise<PursuitChecklist[]> {
  return withErrors(
    () => http.get<PursuitChecklist[]>(`/workstream/pursuits/${pursuitId}/checklist`),
    'Failed to load pursuit checklist'
  );
}

export async function updateChecklistItem(
  pursuitId: number,
  itemId: number,
  completed: boolean,
  notes?: string
): Promise<PursuitChecklist> {
  return withErrors(
    () => http.put<PursuitChecklist>(`/workstream/pursuits/${pursuitId}/checklist/${itemId}`, {
      completed,
      notes,
    }),
    'Failed to update checklist item'
  );
}

// ================================
// SLA & REPORTING API
// ================================

export async function getWorkstreamFunnel(): Promise<{
  signals: number;
  candidates: number;
  pursuits: number;
  won: number;
  conversion_rates: {
    signal_to_candidate: number;
    candidate_to_pursuit: number;
    pursuit_to_won: number;
  };
}> {
  return withErrors(
    () => http.get('/workstream/funnel'),
    'Failed to load workstream funnel'
  );
}

export async function getSlaBreaches(
  entityType?: 'signal' | 'candidate' | 'pursuit',
  limit = 50
): Promise<SlaBreach[]> {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (entityType) params.set('entity_type', entityType);

  return withErrors(
    () => http.get<SlaBreach[]>(`/workstream/sla-breaches?${params.toString()}`),
    'Failed to load SLA breaches'
  );
}

export async function getWorkstreamStats(): Promise<{
  today_due: number;
  overdue: number;
  this_week: number;
  avg_cycle_time: number;
  win_rate: number;
}> {
  return withErrors(
    () => http.get('/workstream/stats'),
    'Failed to load workstream stats'
  );
}

// ================================
// MCP INTEGRATION API
// ================================

export async function enrichSignal(
  signalId: number,
  provider = 'fullenrich'
): Promise<McpEnrichResult> {
  return withErrors(
    () => http.post<McpEnrichResult>(`/workstream/signals/${signalId}/enrich`, { provider }),
    'Failed to enrich signal'
  );
}

export async function analyzeSignal(signalId: number): Promise<McpAnalysisResult> {
  return withErrors(
    () => http.post<McpAnalysisResult>(`/workstream/signals/${signalId}/analyze`),
    'Failed to analyze signal'
  );
}

export async function draftProposal(
  pursuitId: number,
  context?: any
): Promise<McpProposalDraft> {
  return withErrors(
    () => http.post<McpProposalDraft>(`/workstream/pursuits/${pursuitId}/draft-proposal`, { context }),
    'Failed to draft proposal'
  );
}

// ================================
// BULK OPERATIONS
// ================================

export async function bulkUpdateCandidates(
  candidateIds: number[],
  updates: Partial<Candidate>
): Promise<{ updated: number }> {
  return withErrors(
    () => http.put<{ updated: number }>('/workstream/candidates/bulk', {
      ids: candidateIds,
      updates,
    }),
    'Failed to bulk update candidates'
  );
}

export async function bulkUpdatePursuits(
  pursuitIds: number[],
  updates: Partial<Pursuit>
): Promise<{ updated: number }> {
  return withErrors(
    () => http.put<{ updated: number }>('/workstream/pursuits/bulk', {
      ids: pursuitIds,
      updates,
    }),
    'Failed to bulk update pursuits'
  );
}

// ================================
// EXPORTS
// ================================

export async function exportWorkstreamData(
  format: 'csv' | 'excel' = 'csv',
  filters?: {
    start_date?: string;
    end_date?: string;
    entity_types?: ('signal' | 'candidate' | 'pursuit')[];
  }
): Promise<{ download_url: string }> {
  return withErrors(
    () => http.post<{ download_url: string }>('/workstream/export', { format, ...filters }),
    'Failed to export workstream data'
  );
}

// ================================
// UTILITIES
// ================================

// Helper to get display name for entity
export function getEntityDisplayName(
  entityType: 'signal' | 'candidate' | 'pursuit',
  entity: any
): string {
  switch (entityType) {
    case 'signal':
      return entity.snippet?.substring(0, 50) + '...' || 'Unnamed Signal';
    case 'candidate':
      return entity.title || 'Unnamed Candidate';
    case 'pursuit':
      return entity.title || 'Unnamed Pursuit';
    default:
      return 'Unknown';
  }
}

// Helper to format currency
export function formatCurrency(amount?: number): string {
  if (!amount) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Helper to calculate days until due
export function getDaysUntilDue(dueDate?: string): number | null {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Helper to get SLA status text
export function getSlaStatusText(slaStatus?: 'green' | 'amber' | 'red'): string {
  switch (slaStatus) {
    case 'green': return 'On Track';
    case 'amber': return 'Due Soon';
    case 'red': return 'Overdue';
    default: return '-';
  }
}
