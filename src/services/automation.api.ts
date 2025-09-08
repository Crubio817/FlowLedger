/**
 * Automation Module API Client for FlowLedger
 * Production-ready implementation with event-driven automation capabilities
 */

import { AUTOMATION_API } from '../config.ts';
import { toast } from '../lib/toast.ts';

// =====================================================
// CORE TYPES & INTERFACES
// =====================================================

export interface AutomationRule {
  rule_id?: number;
  org_id: number;
  name: string;
  description?: string;
  is_enabled: boolean;
  trigger: AutomationTrigger;
  conditions?: any; // JSON-logic object
  throttle?: AutomationThrottle;
  actions: AutomationAction[];
  created_at?: string;
  updated_at?: string;
  last_executed?: string;
  execution_count?: number;
}

export interface AutomationTrigger {
  event_types: string[];
  schedule?: {
    cron?: string;
    rrule?: string;
    timezone?: string;
  };
  filter?: Record<string, any>;
}

export interface AutomationThrottle {
  per: 'minute' | 'hour' | 'day';
  limit: number;
  window_start?: string;
  current_count?: number;
}

export interface AutomationAction {
  type: string;
  params: Record<string, any>;
  retry_policy?: {
    max_attempts: number;
    backoff_multiplier: number;
  };
}

export interface AutomationEvent {
  event_id?: number;
  type: string;
  tenant_id: number;
  aggregate_type?: string;
  aggregate_id?: number;
  payload: Record<string, any>;
  source: 'domain' | 'provider' | 'webhook';
  correlation_id?: string;
  idempotency_key?: string;
  created_at?: string;
}

export interface AutomationExecution {
  execution_id: number;
  rule_id: number;
  event_id: number;
  outcome: 'success' | 'failure' | 'skipped' | 'throttled';
  actions_attempted: number;
  actions_succeeded: number;
  error_message?: string;
  execution_time_ms: number;
  created_at: string;
}

export interface AutomationLog {
  log_id: number;
  rule_id: number;
  rule_name: string;
  event_type: string;
  outcome: 'success' | 'failure' | 'skipped' | 'throttled';
  error_message?: string;
  execution_time_ms: number;
  correlation_id?: string;
  created_at: string;
}

export interface AutomationTemplate {
  template_id: string;
  name: string;
  description: string;
  category: string;
  rule: Omit<AutomationRule, 'rule_id' | 'org_id'>;
}

export interface AutomationStatistics {
  totalRules: number;
  activeRules: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  avgExecutionTime: number;
  executionsToday: number;
  executionsThisWeek: number;
  topTriggerEvents: Array<{ event_type: string; count: number }>;
  topActions: Array<{ action_type: string; count: number }>;
  ruleHealthCounts: {
    healthy: number;
    warning: number;
    error: number;
  };
}

export interface TestRuleResult {
  matches: boolean;
  reason?: string;
  evaluation: {
    trigger_matched: boolean;
    conditions_passed: boolean;
    throttle_ok: boolean;
  };
  actions?: AutomationAction[];
  execution_time_ms: number;
}

// Request/Response Types
export interface CreateRuleRequest {
  org_id: number;
  name: string;
  description?: string;
  is_enabled?: boolean;
  trigger: AutomationTrigger;
  conditions?: any;
  throttle?: AutomationThrottle;
  actions: AutomationAction[];
}

export interface UpdateRuleRequest {
  name?: string;
  description?: string;
  is_enabled?: boolean;
  trigger?: AutomationTrigger;
  conditions?: any;
  throttle?: AutomationThrottle;
  actions?: AutomationAction[];
}

export interface RuleFilters {
  org_id?: number;
  is_enabled?: boolean;
  event_type?: string;
  search?: string;
}

export interface LogFilters {
  org_id?: number;
  rule_id?: number;
  outcome?: AutomationExecution['outcome'];
  date_from?: string;
  date_to?: string;
}

// API Response Types
export interface ApiResponse<T> {
  status: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RulesResponse extends ApiResponse<AutomationRule[]> {}
export interface LogsResponse extends ApiResponse<AutomationLog[]> {}
export interface TemplatesResponse extends ApiResponse<AutomationTemplate[]> {}

// =====================================================
// EVENT TYPES CATALOG
// =====================================================

export const EVENT_TYPES = {
  // Communication Events
  COMMS: {
    MESSAGE_RECEIVED: 'Comms.MessageReceived',
    THREAD_CREATED: 'Comms.ThreadCreated',
    THREAD_IDLE: 'Comms.ThreadIdle',
    STATUS_CHANGED: 'Comms.StatusChanged',
    THREAD_ESCALATED: 'Comms.ThreadEscalated',
    ATTACHMENT_UPLOADED: 'Comms.AttachmentUploaded'
  },
  
  // Workstream Events
  WORKSTREAM: {
    SIGNAL_CREATED: 'Workstream.SignalCreated',
    CANDIDATE_PROMOTED: 'Workstream.CandidatePromoted',
    PURSUIT_WON: 'Workstream.PursuitWon',
    SLA_BREACH: 'Workstream.SLABreach',
    PURSUIT_LOST: 'Workstream.PursuitLost'
  },
  
  // Engagement Events
  ENGAGEMENTS: {
    TASK_DONE: 'Engagements.TaskDone',
    FEATURE_DONE: 'Engagements.FeatureDone',
    ENGAGEMENT_STARTED: 'Engagements.EngagementStarted',
    MILESTONE_REACHED: 'Engagements.MilestoneReached',
    DEPENDENCY_BLOCKED: 'Engagements.DependencyBlocked'
  },
  
  // Document Events
  DOCS: {
    DOCUMENT_APPROVED: 'Docs.DocumentApproved',
    DOCUMENT_REJECTED: 'Docs.DocumentRejected',
    DOCUMENT_UPLOADED: 'Docs.DocumentUploaded',
    REVIEW_REQUESTED: 'Docs.ReviewRequested'
  },
  
  // Billing Events
  BILLING: {
    INVOICE_POSTED: 'Billing.InvoicePosted',
    INVOICE_OVERDUE: 'Billing.InvoiceOverdue',
    PAYMENT_RECEIVED: 'Billing.PaymentReceived',
    CONTRACT_EXPIRING: 'Billing.ContractExpiring'
  },
  
  // People Events
  PEOPLE: {
    ASSIGNMENT_CREATED: 'People.AssignmentCreated',
    PERSON_AVAILABLE: 'People.PersonAvailable',
    SKILL_UPDATED: 'People.SkillUpdated',
    PERFORMANCE_REVIEW: 'People.PerformanceReview'
  },
  
  // Provider Events
  PROVIDERS: {
    GRAPH_CALENDAR: 'Graph.CalendarEvent',
    ZAMMAD_TICKET: 'Zammad.TicketCreated',
    EMAIL_RECEIVED: 'Provider.EmailReceived'
  }
} as const;

// =====================================================
// ACTION TYPES CATALOG
// =====================================================

export const ACTION_TYPES = {
  // Communication Actions
  COMMS: {
    DRAFT_REPLY: 'comms.draft_reply',
    SEND_EMAIL: 'comms.send_email',
    SET_STATUS: 'comms.set_status',
    ESCALATE: 'comms.escalate',
    ASSIGN_THREAD: 'comms.assign_thread',
    ADD_TAG: 'comms.add_tag'
  },
  
  // Workstream Actions
  WORKSTREAM: {
    CREATE_CANDIDATE: 'workstream.create_candidate',
    PROMOTE_TO_PURSUIT: 'workstream.promote_to_pursuit',
    UPDATE_SLA: 'workstream.update_sla',
    ASSIGN_OWNER: 'workstream.assign_owner'
  },
  
  // Engagement Actions
  ENGAGEMENTS: {
    CREATE_TASK: 'engagements.create_task',
    UPDATE_STATE: 'engagements.update_state',
    GENERATE_REPORT: 'engagements.generate_report_doc',
    ASSIGN_RESOURCE: 'engagements.assign_resource',
    UPDATE_PROGRESS: 'engagements.update_progress'
  },
  
  // Billing Actions
  BILLING: {
    CREATE_INVOICE: 'billing.create_invoice',
    ADD_MILESTONE_LINE: 'billing.add_milestone_line',
    POST_INVOICE: 'billing.post_invoice',
    SEND_DUNNING: 'billing.send_dunning',
    RECORD_PAYMENT: 'billing.record_payment'
  },
  
  // People Actions
  PEOPLE: {
    CREATE_STAFFING_REQUEST: 'people.create_staffing_request',
    RANK_CANDIDATES: 'people.rank_candidates',
    CREATE_ASSIGNMENT: 'people.create_assignment',
    UPDATE_AVAILABILITY: 'people.update_availability'
  },
  
  // Automation Actions
  AUTOMATION: {
    SCHEDULE_FOLLOWUP: 'automation.schedule_followup',
    EMIT_EVENT: 'automation.emit_event',
    CALL_WEBHOOK: 'automation.call_webhook',
    DELAY_ACTION: 'automation.delay_action'
  }
} as const;

// =====================================================
// LOCAL ERROR HANDLING
// =====================================================

function withErrors<T>(fn: () => Promise<T>, errMsg = 'Automation operation failed'): Promise<T> {
  return fn().catch((e: any) => {
    const message = e.response?.data?.error?.message || e.message || errMsg;
    toast.error(`Automation Error: ${message}`);
    throw e;
  });
}

// =====================================================
// AUTOMATION API CLIENT
// =====================================================

export class AutomationApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = AUTOMATION_API.BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // =====================================================
  // RULE MANAGEMENT
  // =====================================================

  async getAutomationRules(filters: RuleFilters & { page?: number; limit?: number } = {}): Promise<RulesResponse> {
    return withErrors(async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });

      return this.fetch<RulesResponse>(`/rules?${params.toString()}`);
    }, 'Failed to load automation rules');
  }

  async getAutomationRule(ruleId: number, orgId?: number): Promise<ApiResponse<AutomationRule>> {
    return withErrors(async () => {
      const params = orgId ? `?org_id=${orgId}` : '';
      return this.fetch<ApiResponse<AutomationRule>>(`/rules/${ruleId}${params}`);
    }, 'Failed to load automation rule');
  }

  async createAutomationRule(data: CreateRuleRequest): Promise<ApiResponse<AutomationRule>> {
    return withErrors(async () => {
      return this.fetch<ApiResponse<AutomationRule>>('/rules', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }, 'Failed to create automation rule');
  }

  async updateAutomationRule(ruleId: number, data: UpdateRuleRequest): Promise<ApiResponse<AutomationRule>> {
    return withErrors(async () => {
      return this.fetch<ApiResponse<AutomationRule>>(`/rules/${ruleId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    }, 'Failed to update automation rule');
  }

  async deleteAutomationRule(ruleId: number, orgId?: number): Promise<{ success: boolean }> {
    return withErrors(async () => {
      const params = orgId ? `?org_id=${orgId}` : '';
      await this.fetch(`/rules/${ruleId}${params}`, {
        method: 'DELETE',
      });
      return { success: true };
    }, 'Failed to delete automation rule');
  }

  async toggleAutomationRule(ruleId: number, enabled: boolean): Promise<ApiResponse<AutomationRule>> {
    return withErrors(async () => {
      return this.fetch<ApiResponse<AutomationRule>>(`/rules/${ruleId}/toggle`, {
        method: 'POST',
        body: JSON.stringify({ is_enabled: enabled }),
      });
    }, 'Failed to toggle automation rule');
  }

  // =====================================================
  // RULE TESTING
  // =====================================================

  async testAutomationRule(orgId: number, rule: AutomationRule, sampleEvent: AutomationEvent): Promise<TestRuleResult> {
    return withErrors(async () => {
      return this.fetch<TestRuleResult>('/rules/test', {
        method: 'POST',
        body: JSON.stringify({
          org_id: orgId,
          rule,
          event: sampleEvent,
        }),
      });
    }, 'Failed to test automation rule');
  }

  async validateRule(rule: Omit<AutomationRule, 'rule_id'>): Promise<{ valid: boolean; errors: string[] }> {
    return withErrors(async () => {
      return this.fetch<{ valid: boolean; errors: string[] }>('/rules/validate', {
        method: 'POST',
        body: JSON.stringify({ rule }),
      });
    }, 'Failed to validate automation rule');
  }

  // =====================================================
  // EVENT INGESTION
  // =====================================================

  async ingestAutomationEvent(event: AutomationEvent): Promise<{ success: boolean; event_id: number }> {
    return withErrors(async () => {
      return this.fetch<{ success: boolean; event_id: number }>('/events', {
        method: 'POST',
        body: JSON.stringify(event),
      });
    }, 'Failed to ingest automation event');
  }

  async getAutomationEvents(orgId: number, filters: { page?: number; limit?: number; event_type?: string } = {}): Promise<ApiResponse<AutomationEvent[]>> {
    return withErrors(async () => {
      const params = new URLSearchParams({ org_id: String(orgId) });
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });

      return this.fetch<ApiResponse<AutomationEvent[]>>(`/events?${params.toString()}`);
    }, 'Failed to load automation events');
  }

  // =====================================================
  // EXECUTION LOGS & MONITORING
  // =====================================================

  async getAutomationLogs(filters: LogFilters & { page?: number; limit?: number } = {}): Promise<LogsResponse> {
    return withErrors(async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });

      return this.fetch<LogsResponse>(`/logs?${params.toString()}`);
    }, 'Failed to load automation logs');
  }

  async getAutomationStatistics(orgId: number, dateRange?: { from: string; to: string }): Promise<ApiResponse<AutomationStatistics>> {
    return withErrors(async () => {
      const params = new URLSearchParams({ org_id: String(orgId) });
      if (dateRange) {
        params.append('from', dateRange.from);
        params.append('to', dateRange.to);
      }

      return this.fetch<ApiResponse<AutomationStatistics>>(`/stats?${params.toString()}`);
    }, 'Failed to load automation statistics');
  }

  async getExecutionDetails(executionId: number): Promise<ApiResponse<AutomationExecution & { actions: any[] }>> {
    return withErrors(async () => {
      return this.fetch<ApiResponse<AutomationExecution & { actions: any[] }>>(`/executions/${executionId}`);
    }, 'Failed to load execution details');
  }

  // =====================================================
  // TEMPLATES
  // =====================================================

  async getAutomationTemplates(category?: string): Promise<TemplatesResponse> {
    return withErrors(async () => {
      const params = category ? `?category=${category}` : '';
      return this.fetch<TemplatesResponse>(`/templates${params}`);
    }, 'Failed to load automation templates');
  }

  async createRuleFromTemplate(orgId: number, templateId: string, customizations?: Partial<AutomationRule>): Promise<ApiResponse<AutomationRule>> {
    return withErrors(async () => {
      return this.fetch<ApiResponse<AutomationRule>>('/rules/from-template', {
        method: 'POST',
        body: JSON.stringify({
          org_id: orgId,
          template_id: templateId,
          customizations: customizations || {},
        }),
      });
    }, 'Failed to create rule from template');
  }

  // =====================================================
  // BULK OPERATIONS
  // =====================================================

  async bulkToggleRules(orgId: number, ruleIds: number[], enabled: boolean): Promise<{ success: boolean; updated_count: number }> {
    return withErrors(async () => {
      return this.fetch<{ success: boolean; updated_count: number }>('/rules/bulk-toggle', {
        method: 'POST',
        body: JSON.stringify({
          org_id: orgId,
          rule_ids: ruleIds,
          is_enabled: enabled,
        }),
      });
    }, 'Failed to bulk toggle rules');
  }

  async bulkDeleteRules(orgId: number, ruleIds: number[]): Promise<{ success: boolean; deleted_count: number }> {
    return withErrors(async () => {
      return this.fetch<{ success: boolean; deleted_count: number }>('/rules/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({
          org_id: orgId,
          rule_ids: ruleIds,
        }),
      });
    }, 'Failed to bulk delete rules');
  }

  // =====================================================
  // REAL-TIME UPDATES
  // =====================================================

  createWebSocketConnection(orgId: number, onMessage: (data: any) => void): WebSocket {
    const ws = new WebSocket(`${AUTOMATION_API.WEBSOCKET}?org_id=${orgId}`);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type && data.type.startsWith('automation.')) {
          onMessage(data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast.error('Real-time connection error');
    };

    return ws;
  }
}

// =====================================================
// EXPORTS
// =====================================================

export const automationApiClient = new AutomationApiClient();
export default automationApiClient;

// Helper functions for common operations
export const formatExecutionTime = (milliseconds: number): string => {
  if (milliseconds < 1000) return `${milliseconds}ms`;
  return `${(milliseconds / 1000).toFixed(2)}s`;
};

export const getRuleHealth = (rule: AutomationRule & { recent_executions?: AutomationExecution[] }): 'healthy' | 'warning' | 'error' => {
  if (!rule.is_enabled) return 'warning';
  
  const recentExecutions = rule.recent_executions || [];
  const failureRate = recentExecutions.length > 0 
    ? recentExecutions.filter(e => e.outcome === 'failure').length / recentExecutions.length 
    : 0;
  
  if (failureRate > 0.5) return 'error';
  if (failureRate > 0.2 || recentExecutions.length === 0) return 'warning';
  return 'healthy';
};

export const getEventTypeDisplayName = (eventType: string): string => {
  return eventType.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim() || eventType;
};

export const getActionTypeDisplayName = (actionType: string): string => {
  const parts = actionType.split('.');
  return parts.length > 1 ? `${parts[0]}: ${parts[1].replace(/_/g, ' ')}` : actionType;
};

export const parseTemplateVariables = (template: string, variables: Record<string, any>): string => {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const value = path.split('.').reduce((obj: any, key: string) => obj?.[key], variables);
    return value !== undefined ? String(value) : match;
  });
};
