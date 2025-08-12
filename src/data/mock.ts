import { ActivityItem, DashboardStats, InterviewResponse, ProcessMap, SipocDoc, Question } from "../store/types.ts";

export const dashboardStats: DashboardStats = {
  active_clients: 4,
  audits_in_progress: 3,
  sipocs_completed: 8,
  pending_interviews: 5,
};

export const lastAudit = {
  id: 101,
  title: "Q3 Procure-to-Pay Audit",
  client: "Acme Corp",
  status: "In Progress",
};

export const sipoc: SipocDoc = {
  audit_id: 101,
  suppliers_json: ["Vendors", "Warehouse"],
  inputs_json: ["PO", "Invoice", "Goods Receipt"],
  process_json: ["Create PO", "Receive Goods", "Match Invoice", "Approve", "Pay Vendor"],
  outputs_json: ["Paid Invoice", "Updated Ledger"],
  customers_json: ["Vendors", "Finance"],
  metrics_json: { onTimePaymentRate: 92, duplicateRate: 0.4 },
  updated_utc: new Date().toISOString(),
};

// interviews moved to live API

export const questionBank: Question[] = [
  { id: 'q1', text: 'Walk me through the invoice approval steps.' },
  { id: 'q2', text: 'Where do delays most often occur?' },
  { id: 'q3', text: 'How are exceptions handled?' },
  { id: 'q4', text: 'Describe data handoffs between teams.' },
  { id: 'q5', text: 'What KPIs do you track daily?' },
  { id: 'q6', text: 'Which tasks feel most manual?' },
  { id: 'q7', text: 'Any recent process changes?' },
  { id: 'q8', text: 'Tools or systems involved?' },
  { id: 'q9', text: 'Biggest risk you perceive?' },
  { id: 'q10', text: 'If you could change one thing tomorrow?' },
];

export const interviewResponses: InterviewResponse[] = [
  { response_id: 11, interview_id: 3, question_id: 'q1', answer: 'We receive invoice -> match -> approve -> pay', created_utc: new Date().toISOString() },
  { response_id: 12, interview_id: 3, question_id: 'q2', answer: 'Delays in approvals when managers travel', created_utc: new Date().toISOString() },
  { response_id: 13, interview_id: 3, question_id: 'q5', answer: 'Cycle time, exceptions per 1k invoices', created_utc: new Date().toISOString() },
];

export const processMaps: ProcessMap[] = [
  { process_map_id: 900, audit_id: 101, title: 'Invoice to Pay - Current', file_type: 'png', blob_path: '/mock/invoice2pay.png', uploaded_utc: new Date().toISOString() },
  { process_map_id: 901, audit_id: 101, title: 'Receiving Flow', file_type: 'svg', blob_path: '/mock/receiving.svg', uploaded_utc: new Date().toISOString() },
];

// Findings now served by live API

export const recentActivity: ActivityItem[] = [
  { id: 501, type: 'Audit', title: 'Resumed Q3 Procure-to-Pay Audit', auditId: 101, timestamp: new Date(Date.now()-3600_000).toISOString() },
  { id: 502, type: 'SIPOC', title: 'Updated SIPOC process steps', auditId: 101, timestamp: new Date(Date.now()-2*3600_000).toISOString() },
  { id: 503, type: 'Interview', title: 'Completed Finance Director interview', auditId: 101, timestamp: new Date(Date.now()-3*3600_000).toISOString() },
  { id: 504, type: 'Finding', title: 'Added recommendation: Mobile approvals', auditId: 101, timestamp: new Date(Date.now()-5*3600_000).toISOString() },
  { id: 505, type: 'ProcessMap', title: 'Uploaded Receiving Flow map', auditId: 101, timestamp: new Date(Date.now()-6*3600_000).toISOString() },
  { id: 506, type: 'Interview', title: 'Scheduled AP Clerk interview', auditId: 101, timestamp: new Date(Date.now()-8*3600_000).toISOString() },
  { id: 507, type: 'SIPOC', title: 'Added metric: onTimePaymentRate', auditId: 101, timestamp: new Date(Date.now()-12*3600_000).toISOString() },
];
