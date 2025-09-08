// Central app config & API endpoints
export const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// People Module API endpoints
export const PEOPLE_API = {
  PEOPLE: `${API_BASE}/people`,
  STAFFING_REQUESTS: `${API_BASE}/staffing-requests`,
  RATES: `${API_BASE}/rates`,
  ASSIGNMENTS: `${API_BASE}/assignments`,
  WEBSOCKET: import.meta.env.VITE_WS_URL || 'ws://localhost:4001/ws'
};

// Engagements Module API endpoints
export const ENGAGEMENTS_API = {
  ENGAGEMENTS: `${API_BASE}/engagements`,
  FEATURES: `${API_BASE}/engagements/:id/features`,
  MILESTONES: `${API_BASE}/engagements/:id/milestones`,
  DEPENDENCIES: `${API_BASE}/engagements/:id/dependencies`,
  CHANGE_REQUESTS: `${API_BASE}/engagements/:id/change-requests`,
  AUDIT_PATHS: `${API_BASE}/engagements/:id/audit-paths`,
  AUDIT_STEPS: `${API_BASE}/engagements/:id/audit-steps`,
  JOB_TASKS: `${API_BASE}/engagements/:id/job-tasks`,
  WEBSOCKET: import.meta.env.VITE_WS_URL || 'ws://localhost:4001/ws'
};

// Billing & Contracts Module API endpoints
export const BILLING_API = {
  BASE_URL: import.meta.env.VITE_BILLING_API_URL || `${API_BASE}/billing`,
  CONTRACTS: `${API_BASE}/billing/contracts`,
  TIME_ENTRIES: `${API_BASE}/billing/time-entries`,
  INVOICES: `${API_BASE}/billing/invoices`,
  PAYMENTS: `${API_BASE}/billing/payments`,
  STATISTICS: `${API_BASE}/billing/stats`,
  REVENUE_REPORT: `${API_BASE}/billing/revenue-report`,
  COLLECTIONS: `${API_BASE}/billing/collections`,
  EXCHANGE_RATES: `${API_BASE}/billing/exchange-rates`,
  CONVERT_CURRENCY: `${API_BASE}/billing/convert`,
  WEBSOCKET: import.meta.env.VITE_BILLING_WS_URL || 'ws://localhost:4001/billing/ws'
};

// Automation Module API endpoints
export const AUTOMATION_API = {
  BASE_URL: import.meta.env.VITE_AUTOMATION_API_URL || `${API_BASE}/automation`,
  RULES: `${API_BASE}/automation/rules`,
  EVENTS: `${API_BASE}/automation/events`,
  LOGS: `${API_BASE}/automation/logs`,
  TEMPLATES: `${API_BASE}/automation/templates`,
  STATISTICS: `${API_BASE}/automation/stats`,
  EXECUTIONS: `${API_BASE}/automation/executions`,
  TEST: `${API_BASE}/automation/test`,
  WEBSOCKET: import.meta.env.VITE_AUTOMATION_WS_URL || 'ws://localhost:4001/automation/ws'
};

export const FEATURE_FLAGS = {
  amberAccent: true,
  peopleModule: true,
  engagementsModule: true,
  billingModule: true,
  automationModule: true,
  realTimeUpdates: true,
  candidateRanking: true,
  rateBreakdown: true,
  advancedEngagements: true,
  changeRequests: true,
  dependencyTracking: true,
  multiCurrency: true,
  timeTracking: true,
  invoiceGeneration: true,
  paymentProcessing: true,
  revenueRecognition: true,
  collections: true,
  eventDrivenAutomation: true,
  ruleEngine: true,
  automationTemplates: true,
  actionCatalog: true,
  eventIngestion: true
};

// Disable random failures during vitest runs for determinism (support both Vitest and browser)
const isTestEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITEST) ||
  (typeof process !== 'undefined' && (process as any).env?.VITEST);
export const RANDOM_FAILURE_RATE = isTestEnv ? 0 : 0.1; // 10% simulated failure otherwise

// Organization configuration (for multi-tenant support)
export const ORG_CONFIG = {
  orgId: import.meta.env.VITE_ORG_ID || '1',
  environment: import.meta.env.VITE_ENVIRONMENT || 'development'
};
