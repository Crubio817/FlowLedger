export type ID = number;

export type DashboardStats = {
  active_clients: number;
  audits_in_progress: number;
  sipocs_completed: number;
  pending_interviews: number;
};

export type RecentAudit = {
  audit_id: number;
  client_id: number;
  title: string;
  status: string;
  last_touched_utc: string; // ISO
};

export type ActivityItem = {
  id: ID;
  type: "SIPOC" | "Interview" | "ProcessMap" | "Finding" | "Audit";
  title: string;
  auditId?: ID;
  clientId?: ID;
  timestamp: string; // ISO
};

export type SipocDoc = {
  audit_id: number;
  suppliers_json: string[];
  inputs_json: string[];
  process_json: string[];
  outputs_json: string[];
  customers_json: string[];
  metrics_json?: Record<string, string | number | boolean>;
  updated_utc?: string;
};

export type Interview = {
  interview_id: number;
  audit_id: number;
  persona: string;
  mode?: 'Video' | 'InPerson' | 'Phone' | null;
  scheduled_utc?: string | null;
  status: 'Planned' | 'Completed' | 'Canceled';
  notes?: string | null;
  created_utc?: string;
  updated_utc?: string;
};

export type PageMeta = { page: number; limit: number; total?: number };

export type InterviewResponse = {
  response_id: number;
  interview_id: number;
  question_id: string;
  answer: string;
  created_utc?: string;
};

export type QAItem = {
  question_id: string;
  prompt: string;
  tags?: string[];
  truth_gap?: boolean;
};

export type ProcessMap = {
  process_map_id: number;
  audit_id: number;
  title?: string | null;
  blob_path: string;
  file_type?: 'bpmn' | 'svg' | 'png' | 'jpg' | 'pdf' | string | null;
  uploaded_utc?: string;
};

export type UploadUrlResponse = {
  uploadUrl: string;
  blob_path: string;
  contentType?: string;
};

// Live Findings record (snake_case to match backend)
export interface Finding {
  audit_id: number;
  findings_json: string[];
  recommendations_json: string[];
  priority_json: Record<string, 'Low' | 'Medium' | 'High'>;
  updated_utc?: string;
}

export type Question = { id: string; text: string };
