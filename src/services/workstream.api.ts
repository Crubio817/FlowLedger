// Workstream Module v2.1 - API Service Layer
// Comprehensive API client for Signal → Candidate → Pursuit → Engagement flow

import React from 'react';
import { http } from './client.ts';
import { toast } from '../lib/toast.ts';
import { ORG_CONFIG } from '../config.ts';
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
  IdentityResolution,
  QualityGateResult,
  ConfigurationItem,
  IdentityConflict,
  SpotlightScoreBreakdown,
  WorkloadAnalysis,
  MemoryCard,
  MemoryAtom,
} from './workstream.types.ts';

// Error handling wrapper
function withErrors<T>(fn: () => Promise<T>, errMsg = 'Request failed'): Promise<T> {
  return fn().catch((e: any) => {
    const msg = e?.message || errMsg;
    toast.error(msg);
    throw e;
  });
}

// Simple network error detector for offline/dev backend-down scenarios
function isNetworkError(e: any): boolean {
  if (!e) return false;
  const msg = (e.message || '').toLowerCase();
  return (
    e.code === 'ECONNREFUSED' ||
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('load failed') ||
    msg.includes('connection refused')
  );
}

// Mock generators (minimal realistic shape for UI) used when backend unreachable
function mockTodayPanelItems(): TodayPanelItem[] {
  const now = new Date();
  const iso = (d: Date) => d.toISOString();
  return [
    {
      item_type: 'signal',
      item_id: 1,
      label: 'Sample Signal (offline)',
      state: 'new',
      badge: 'amber',
      sla_metric: 'Respond in 4h',
      urgency_score: 72,
      priority_score: 0.65,
      priority_tier: 'high',
      icp_band: 'high',
      value_band: 'mid',
      forecast_value_usd: 12000,
      has_threads: false,
      has_docs: false,
      last_touch_at: iso(new Date(now.getTime() - 3600_000)),
      due_date: iso(new Date(now.getTime() + 8 * 3600_000)),
    } as TodayPanelItem,
    {
      item_type: 'candidate',
      item_id: 2,
      label: 'Sample Candidate (offline)',
      state: 'qualifying',
      badge: 'green',
      sla_metric: 'Next step in 1d',
      urgency_score: 41,
      priority_score: 0.48,
      priority_tier: 'medium',
      icp_band: 'medium',
      value_band: 'low',
      forecast_value_usd: 8000,
      has_threads: true,
      has_docs: true,
      last_touch_at: iso(new Date(now.getTime() - 6 * 3600_000)),
      due_date: iso(new Date(now.getTime() + 24 * 3600_000)),
    } as TodayPanelItem,
    {
      item_type: 'pursuit',
      item_id: 3,
      label: 'Sample Pursuit (offline)',
      state: 'negotiation',
      badge: 'red',
      sla_metric: 'Overdue follow-up',
      urgency_score: 90,
      priority_score: 0.82,
      priority_tier: 'critical',
      icp_band: 'high',
      value_band: 'high',
      forecast_value_usd: 54000,
      has_threads: true,
      has_docs: false,
      last_touch_at: iso(new Date(now.getTime() - 12 * 3600_000)),
      due_date: iso(new Date(now.getTime() - 2 * 3600_000)),
    } as TodayPanelItem,
  ];
}

function mockWorkstreamStats() {
  return {
    today_due: 2,
    overdue: 1,
    this_week: 7,
    avg_cycle_time: 5,
    win_rate: 0.42,
  };
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
  if (!params.has('org_id')) params.set('org_id', ORG_CONFIG.orgId);
  
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

// Simple getters for enhanced v2.2 data
export async function getSignals(
  ownerUserId?: number,
  priorityTier?: 'critical' | 'high' | 'medium' | 'low'
): Promise<Signal[]> {
  const params = new URLSearchParams();
  if (ownerUserId) params.set('owner_user_id', ownerUserId.toString());
  if (priorityTier) params.set('priority_tier', priorityTier);
  if (!params.has('org_id')) params.set('org_id', ORG_CONFIG.orgId);
  
  const queryString = params.toString();
  const endpoint = queryString ? `/workstream/signals?${queryString}` : '/workstream/signals';
  
  return withErrors(
    () => http.get<{ data: Signal[] }>(endpoint).then(r => r.data),
    'Failed to load signals'
  );
}

export async function getCandidates(
  ownerUserId?: number,
  priorityTier?: 'critical' | 'high' | 'medium' | 'low'
): Promise<Candidate[]> {
  const params = new URLSearchParams();
  if (ownerUserId) params.set('owner_user_id', ownerUserId.toString());
  if (priorityTier) params.set('priority_tier', priorityTier);
  if (!params.has('org_id')) params.set('org_id', ORG_CONFIG.orgId);
  
  const queryString = params.toString();
  const endpoint = queryString ? `/workstream/candidates?${queryString}` : '/workstream/candidates';
  
  return withErrors(
    () => http.get<{ data: Candidate[] }>(endpoint).then(r => r.data),
    'Failed to load candidates'
  );
}

export async function getPursuits(
  ownerUserId?: number,
  stage?: string,
  priorityTier?: 'critical' | 'high' | 'medium' | 'low'
): Promise<Pursuit[]> {
  const params = new URLSearchParams();
  if (ownerUserId) params.set('owner_user_id', ownerUserId.toString());
  if (stage) params.set('stage', stage);
  if (priorityTier) params.set('priority_tier', priorityTier);
  if (!params.has('org_id')) params.set('org_id', ORG_CONFIG.orgId);
  
  const queryString = params.toString();
  const endpoint = queryString ? `/workstream/pursuits?${queryString}` : '/workstream/pursuits';
  
  return withErrors(
    () => http.get<{ data: Pursuit[] }>(endpoint).then(r => r.data),
    'Failed to load pursuits'
  );
}

export async function getSignal(signalId: number): Promise<Signal> {
  return withErrors(
  () => http.get<Signal>(`/workstream/signals/${signalId}?org_id=${ORG_CONFIG.orgId}`),
    'Failed to load signal'
  );
}

export async function createSignal(payload: {
  snippet: string;
  source_type: Signal['source_type'];
  source_ref?: string;
  urgency_score?: number;
  contact_email?: string;
  contact_phone?: string;
  company_domain?: string;
  problem_phrase?: string;
  solution_hint?: string;
  metadata_json?: any;
  idempotency_key?: string;
}): Promise<Signal & { identity_resolution?: IdentityResolution }> {
  return withErrors(
  () => http.post<Signal & { identity_resolution?: IdentityResolution }>(`/workstream/signals?org_id=${ORG_CONFIG.orgId}`, payload),
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
  () => http.post<Candidate>(`/workstream/signals/${signalId}/create-candidate?org_id=${ORG_CONFIG.orgId}`, payload),
    'Failed to create candidate from signal'
  );
}

export async function ignoreSignal(signalId: number, reason?: string): Promise<{ ok: true }> {
  return withErrors(
  () => http.post<{ ok: true }>(`/workstream/signals/${signalId}/ignore?org_id=${ORG_CONFIG.orgId}`, { reason }),
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
): Promise<Pursuit & { quality_gates_passed?: QualityGateResult }> {
  return withErrors(
    () => http.post<Pursuit & { quality_gates_passed?: QualityGateResult }>(`/workstream/candidates/${candidateId}/promote`, payload),
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
): Promise<Pursuit & { quality_gates_validated?: QualityGateResult }> {
  return withErrors(
    () => http.post<Pursuit & { quality_gates_validated?: QualityGateResult }>(`/workstream/pursuits/${pursuitId}/stage`, { stage, notes }),
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

export async function getTodayPanel(
  priorityTier?: 'critical' | 'high' | 'medium' | 'low',
  ownerUserId?: number
): Promise<TodayPanelItem[]> {
  const params = new URLSearchParams();
  if (priorityTier) params.set('priority_tier', priorityTier);
  if (ownerUserId) params.set('owner_user_id', ownerUserId.toString());
  
  const queryString = params.toString();
  // Always include org_id for multi-tenant isolation
  if (!params.has('org_id')) params.set('org_id', ORG_CONFIG.orgId);
  const endpoint = `/api/workstream/today?${params.toString()}`;
  try {
    return await withErrors(
      () => http.get<{ data: TodayPanelItem[] } | TodayPanelItem[]>(endpoint).then(r =>
        Array.isArray(r) ? r : r.data
      ),
      'Failed to load today panel'
    );
  } catch (e: any) {
    if (isNetworkError(e)) {
      console.warn('[workstream.api] Backend unreachable, serving mock today panel data');
      toast.custom?.((t: any) => (
        // use minimal inline JSX to avoid dependency issues
        React.createElement('div', { className: 'px-3 py-2 rounded bg-zinc-900 text-zinc-200 text-sm border border-zinc-700' }, 'Offline mode: showing sample Today Panel')
      ), { id: 'offline-today-panel', duration: 3000 });
      return mockTodayPanelItems();
    }
    throw e;
  }
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
  try {
    return await withErrors(
  () => http.get(`/api/workstream/stats?org_id=${ORG_CONFIG.orgId}`),
      'Failed to load workstream stats'
    );
  } catch (e: any) {
    if (isNetworkError(e)) {
      console.warn('[workstream.api] Backend unreachable, serving mock stats');
      return mockWorkstreamStats();
    }
    throw e;
  }
}

// ================================
// ENHANCED v2.2 ENDPOINTS
// ================================

// Enhanced Today Panel with Priority Scoring
export async function getTodayPanelEnhanced(
  priorityTier?: 'critical' | 'high' | 'medium' | 'low',
  ownerUserId?: number
): Promise<TodayPanelItem[]> {
  const params = new URLSearchParams();
  if (priorityTier) params.set('priority_tier', priorityTier);
  if (ownerUserId) params.set('owner_user_id', ownerUserId.toString());
  
  const queryString = params.toString();
  if (!params.has('org_id')) params.set('org_id', ORG_CONFIG.orgId);
  const endpoint = `/api/workstream/today?${params.toString()}`;
  
  return withErrors(
    () => http.get<{ data: TodayPanelItem[] }>(endpoint).then(r => r.data),
    'Failed to load enhanced today panel'
  );
}

// Configuration Management
export async function getConfiguration(
  configType?: ConfigurationItem['config_type'],
  configKey?: string
): Promise<ConfigurationItem[]> {
  const params = new URLSearchParams();
  if (configType) params.set('config_type', configType);
  if (configKey) params.set('config_key', configKey);
  
  const queryString = params.toString();
  const endpoint = queryString ? `/workstream/config?${queryString}` : '/workstream/config';
  
  return withErrors(
    () => http.get<{ data: ConfigurationItem[] }>(endpoint).then(r => r.data),
    'Failed to load configuration'
  );
}

export async function updateConfiguration(payload: {
  config_type: ConfigurationItem['config_type'];
  config_key: string;
  config_value: any;
  effective_from?: string;
}): Promise<ConfigurationItem> {
  return withErrors(
    () => http.post<ConfigurationItem>('/workstream/config', payload),
    'Failed to update configuration'
  );
}

// Explainable AI Scoring
export async function getSpotlightScores(
  itemType: 'signal' | 'candidate' | 'pursuit',
  itemId: number,
  spotlightId?: number
): Promise<SpotlightScoreBreakdown> {
  const params = new URLSearchParams();
  if (spotlightId) params.set('spotlight_id', spotlightId.toString());
  
  const queryString = params.toString();
  const endpoint = queryString 
  ? `/workstream/spotlight-scores/${itemType}/${itemId}?${queryString}&org_id=${ORG_CONFIG.orgId}`
  : `/workstream/spotlight-scores/${itemType}/${itemId}?org_id=${ORG_CONFIG.orgId}`;
  
  return withErrors(
    () => http.get<SpotlightScoreBreakdown>(endpoint),
    'Failed to load spotlight scores'
  );
}

export async function rescoreItem(
  itemType: 'signal' | 'candidate' | 'pursuit',
  itemId: number,
  payload: {
    spotlight_id?: number;
    reason?: string;
  }
): Promise<SpotlightScoreBreakdown> {
  return withErrors(
  () => http.post<SpotlightScoreBreakdown>(`/workstream/spotlight-scores/${itemType}/${itemId}/rescore?org_id=${ORG_CONFIG.orgId}`, payload),
    'Failed to rescore item'
  );
}

// Identity Resolution
export async function getIdentityConflicts(
  resolutionStatus?: 'pending' | 'resolved' | 'ignored'
): Promise<IdentityConflict[]> {
  const params = new URLSearchParams();
  if (resolutionStatus) params.set('resolution_status', resolutionStatus);
  
  const queryString = params.toString();
  const endpoint = queryString ? `/workstream/identity-conflicts?${queryString}&org_id=${ORG_CONFIG.orgId}` : `/workstream/identity-conflicts?org_id=${ORG_CONFIG.orgId}`;
  
  return withErrors(
    () => http.get<{ data: IdentityConflict[] }>(endpoint).then(r => r.data),
    'Failed to load identity conflicts'
  );
}

export async function resolveIdentityConflict(
  conflictId: number,
  payload: {
    resolved_contact_id?: number;
    resolved_client_id?: number;
    resolution_notes?: string;
  }
): Promise<{ ok: true }> {
  return withErrors(
  () => http.post<{ ok: true }>(`/workstream/identity-conflicts/${conflictId}/resolve?org_id=${ORG_CONFIG.orgId}`, payload),
    'Failed to resolve identity conflict'
  );
}

export async function getIdentityStatus(): Promise<{
  key_type: string;
  total_keys: number;
  unresolved_count: number;
  auto_resolved_count: number;
  manual_resolved_count: number;
  conflict_count: number;
  avg_confidence: number;
  most_recent_activity: string;
}[]> {
  return withErrors(
  () => http.get<{ data: any[] }>(`/workstream/identity-status?org_id=${ORG_CONFIG.orgId}`).then(r => r.data),
    'Failed to load identity status'
  );
}

// Workload Analytics
export async function getWorkloadAnalysis(
  ownerUserId?: number
): Promise<WorkloadAnalysis[]> {
  const params = new URLSearchParams();
  if (ownerUserId) params.set('owner_user_id', ownerUserId.toString());
  
  const queryString = params.toString();
  const endpoint = queryString ? `/workstream/workload-analysis?${queryString}` : '/workstream/workload-analysis';
  
  return withErrors(
    () => http.get<{ data: WorkloadAnalysis[] }>(endpoint).then(r => r.data),
    'Failed to load workload analysis'
  );
}

// Memory Integration
export async function getMemoryCard(
  entityType: string,
  entityId: number,
  etag?: string
): Promise<MemoryCard> {
  return withErrors(
    async () => {
      const headers: Record<string, string> = {};
      if (etag) headers['If-None-Match'] = etag;
      
      const config = { headers };
      const response = await fetch(`/api/memory/card?entity_type=${entityType}&entity_id=${entityId}`, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data;
    },
    'Failed to load memory card'
  );
}

export async function createMemoryAtom(payload: {
  entity_type: string;
  entity_id: number;
  atom_type: MemoryAtom['atom_type'];
  content: string;
  source?: MemoryAtom['source'];
  tags?: string[];
}): Promise<MemoryAtom> {
  return withErrors(
    () => http.post<MemoryAtom>('/memory/atoms', payload),
    'Failed to create memory atom'
  );
}

export async function redactMemoryAtom(
  atomId: number,
  payload: {
    action: 'redact' | 'correct';
    reason?: string;
    new_content?: string;
  }
): Promise<{ ok: true }> {
  return withErrors(
    () => http.post<{ ok: true }>('/memory/redactions', { atom_id: atomId, ...payload }),
    'Failed to redact memory atom'
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
