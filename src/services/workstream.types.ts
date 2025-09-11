// Workstream Module v2.1 - Type Definitions
// Multi-tenant workstream management with Signal → Candidate → Pursuit → Engagement flow

// Base types for multi-tenancy (all entities have org_id)
export interface BaseEntity {
  org_id: number;
  created_utc: string;
  updated_utc?: string;
}

// Signal: Incoming lead/opportunity signals (v2.2 enhanced)
export interface Signal extends BaseEntity {
  signal_id: number;
  snippet: string;
  source_type: 'email' | 'phone' | 'web' | 'referral' | 'linkedin' | 'other';
  source_ref?: string; // Reference to source system
  urgency_score: number; // 0.0-1.0 (v2.2 normalized)
  cluster_id?: number; // Group related signals
  cluster_count?: number; // How many in cluster
  owner_user_id?: number;
  status: 'new' | 'triaged' | 'candidate_created' | 'ignored';
  contact_id?: number; // Resolved contact
  client_id?: number; // Resolved client
  contact_email?: string;
  contact_phone?: string;
  company_domain?: string;
  problem_phrase?: string;
  solution_hint?: string;
  dedupe_key?: string; // Identity resolution key
  metadata_json?: any; // Source-specific data
  has_candidate?: boolean;
}

// Candidate: Potential opportunities from signals (v2.2 enhanced)
export interface Candidate extends BaseEntity {
  candidate_id: number;
  signal_id?: number; // Origin signal
  title: string;
  client_id?: number; // If known client
  contact_id?: number; // Resolved contact
  contact_name?: string;
  contact_email?: string;
  value_band: 'small' | 'medium' | 'large' | 'enterprise'; // Revenue potential
  one_liner_scope?: string; // Brief scope description
  confidence: number; // 0-100 likelihood
  status: 'new' | 'triaged' | 'nurture' | 'on_hold' | 'promoted' | 'archived';
  owner_user_id?: number;
  last_touch_at?: string;
  days_since_touch?: number; // Computed field
  promoted_at?: string;
  notes?: string;
  sla_badge?: 'green' | 'amber' | 'red';
  has_threads?: number; // Count of related threads
  has_docs?: number; // Count of related documents
  spotlight_scores?: SpotlightScoresSummary; // ICP scoring
}

// Pursuit: Active deals/opportunities (v2.2 enhanced)
export interface Pursuit extends BaseEntity {
  pursuit_id: number;
  candidate_id: number; // Source candidate
  title: string;
  client_id?: number;
  stage: 'qual' | 'pink' | 'red' | 'submit' | 'won' | 'lost';
  due_date?: string;
  owner_user_id?: number;
  forecast_value_usd?: number;
  probability: number; // 0-100
  description?: string;
  compliance_score?: number; // Quality score (0-10)
  checklist_required?: boolean; // For Pink/Red gating
  checklist_complete?: boolean;
  submitted_at?: string;
  decision_at?: string;
  sla_badge?: 'green' | 'amber' | 'red';
  has_threads?: number; // Count of related threads
  has_docs?: number; // Count of related documents
  last_touch_at?: string;
}

// Proposal: Versioned proposals for pursuits
export interface Proposal extends BaseEntity {
  proposal_id: number;
  pursuit_id: number;
  version: number;
  status: 'draft' | 'review' | 'sent' | 'accepted' | 'rejected';
  title?: string;
  content?: string;
  sent_at?: string;
  expires_at?: string;
}

// Work Events: Audit trail and outbox for async processing
export interface WorkEvent extends BaseEntity {
  event_id: number;
  entity_type: 'signal' | 'candidate' | 'pursuit' | 'proposal';
  entity_id: number;
  event_name: string; // e.g., 'candidate.promoted', 'pursuit.submit'
  payload_json?: any;
  processed_at?: string;
  retry_count: number;
  next_retry_at?: string;
  error_message?: string;
}

// Drip Schedule: Nurture campaigns for candidates
export interface DripSchedule extends BaseEntity {
  drip_id: number;
  candidate_id: number;
  sequence_day: number;
  action_type: 'email' | 'task' | 'call';
  template_id?: string;
  scheduled_for: string;
  completed_at?: string;
  status: 'pending' | 'sent' | 'failed' | 'skipped';
}

// SLA Rules: Configurable SLA definitions
export interface SlaRule extends BaseEntity {
  rule_id: number;
  rule_name: string; // 'triage_sla', 'proposal_sla', 'response_sla'
  entity_type: 'signal' | 'candidate' | 'pursuit';
  threshold_hours: number;
  is_active: boolean;
}

// SLA Breaches: Recorded violations
export interface SlaBreach extends BaseEntity {
  breach_id: number;
  rule_id: number;
  entity_type: 'signal' | 'candidate' | 'pursuit';
  entity_id: number;
  expected_by: string;
  actual_time?: string;
  hours_over: number;
  resolved_at?: string;
}

// Problem Taxonomy: Standardized categories
export interface ProblemTaxonomy extends BaseEntity {
  problem_id: number;
  category: string;
  subcategory?: string;
  description: string;
  is_active: boolean;
}

// Solution Catalog: Available solutions
export interface SolutionCatalog extends BaseEntity {
  solution_id: number;
  name: string;
  description: string;
  effort_days?: number;
  value_usd?: number;
  is_active: boolean;
}

// Cost of Sale tracking
export interface CosEntry extends BaseEntity {
  cos_id: number;
  pursuit_id: number;
  activity_type: 'discovery' | 'proposal' | 'demo' | 'travel' | 'other';
  hours_spent: number;
  cost_usd: number;
  description?: string;
  date: string;
}

// PERT Estimation by role
export interface PursuitRoleEstimate extends BaseEntity {
  estimate_id: number;
  pursuit_id: number;
  role: string; // 'analyst', 'senior', 'manager', 'director'
  optimistic_days: number;
  most_likely_days: number;
  pessimistic_days: number;
  confidence: number; // 0-100
}

// Links to work items (threads/docs)
export interface WorkItemLink extends BaseEntity {
  link_id: number;
  entity_type: 'signal' | 'candidate' | 'pursuit';
  entity_id: number;
  link_type: 'thread' | 'document' | 'recording' | 'other';
  url: string;
  title?: string;
  description?: string;
}

// Pursuit Checklist: Required items for stage gates
export interface PursuitChecklist extends BaseEntity {
  checklist_id: number;
  pursuit_id: number;
  item_name: string;
  required_for_stage: 'pink' | 'red' | 'submit';
  completed: boolean;
  completed_by?: number;
  completed_at?: string;
  notes?: string;
}

// API Response Types
export interface WorkstreamApiResponse<T> {
  status: 'ok' | 'error';
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// Today Panel unified view (v2.2 enhanced with priority scoring)
export interface TodayPanelItem {
  item_type: 'signal' | 'candidate' | 'pursuit';
  item_id: number;
  org_id: number;
  label: string;
  state: string; // Current status/stage
  owner_user_id?: number;
  last_touch_at?: string;
  due_date?: string;
  sla_metric?: string; // SLA rule being tracked
  badge?: 'green' | 'amber' | 'red'; // SLA status
  priority_score?: number; // Computed priority (0-200)
  priority_tier?: 'critical' | 'high' | 'medium' | 'low';
  icp_band?: 'high' | 'medium' | 'low'; // ICP scoring band
  hours_since_touch?: number;
  has_threads?: boolean;
  has_docs?: boolean;
  urgency_score?: number; // For signals (0.0-1.0)
  value_band?: string; // For candidates
  forecast_value_usd?: number; // For pursuits
}

// Filter/Query types
export interface SignalFilters {
  clustered?: boolean;
  source?: string;
  urgency_min?: number;
  owner?: number;
  status?: string;
}

export interface CandidateFilters {
  status?: string;
  owner?: number;
  client?: number;
  sla?: 'green' | 'amber' | 'red';
  value_band?: string;
}

export interface PursuitFilters {
  stage?: string;
  owner?: number;
  due_before?: string;
  sla?: 'green' | 'amber' | 'red';
  client?: number;
}

// State machine definitions (v2.2 enhanced - configurable)
export const CANDIDATE_TRANSITIONS = {
  new: ['triaged', 'archived'],
  triaged: ['nurture', 'on_hold', 'promoted', 'archived'],
  nurture: ['on_hold', 'promoted', 'archived'],
  on_hold: ['nurture', 'promoted', 'archived'],
  promoted: ['archived'], // Terminal after promotion
  archived: [], // Terminal state
} as const;

export const PURSUIT_TRANSITIONS = {
  qual: ['pink', 'lost'],
  pink: ['red', 'lost'],
  red: ['submit', 'lost'],
  submit: ['won', 'lost'],
  won: [], // Terminal state
  lost: [], // Terminal state
} as const;

// MCP Integration types
export interface McpEnrichResult {
  contact_data?: any;
  company_data?: any;
  social_profiles?: any[];
  confidence_score: number;
  provider: string;
}

export interface McpAnalysisResult {
  summary: string;
  urgency_score: number;
  recommended_actions: string[];
  categories: string[];
}

export interface McpProposalDraft {
  title: string;
  executive_summary: string;
  solution_outline: string;
  estimated_effort: string;
  next_steps: string[];
}

// SLA Constants
export const SLA_RULES = {
  TRIAGE_SLA: 24, // hours
  PROPOSAL_SLA: 72, // hours  
  RESPONSE_SLA: 96, // hours
} as const;

// Status badge utilities
export function calculateSlaStatus(dueDate: string, now: Date = new Date()): 'green' | 'amber' | 'red' {
  const due = new Date(dueDate);
  const hoursUntilDue = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (hoursUntilDue < 0) return 'red'; // Overdue
  if (hoursUntilDue < 6) return 'amber'; // Due soon
  return 'green'; // On track
}

export function getValueBandColor(band: string): string {
  switch (band) {
    case 'enterprise': return 'text-purple-400';
    case 'large': return 'text-blue-400';
    case 'medium': return 'text-emerald-400';
    case 'small': return 'text-yellow-400';
    default: return 'text-zinc-400';
  }
}

export function getStageColor(stage: string): string {
  switch (stage) {
    case 'qual': return 'text-blue-400';
    case 'pink': return 'text-pink-400';
    case 'red': return 'text-red-400';
    case 'submit': return 'text-purple-400';
    case 'won': return 'text-emerald-400';
    case 'lost': return 'text-zinc-500';
    default: return 'text-zinc-400';
  }
}

export function getPriorityTierColor(tier: string): string {
  switch (tier) {
    case 'critical': return 'text-red-400 bg-red-500/20';
    case 'high': return 'text-orange-400 bg-orange-500/20';
    case 'medium': return 'text-yellow-400 bg-yellow-500/20';
    case 'low': return 'text-emerald-400 bg-emerald-500/20';
    default: return 'text-zinc-400 bg-zinc-500/20';
  }
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '--';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// New v2.2 types for enhanced features
export interface SpotlightScoresSummary {
  total_score: number;
  top_positive: string;
  top_negative: string;
}

export interface IdentityResolution {
  contact_resolved: boolean;
  contact_id?: number;
  client_resolved: boolean;
  client_id?: number;
  confidence_score: number;
  resolution_method: 'auto_resolved' | 'manual_resolved' | 'conflict_detected';
}

export interface QualityGateResult {
  gate_type: string;
  missing_items: string[];
  required_items: string[];
  all_completed: boolean;
}

export interface ConfigurationItem {
  config_id: number;
  config_type: 'sla_rule' | 'gate_rule' | 'ranking_rule' | 'spotlight_rule';
  config_key: string;
  config_value: any;
  effective_from: string;
  effective_to?: string;
}

export interface IdentityConflict {
  conflict_id: number;
  key_type: 'email' | 'phone' | 'domain';
  key_value: string;
  conflicting_contact_ids: number[];
  conflicting_client_ids: number[];
  conflict_reason: string;
  detected_at: string;
  resolution_status: 'pending' | 'resolved' | 'ignored';
}

export interface SpotlightScoreBreakdown {
  item_type: 'signal' | 'candidate' | 'pursuit';
  item_id: number;
  spotlight_id?: number;
  total_score: number;
  algorithm_version: string;
  scored_at: string;
  score_breakdown: SpotlightScoreComponent[];
  top_positive: string;
  top_negative: string;
  component_count: number;
}

export interface SpotlightScoreComponent {
  name: string;
  score: number;
  weight: number;
  reason: string;
  contribution: number;
}

export interface WorkloadAnalysis {
  owner_user_id: number;
  total_items: number;
  critical_items: number;
  high_priority_items: number;
  medium_priority_items: number;
  low_priority_items: number;
  avg_priority_score: number;
  sla_breaches: number;
  at_risk_items: number;
  max_hours_without_touch: number;
  stale_items: number;
}

export interface MemoryCard {
  summary: {
    key_facts: string[];
    recent_activity: string[];
    decisions: string[];
  };
  top_atoms: MemoryAtom[];
  last_built_at: string;
  etag: string;
  empty: boolean;
}

export interface MemoryAtom {
  atom_id?: number;
  entity_type: string;
  entity_id: number;
  atom_type: 'decision' | 'risk' | 'preference' | 'note' | 'status';
  content: string;
  occurred_at: string;
  source_url?: string;
  score?: number;
  tags?: string[];
  source?: {
    system: string;
    origin_id?: string;
    url?: string;
  };
}
