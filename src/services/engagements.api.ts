import { ENGAGEMENTS_API, ORG_CONFIG } from '@config';
import { http } from './client.ts';
import { toast } from '../lib/toast.ts';

// Reimplement withErrors locally since it's not exported from api.ts
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
        } else if (e.message) {
          msg = String(e.message);
        }
      } else if (typeof e === 'string') {
        msg = e;
      }
    } catch {
      // If normalizing fails, use the original error message
      msg = errMsg;
    }
    
    toast.error(msg);
    throw e;
  });
}

// ================================
// CORE TYPES - ENGAGEMENTS MODULE
// ================================

export interface Engagement {
  id: number;
  org_id: number;
  client_id: number;
  type: 'project' | 'audit' | 'job';
  name: string;
  owner_id: number;
  status: 'active' | 'on_hold' | 'completed' | 'cancelled';
  health: 'green' | 'yellow' | 'red';
  start_at: string;
  due_at?: string;
  contract_id?: number;
  created_at: string;
  updated_at: string;
  
  // Computed fields
  client_name?: string;
  owner_name?: string;
  progress_pct?: number;
  days_remaining?: number;
  is_overdue?: boolean;
}

export interface Feature {
  id: number;
  org_id: number;
  engagement_id: number;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  state: 'todo' | 'in_progress' | 'done';
  assignee_id?: number;
  due_at?: string;
  created_at: string;
  updated_at: string;
  
  // Computed fields
  assignee_name?: string;
  days_remaining?: number;
  is_overdue?: boolean;
}

export interface AuditPath {
  id: number;
  org_id: number;
  engagement_id: number;
  name: string;
  description?: string;
  created_at: string;
  
  // Related
  steps?: AuditStep[];
}

export interface AuditStep {
  id: number;
  org_id: number;
  audit_path_id: number;
  step_number: number;
  title: string;
  description?: string;
  state: 'pending' | 'in_progress' | 'done';
  assignee_id?: number;
  due_at?: string;
  created_at: string;
  updated_at: string;
  
  // Computed fields
  assignee_name?: string;
  days_remaining?: number;
  is_overdue?: boolean;
}

export interface JobTask {
  id: number;
  org_id: number;
  engagement_id: number;
  title: string;
  description?: string;
  state: 'todo' | 'in_progress' | 'done';
  assignee_id?: number;
  due_at?: string;
  created_at: string;
  updated_at: string;
  
  // Computed fields
  assignee_name?: string;
  days_remaining?: number;
  is_overdue?: boolean;
}

export interface Milestone {
  id: number;
  org_id: number;
  engagement_id: number;
  name: string;
  type: 'delivery' | 'payment' | 'review' | 'approval';
  status: 'planned' | 'active' | 'completed';
  due_at: string;
  created_at: string;
  updated_at: string;
  
  // Computed fields
  days_remaining?: number;
  is_overdue?: boolean;
}

export interface Dependency {
  id: number;
  org_id: number;
  from_type: 'feature' | 'audit_step' | 'job_task' | 'milestone';
  from_id: number;
  to_type: 'feature' | 'audit_step' | 'job_task' | 'milestone';
  to_id: number;
  dep_type: 'FS' | 'SS' | 'FF' | 'SF'; // Finish-Start, Start-Start, Finish-Finish, Start-Finish
  lag_days: number;
  created_at: string;
  
  // Computed fields
  from_title?: string;
  to_title?: string;
  is_blocking?: boolean;
}

export interface ChangeRequest {
  id: number;
  org_id: number;
  engagement_id: number;
  origin: 'client' | 'internal' | 'vendor';
  title: string;
  description?: string;
  scope_delta?: string;
  hours_delta?: number;
  value_delta?: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  created_by: number;
  created_at: string;
  updated_at: string;
  decided_at?: string;
  decided_by?: number;
  
  // Computed fields
  created_by_name?: string;
  decided_by_name?: string;
  impact_assessment?: string;
}

// ================================
// FILTERS AND SEARCH
// ================================

export interface EngagementFilters {
  orgId?: string;
  type?: ('project' | 'audit' | 'job')[];
  status?: ('active' | 'on_hold' | 'completed' | 'cancelled')[];
  health?: ('green' | 'yellow' | 'red')[];
  client_id?: number;
  owner_id?: number;
  due_range?: {
    start?: string;
    end?: string;
  };
  search?: string;
}

export interface FeatureFilters {
  orgId?: string;
  engagement_id?: number;
  state?: ('todo' | 'in_progress' | 'done')[];
  priority?: ('low' | 'medium' | 'high' | 'critical')[];
  assignee_id?: number;
  overdue_only?: boolean;
  search?: string;
}

export interface ChangeRequestFilters {
  orgId?: string;
  engagement_id?: number;
  status?: ('draft' | 'submitted' | 'approved' | 'rejected')[];
  origin?: ('client' | 'internal' | 'vendor')[];
  created_by?: number;
  search?: string;
}

// ================================
// API RESPONSE TYPES
// ================================

export interface EngagementApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
    hasMore?: boolean;
  };
  errors?: string[];
}

// ================================
// STATE MACHINE TRANSITIONS
// ================================

export const ENGAGEMENT_TRANSITIONS = {
  active: ['on_hold', 'completed', 'cancelled'],
  on_hold: ['active', 'completed', 'cancelled'],
  completed: [], // Terminal state
  cancelled: []  // Terminal state
} as const;

export const FEATURE_TRANSITIONS = {
  todo: ['in_progress'],
  in_progress: ['done', 'todo'],
  done: [] // Terminal state
} as const;

export const AUDIT_STEP_TRANSITIONS = {
  pending: ['in_progress'],
  in_progress: ['done', 'pending'],
  done: [] // Terminal state
} as const;

export const CHANGE_REQUEST_TRANSITIONS = {
  draft: ['submitted'],
  submitted: ['approved', 'rejected', 'draft'],
  approved: [], // Terminal state
  rejected: []  // Terminal state
} as const;

// ================================
// API CLIENT CLASS
// ================================

export class EngagementsApiClient {
  private baseUrl: string;
  private orgId: string;

  constructor(config: { baseUrl: string; orgId?: string }) {
    this.baseUrl = config.baseUrl;
    this.orgId = config.orgId || ORG_CONFIG.orgId;
  }

  // ================================
  // ENGAGEMENTS CRUD
  // ================================

  async getEngagements(filters: EngagementFilters = {}): Promise<EngagementApiResponse<Engagement[]>> {
    const params = new URLSearchParams({
      org_id: filters.orgId || this.orgId,
      ...this.buildFilterParams(filters)
    });

    return withErrors(
      () => http.get(`${ENGAGEMENTS_API.ENGAGEMENTS}?${params}`),
      'Failed to load engagements'
    );
  }

  async getEngagement(id: number): Promise<EngagementApiResponse<Engagement>> {
    const params = new URLSearchParams({ org_id: this.orgId });
    
    return withErrors(
      () => http.get(`${ENGAGEMENTS_API.ENGAGEMENTS}/${id}?${params}`),
      'Failed to load engagement'
    );
  }

  async createEngagement(data: Omit<Engagement, 'id' | 'created_at' | 'updated_at'>): Promise<EngagementApiResponse<Engagement>> {
    const payload = {
      ...data,
      org_id: data.org_id || this.orgId
    };

    return withErrors(
      () => http.post(ENGAGEMENTS_API.ENGAGEMENTS, payload),
      'Failed to create engagement'
    );
  }

  async updateEngagement(id: number, data: Partial<Engagement>): Promise<EngagementApiResponse<Engagement>> {
    const payload = {
      ...data,
      org_id: this.orgId
    };

    return withErrors(
      () => http.put(`${ENGAGEMENTS_API.ENGAGEMENTS}/${id}`, payload),
      'Failed to update engagement'
    );
  }

  async deleteEngagement(id: number): Promise<EngagementApiResponse<{ deleted: boolean }>> {
    const params = new URLSearchParams({ org_id: this.orgId });
    
    return withErrors(
      () => http.del(`${ENGAGEMENTS_API.ENGAGEMENTS}/${id}?${params}`),
      'Failed to delete engagement'
    );
  }

  // ================================
  // FEATURES CRUD (Projects)
  // ================================

  async getFeatures(engagementId: number, filters: FeatureFilters = {}): Promise<EngagementApiResponse<Feature[]>> {
    const url = ENGAGEMENTS_API.FEATURES.replace(':id', engagementId.toString());
    const params = new URLSearchParams({
      org_id: filters.orgId || this.orgId,
      ...this.buildFilterParams(filters)
    });

    return withErrors(
      () => http.get(`${url}?${params}`),
      'Failed to load features'
    );
  }

  async createFeature(engagementId: number, data: Omit<Feature, 'id' | 'org_id' | 'engagement_id' | 'created_at' | 'updated_at'>): Promise<EngagementApiResponse<Feature>> {
    const url = ENGAGEMENTS_API.FEATURES.replace(':id', engagementId.toString());
    const payload = {
      ...data,
      org_id: this.orgId,
      engagement_id: engagementId
    };

    return withErrors(
      () => http.post(url, payload),
      'Failed to create feature'
    );
  }

  async updateFeature(engagementId: number, featureId: number, data: Partial<Feature>): Promise<EngagementApiResponse<Feature>> {
    const url = ENGAGEMENTS_API.FEATURES.replace(':id', engagementId.toString());
    const payload = {
      ...data,
      org_id: this.orgId
    };

    return withErrors(
      () => http.put(`${url}/${featureId}`, payload),
      'Failed to update feature'
    );
  }

  async deleteFeature(engagementId: number, featureId: number): Promise<EngagementApiResponse<{ deleted: boolean }>> {
    const url = ENGAGEMENTS_API.FEATURES.replace(':id', engagementId.toString());
    const params = new URLSearchParams({ org_id: this.orgId });
    
    return withErrors(
      () => http.del(`${url}/${featureId}?${params}`),
      'Failed to delete feature'
    );
  }

  // ================================
  // MILESTONES CRUD
  // ================================

  async getMilestones(engagementId: number): Promise<EngagementApiResponse<Milestone[]>> {
    const url = ENGAGEMENTS_API.MILESTONES.replace(':id', engagementId.toString());
    const params = new URLSearchParams({ org_id: this.orgId });

    return withErrors(
      () => http.get(`${url}?${params}`),
      'Failed to load milestones'
    );
  }

  async createMilestone(engagementId: number, data: Omit<Milestone, 'id' | 'org_id' | 'engagement_id' | 'created_at' | 'updated_at'>): Promise<EngagementApiResponse<Milestone>> {
    const url = ENGAGEMENTS_API.MILESTONES.replace(':id', engagementId.toString());
    const payload = {
      ...data,
      org_id: this.orgId,
      engagement_id: engagementId
    };

    return withErrors(
      () => http.post(url, payload),
      'Failed to create milestone'
    );
  }

  async updateMilestone(engagementId: number, milestoneId: number, data: Partial<Milestone>): Promise<EngagementApiResponse<Milestone>> {
    const url = ENGAGEMENTS_API.MILESTONES.replace(':id', engagementId.toString());
    const payload = {
      ...data,
      org_id: this.orgId
    };

    return withErrors(
      () => http.put(`${url}/${milestoneId}`, payload),
      'Failed to update milestone'
    );
  }

  // ================================
  // CHANGE REQUESTS CRUD
  // ================================

  async getChangeRequests(engagementId: number, filters: ChangeRequestFilters = {}): Promise<EngagementApiResponse<ChangeRequest[]>> {
    const url = ENGAGEMENTS_API.CHANGE_REQUESTS.replace(':id', engagementId.toString());
    const params = new URLSearchParams({
      org_id: filters.orgId || this.orgId,
      ...this.buildFilterParams(filters)
    });

    return withErrors(
      () => http.get(`${url}?${params}`),
      'Failed to load change requests'
    );
  }

  async createChangeRequest(engagementId: number, data: Omit<ChangeRequest, 'id' | 'org_id' | 'engagement_id' | 'created_at' | 'updated_at'>): Promise<EngagementApiResponse<ChangeRequest>> {
    const url = ENGAGEMENTS_API.CHANGE_REQUESTS.replace(':id', engagementId.toString());
    const payload = {
      ...data,
      org_id: this.orgId,
      engagement_id: engagementId
    };

    return withErrors(
      () => http.post(url, payload),
      'Failed to create change request'
    );
  }

  async updateChangeRequest(engagementId: number, changeRequestId: number, data: Partial<ChangeRequest>): Promise<EngagementApiResponse<ChangeRequest>> {
    const url = ENGAGEMENTS_API.CHANGE_REQUESTS.replace(':id', engagementId.toString());
    const payload = {
      ...data,
      org_id: this.orgId
    };

    return withErrors(
      () => http.put(`${url}/${changeRequestId}`, payload),
      'Failed to update change request'
    );
  }

  // ================================
  // AUDIT PATHS & STEPS
  // ================================

  async getAuditPaths(engagementId: number): Promise<EngagementApiResponse<AuditPath[]>> {
    const url = ENGAGEMENTS_API.AUDIT_PATHS.replace(':id', engagementId.toString());
    const params = new URLSearchParams({ org_id: this.orgId });

    return withErrors(
      () => http.get(`${url}?${params}`),
      'Failed to load audit paths'
    );
  }

  async createAuditPath(engagementId: number, data: Omit<AuditPath, 'id' | 'org_id' | 'engagement_id' | 'created_at'>): Promise<EngagementApiResponse<AuditPath>> {
    const url = ENGAGEMENTS_API.AUDIT_PATHS.replace(':id', engagementId.toString());
    const payload = {
      ...data,
      org_id: this.orgId,
      engagement_id: engagementId
    };

    return withErrors(
      () => http.post(url, payload),
      'Failed to create audit path'
    );
  }

  async getAuditSteps(engagementId: number): Promise<EngagementApiResponse<AuditStep[]>> {
    const url = ENGAGEMENTS_API.AUDIT_STEPS.replace(':id', engagementId.toString());
    const params = new URLSearchParams({ org_id: this.orgId });

    return withErrors(
      () => http.get(`${url}?${params}`),
      'Failed to load audit steps'
    );
  }

  async updateAuditStep(engagementId: number, stepId: number, data: Partial<AuditStep>): Promise<EngagementApiResponse<AuditStep>> {
    const url = ENGAGEMENTS_API.AUDIT_STEPS.replace(':id', engagementId.toString());
    const payload = {
      ...data,
      org_id: this.orgId
    };

    return withErrors(
      () => http.put(`${url}/${stepId}`, payload),
      'Failed to update audit step'
    );
  }

  // ================================
  // JOB TASKS CRUD
  // ================================

  async getJobTasks(engagementId: number): Promise<EngagementApiResponse<JobTask[]>> {
    const url = ENGAGEMENTS_API.JOB_TASKS.replace(':id', engagementId.toString());
    const params = new URLSearchParams({ org_id: this.orgId });

    return withErrors(
      () => http.get(`${url}?${params}`),
      'Failed to load job tasks'
    );
  }

  async createJobTask(engagementId: number, data: Omit<JobTask, 'id' | 'org_id' | 'engagement_id' | 'created_at' | 'updated_at'>): Promise<EngagementApiResponse<JobTask>> {
    const url = ENGAGEMENTS_API.JOB_TASKS.replace(':id', engagementId.toString());
    const payload = {
      ...data,
      org_id: this.orgId,
      engagement_id: engagementId
    };

    return withErrors(
      () => http.post(url, payload),
      'Failed to create job task'
    );
  }

  async updateJobTask(engagementId: number, taskId: number, data: Partial<JobTask>): Promise<EngagementApiResponse<JobTask>> {
    const url = ENGAGEMENTS_API.JOB_TASKS.replace(':id', engagementId.toString());
    const payload = {
      ...data,
      org_id: this.orgId
    };

    return withErrors(
      () => http.put(`${url}/${taskId}`, payload),
      'Failed to update job task'
    );
  }

  // ================================
  // DEPENDENCIES CRUD
  // ================================

  async getDependencies(engagementId: number): Promise<EngagementApiResponse<Dependency[]>> {
    const url = ENGAGEMENTS_API.DEPENDENCIES.replace(':id', engagementId.toString());
    const params = new URLSearchParams({ org_id: this.orgId });

    return withErrors(
      () => http.get(`${url}?${params}`),
      'Failed to load dependencies'
    );
  }

  async createDependency(engagementId: number, data: Omit<Dependency, 'id' | 'org_id' | 'created_at'>): Promise<EngagementApiResponse<Dependency>> {
    const url = ENGAGEMENTS_API.DEPENDENCIES.replace(':id', engagementId.toString());
    const payload = {
      ...data,
      org_id: this.orgId
    };

    return withErrors(
      () => http.post(url, payload),
      'Failed to create dependency'
    );
  }

  async deleteDependency(engagementId: number, dependencyId: number): Promise<EngagementApiResponse<{ deleted: boolean }>> {
    const url = ENGAGEMENTS_API.DEPENDENCIES.replace(':id', engagementId.toString());
    const params = new URLSearchParams({ org_id: this.orgId });
    
    return withErrors(
      () => http.del(`${url}/${dependencyId}?${params}`),
      'Failed to delete dependency'
    );
  }

  // ================================
  // UTILITY METHODS
  // ================================

  validateStateTransition(currentState: string, newState: string, entity: 'engagement' | 'feature' | 'audit_step' | 'change_request'): boolean {
    const transitions: Record<string, Record<string, readonly string[]>> = {
      engagement: ENGAGEMENT_TRANSITIONS,
      feature: FEATURE_TRANSITIONS,
      audit_step: AUDIT_STEP_TRANSITIONS,
      change_request: CHANGE_REQUEST_TRANSITIONS
    };

    const entityTransitions = transitions[entity];
    const validTransitions = entityTransitions?.[currentState];
    return validTransitions?.includes(newState) || false;
  }

  calculateProgress(items: { state: string }[], completedStates: string[] = ['done', 'completed']): number {
    if (items.length === 0) return 0;
    
    const completedCount = items.filter(item => 
      completedStates.includes(item.state)
    ).length;
    
    return completedCount / items.length;
  }

  private buildFilterParams(filters: Record<string, any>): Record<string, string> {
    const params: Record<string, string> = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      
      if (Array.isArray(value)) {
        params[key] = value.join(',');
      } else if (typeof value === 'object') {
        // Handle nested objects like due_range
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (subValue !== undefined && subValue !== null) {
            params[`${key}.${subKey}`] = String(subValue);
          }
        });
      } else {
        params[key] = String(value);
      }
    });
    
    return params;
  }
}

// ================================
// CONVENIENCE FUNCTIONS
// ================================

// Create default API client instance
export const engagementsApi = new EngagementsApiClient({
  baseUrl: ENGAGEMENTS_API.ENGAGEMENTS,
  orgId: ORG_CONFIG.orgId
});

// Convenience functions using the default client
export const getEngagements = (filters?: EngagementFilters) => 
  engagementsApi.getEngagements(filters);

export const getEngagement = (id: number) => 
  engagementsApi.getEngagement(id);

export const createEngagement = (data: Omit<Engagement, 'id' | 'created_at' | 'updated_at'>) => 
  engagementsApi.createEngagement(data);

export const updateEngagement = (id: number, data: Partial<Engagement>) => 
  engagementsApi.updateEngagement(id, data);

export const deleteEngagement = (id: number) => 
  engagementsApi.deleteEngagement(id);

export const getFeatures = (engagementId: number, filters?: FeatureFilters) => 
  engagementsApi.getFeatures(engagementId, filters);

export const createFeature = (engagementId: number, data: Omit<Feature, 'id' | 'org_id' | 'engagement_id' | 'created_at' | 'updated_at'>) => 
  engagementsApi.createFeature(engagementId, data);

export const updateFeature = (engagementId: number, featureId: number, data: Partial<Feature>) => 
  engagementsApi.updateFeature(engagementId, featureId, data);

export const getMilestones = (engagementId: number) => 
  engagementsApi.getMilestones(engagementId);

export const createMilestone = (engagementId: number, data: Omit<Milestone, 'id' | 'org_id' | 'engagement_id' | 'created_at' | 'updated_at'>) => 
  engagementsApi.createMilestone(engagementId, data);

export const getChangeRequests = (engagementId: number, filters?: ChangeRequestFilters) => 
  engagementsApi.getChangeRequests(engagementId, filters);

export const createChangeRequest = (engagementId: number, data: Omit<ChangeRequest, 'id' | 'org_id' | 'engagement_id' | 'created_at' | 'updated_at'>) => 
  engagementsApi.createChangeRequest(engagementId, data);

export const updateChangeRequest = (engagementId: number, changeRequestId: number, data: Partial<ChangeRequest>) => 
  engagementsApi.updateChangeRequest(engagementId, changeRequestId, data);

// State transition helpers
export const canTransitionEngagementState = (currentState: string, newState: string) => 
  engagementsApi.validateStateTransition(currentState, newState, 'engagement');

export const canTransitionFeatureState = (currentState: string, newState: string) => 
  engagementsApi.validateStateTransition(currentState, newState, 'feature');

export const calculateEngagementProgress = (features: Feature[]) => 
  engagementsApi.calculateProgress(features, ['done']);

export const calculateAuditProgress = (steps: AuditStep[]) => 
  engagementsApi.calculateProgress(steps, ['done']);

export const calculateJobProgress = (tasks: JobTask[]) => 
  engagementsApi.calculateProgress(tasks, ['done']);
