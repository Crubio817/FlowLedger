import { toast } from '../lib/toast.ts';
import { http } from './client.ts';
import type { PageMeta } from './models.ts';

export type ApiEnvelope<T> = { status: string; data: T; meta?: PageMeta & Record<string, any> };

function withErrors<T>(fn: () => Promise<T>, errMsg = 'Request failed'): Promise<T> {
  return fn().catch((e: any) => {
    // Normalize error messages from various sources
    let msg = errMsg;
    try {
      if (e && typeof e === 'object') {
        if (typeof e.code === 'number' && typeof e.message === 'string') {
          const raw = e.message;
          try {
            const parsed = JSON.parse(raw);
            e.parsed = parsed;
            if (parsed?.error?.message) msg = String(parsed.error.message);
            else if (parsed?.message) msg = String(parsed.message);
            else msg = raw;
            if (parsed?.error?.code === 'ETIMEOUT') {
              msg = 'Server timeout (DB connect). Please try again shortly.';
            }
          } catch {
            msg = String(e.message || errMsg);
          }
          if (e.code >= 500 && !msg) msg = `Server error (${e.code})`;
        } else if (e?.message && typeof e.message === 'string') {
          msg = e.message || errMsg;
        } else {
          msg = errMsg;
        }
      } else {
        msg = String(e) || errMsg;
      }
    } catch (_inner) {
      msg = errMsg;
    }

    toast.error(msg);
    e.normalizedMessage = msg;
    throw e;
  });
}

// ================================
// DOCUMENT TYPES
// ================================

export interface Document {
  id: number;
  title: string;
  type: 'proposal' | 'sow' | 'report' | 'deliverable' | 'sop' | 'evidence' | 'other';
  status: 'draft' | 'in_review' | 'approved' | 'released' | 'archived';
  classification: 'internal' | 'client_view' | 'confidential';
  source: 'upload' | 'template' | 'external_link' | 'generated';
  storage_url?: string;
  mime_type?: string;
  size_bytes?: number;
  created_by_user_id: number;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
  latest_version?: number;
  hash_sha256?: string;
}

export interface DocumentVersion {
  id: number;
  document_id: number;
  vnum: number;
  author_id: number;
  change_note?: string;
  storage_ref: string;
  hash_sha256: string;
  hash_prefix: string;
  created_at: string;
}

export interface DocumentLink {
  id: number;
  document_id: number;
  entity_type: 'client' | 'pursuit' | 'engagement' | 'audit' | 'finding';
  entity_id: number;
  link_type: 'attachment' | 'reference' | 'evidence' | 'deliverable';
  created_at: string;
}

export interface Template {
  id: number;
  name: string;
  description?: string;
  template_type: 'proposal' | 'sow' | 'report' | 'invoice' | 'other';
  content_template: string;
  variables: TemplateVariable[];
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'boolean' | 'array';
  default_value?: string;
  description?: string;
  is_required: boolean;
}

export interface ShareLink {
  id: number;
  document_id: number;
  token: string;
  scope: 'view' | 'download' | 'comment';
  expires_at?: string;
  watermark: boolean;
  password_protected: boolean;
  access_count: number;
  created_at: string;
}

export interface ApprovalRequest {
  id: number;
  document_id: number;
  requester_id: number;
  approver_ids: number[];
  approval_type: 'sequential' | 'parallel';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  notes?: string;
  created_at: string;
  completed_at?: string;
}

export interface Binder {
  id: number;
  title: string;
  description?: string;
  binder_type: 'deliverable' | 'proposal' | 'audit_pack' | 'custom';
  status: 'draft' | 'generating' | 'ready' | 'delivered';
  output_format: 'pdf' | 'zip' | 'both';
  generated_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface BinderItem {
  id: number;
  binder_id: number;
  document_id: number;
  sort_order: number;
  include_attachments: boolean;
  page_break_before: boolean;
}

export interface KnowledgeArticle {
  id: number;
  title: string;
  content: string;
  article_type: 'sop' | 'runbook' | 'faq' | 'guide' | 'policy';
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  author_id: number;
  publish_date?: string;
  created_at: string;
  updated_at?: string;
}

export interface DocumentSearchResult {
  document_id: number;
  title: string;
  type: string;
  content_snippet: string;
  relevance_score: number;
  highlights: string[];
}

// ================================
// DOCUMENT API FUNCTIONS
// ================================

export async function listDocuments(filters: {
  org_id: number;
  type?: string;
  status?: string;
  classification?: string;
  page?: number;
  limit?: number;
} = { org_id: 1 }): Promise<{ data: Document[]; meta?: PageMeta }> {
  const params = new URLSearchParams();
  params.set('org_id', filters.org_id.toString());
  if (filters.type) params.set('type', filters.type);
  if (filters.status) params.set('status', filters.status);
  if (filters.classification) params.set('classification', filters.classification);
  if (filters.page) params.set('page', filters.page.toString());
  if (filters.limit) params.set('limit', filters.limit.toString());

  return withErrors(
    () => http.get<{ data: Document[]; meta?: PageMeta }>(`/docs?${params.toString()}`),
    'Failed to load documents'
  );
}

export async function getDocument(id: number, orgId: number): Promise<Document> {
  return withErrors(
    () => http.get<Document>(`/docs/${id}?org_id=${orgId}`),
    'Failed to load document'
  );
}

export async function createDocument(payload: {
  org_id: number;
  title: string;
  type: Document['type'];
  source: Document['source'];
  storage_url?: string;
  mime_type?: string;
  size_bytes?: number;
  classification?: Document['classification'];
}): Promise<Document> {
  return withErrors(
    () => http.post<Document>('/docs', payload),
    'Failed to create document'
  );
}

export async function updateDocument(id: number, payload: Partial<Document>): Promise<Document> {
  return withErrors(
    () => http.put<Document>(`/docs/${id}`, payload),
    'Failed to update document'
  );
}

export async function deleteDocument(id: number, orgId: number): Promise<{ ok: true }> {
  return withErrors(
    () => http.del<{ ok: true }>(`/docs/${id}?org_id=${orgId}`),
    'Failed to delete document'
  );
}

// ================================
// DOCUMENT VERSIONS API
// ================================

export async function addDocumentVersion(documentId: number, payload: {
  org_id: number;
  storage_ref: string;
  hash_sha256: string;
  change_note?: string;
}): Promise<DocumentVersion> {
  return withErrors(
    () => http.post<DocumentVersion>(`/docs/${documentId}/versions?org_id=${payload.org_id}`, payload),
    'Failed to add document version'
  );
}

export async function getDocumentVersions(documentId: number, orgId: number): Promise<DocumentVersion[]> {
  return withErrors(
    () => http.get<DocumentVersion[]>(`/docs/${documentId}/versions?org_id=${orgId}`),
    'Failed to load document versions'
  );
}

// ================================
// DOCUMENT STATUS API
// ================================

export async function updateDocumentStatus(documentId: number, payload: {
  org_id: number;
  status: Document['status'];
}): Promise<{ id: number; status: string }> {
  return withErrors(
    () => http.put<{ id: number; status: string }>(`/docs/${documentId}/status?org_id=${payload.org_id}`, payload),
    'Failed to update document status'
  );
}

// ================================
// SHARE LINKS API
// ================================

export async function createShareLink(documentId: number, payload: {
  org_id: number;
  scope: ShareLink['scope'];
  expires_at?: string;
  watermark?: boolean;
  password?: string;
}): Promise<ShareLink> {
  return withErrors(
    () => http.post<ShareLink>(`/docs/${documentId}/share?org_id=${payload.org_id}`, payload),
    'Failed to create share link'
  );
}

export async function getShareLinks(documentId: number, orgId: number): Promise<ShareLink[]> {
  return withErrors(
    () => http.get<ShareLink[]>(`/docs/${documentId}/shares?org_id=${orgId}`),
    'Failed to load share links'
  );
}

export async function revokeShareLink(documentId: number, shareId: number, orgId: number): Promise<{ ok: true }> {
  return withErrors(
    () => http.del<{ ok: true }>(`/docs/${documentId}/shares/${shareId}?org_id=${orgId}`),
    'Failed to revoke share link'
  );
}

// ================================
// APPROVAL WORKFLOWS API
// ================================

export async function requestApproval(documentId: number, payload: {
  org_id: number;
  approver_ids: number[];
  approval_type: 'sequential' | 'parallel';
  notes?: string;
}): Promise<ApprovalRequest> {
  return withErrors(
    () => http.post<ApprovalRequest>(`/docs/${documentId}/approve?org_id=${payload.org_id}`, payload),
    'Failed to request approval'
  );
}

export async function getApprovalRequests(documentId: number, orgId: number): Promise<ApprovalRequest[]> {
  return withErrors(
    () => http.get<ApprovalRequest[]>(`/docs/${documentId}/approvals?org_id=${orgId}`),
    'Failed to load approval requests'
  );
}

// ================================
// TEMPLATES API
// ================================

export async function listTemplates(filters: {
  org_id: number;
  template_type?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
} = { org_id: 1 }): Promise<{ data: Template[]; meta?: PageMeta }> {
  const params = new URLSearchParams();
  params.set('org_id', filters.org_id.toString());
  if (filters.template_type) params.set('template_type', filters.template_type);
  if (filters.is_active !== undefined) params.set('is_active', filters.is_active.toString());
  if (filters.page) params.set('page', filters.page.toString());
  if (filters.limit) params.set('limit', filters.limit.toString());

  return withErrors(
    () => http.get<{ data: Template[]; meta?: PageMeta }>(`/templates?${params.toString()}`),
    'Failed to load templates'
  );
}

export async function getTemplate(id: number, orgId: number): Promise<Template> {
  return withErrors(
    () => http.get<Template>(`/templates/${id}?org_id=${orgId}`),
    'Failed to load template'
  );
}

export async function createTemplate(payload: {
  org_id: number;
  name: string;
  description?: string;
  template_type: Template['template_type'];
  content_template: string;
  variables: Omit<TemplateVariable, 'id' | 'template_id'>[];
  is_active: boolean;
}): Promise<Template> {
  return withErrors(
    () => http.post<Template>('/templates', payload),
    'Failed to create template'
  );
}

export async function updateTemplate(id: number, payload: {
  org_id: number;
  name?: string;
  description?: string;
  content_template?: string;
  is_active?: boolean;
}): Promise<Template> {
  return withErrors(
    () => http.put<Template>(`/templates/${id}`, payload),
    'Failed to update template'
  );
}

export async function deleteTemplate(id: number, orgId: number): Promise<{ ok: true }> {
  return withErrors(
    () => http.del<{ ok: true }>(`/templates/${id}?org_id=${orgId}`),
    'Failed to delete template'
  );
}

export async function renderTemplate(templateId: number, payload: {
  org_id: number;
  variables: Record<string, any>;
  output_format?: 'html' | 'pdf' | 'docx';
}): Promise<{ document_id: number; rendered_content?: string }> {
  return withErrors(
    () => http.post<{ document_id: number; rendered_content?: string }>(`/templates/${templateId}/render?org_id=${payload.org_id}`, payload),
    'Failed to render template'
  );
}

// ================================
// BINDERS API
// ================================

export async function createBinder(payload: {
  org_id: number;
  title: string;
  description?: string;
  binder_type: Binder['binder_type'];
  output_format: Binder['output_format'];
  document_ids: number[];
}): Promise<Binder> {
  return withErrors(
    () => http.post<Binder>('/binders', payload),
    'Failed to create binder'
  );
}

export async function listBinders(filters: {
  org_id: number;
  binder_type?: string;
  status?: string;
  page?: number;
  limit?: number;
} = { org_id: 1 }): Promise<{ data: Binder[]; meta?: PageMeta }> {
  const params = new URLSearchParams();
  params.set('org_id', filters.org_id.toString());
  if (filters.binder_type) params.set('binder_type', filters.binder_type);
  if (filters.status) params.set('status', filters.status);
  if (filters.page) params.set('page', filters.page.toString());
  if (filters.limit) params.set('limit', filters.limit.toString());

  return withErrors(
    () => http.get<{ data: Binder[]; meta?: PageMeta }>(`/binders?${params.toString()}`),
    'Failed to load binders'
  );
}

export async function getBinder(id: number, orgId: number): Promise<Binder & { items: BinderItem[] }> {
  return withErrors(
    () => http.get<Binder & { items: BinderItem[] }>(`/binders/${id}?org_id=${orgId}`),
    'Failed to load binder'
  );
}

export async function generateBinder(id: number, orgId: number): Promise<{ job_id: string }> {
  return withErrors(
    () => http.post<{ job_id: string }>(`/binders/${id}/generate?org_id=${orgId}`, {}),
    'Failed to generate binder'
  );
}

// ================================
// KNOWLEDGE ARTICLES API
// ================================

export async function listKnowledgeArticles(filters: {
  org_id: number;
  article_type?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
} = { org_id: 1 }): Promise<{ data: KnowledgeArticle[]; meta?: PageMeta }> {
  const params = new URLSearchParams();
  params.set('org_id', filters.org_id.toString());
  if (filters.article_type) params.set('article_type', filters.article_type);
  if (filters.category) params.set('category', filters.category);
  if (filters.status) params.set('status', filters.status);
  if (filters.page) params.set('page', filters.page.toString());
  if (filters.limit) params.set('limit', filters.limit.toString());

  return withErrors(
    () => http.get<{ data: KnowledgeArticle[]; meta?: PageMeta }>(`/knowledge?${params.toString()}`),
    'Failed to load knowledge articles'
  );
}

export async function getKnowledgeArticle(id: number, orgId: number): Promise<KnowledgeArticle> {
  return withErrors(
    () => http.get<KnowledgeArticle>(`/knowledge/${id}?org_id=${orgId}`),
    'Failed to load knowledge article'
  );
}

export async function createKnowledgeArticle(payload: Omit<KnowledgeArticle, 'id' | 'created_at' | 'updated_at'> & { org_id: number }): Promise<KnowledgeArticle> {
  return withErrors(
    () => http.post<KnowledgeArticle>('/knowledge', payload),
    'Failed to create knowledge article'
  );
}

export async function updateKnowledgeArticle(id: number, payload: Partial<KnowledgeArticle>): Promise<KnowledgeArticle> {
  return withErrors(
    () => http.put<KnowledgeArticle>(`/knowledge/${id}`, payload),
    'Failed to update knowledge article'
  );
}

export async function deleteKnowledgeArticle(id: number, orgId: number): Promise<{ ok: true }> {
  return withErrors(
    () => http.del<{ ok: true }>(`/knowledge/${id}?org_id=${orgId}`),
    'Failed to delete knowledge article'
  );
}

export async function publishKnowledgeArticle(id: number, orgId: number): Promise<KnowledgeArticle> {
  return withErrors(
    () => http.post<KnowledgeArticle>(`/knowledge/${id}/publish?org_id=${orgId}`, {}),
    'Failed to publish knowledge article'
  );
}

// ================================
// SEARCH API
// ================================

export async function searchDocuments(query: string, filters: {
  org_id: number;
  document_types?: string[];
  date_range?: { start: string; end: string };
  limit?: number;
} = { org_id: 1 }): Promise<{ data: DocumentSearchResult[]; meta?: any }> {
  const params = new URLSearchParams();
  params.set('org_id', filters.org_id.toString());
  params.set('q', query);
  if (filters.document_types?.length) {
    filters.document_types.forEach(type => params.append('types', type));
  }
  if (filters.date_range) {
    params.set('from_date', filters.date_range.start);
    params.set('to_date', filters.date_range.end);
  }
  if (filters.limit) params.set('limit', filters.limit.toString());

  return withErrors(
    () => http.get<{ data: DocumentSearchResult[]; meta?: any }>(`/search/docs?${params.toString()}`),
    'Failed to search documents'
  );
}

// ================================
// HELPER FUNCTIONS
// ================================

export function getDocumentStatusColor(status: Document['status']): string {
  switch (status) {
    case 'draft': return 'text-zinc-400';
    case 'in_review': return 'text-amber-400';
    case 'approved': return 'text-emerald-400';
    case 'released': return 'text-blue-400';
    case 'archived': return 'text-zinc-500';
    default: return 'text-zinc-400';
  }
}

export function getDocumentTypeIcon(type: Document['type']): string {
  switch (type) {
    case 'proposal': return '📄';
    case 'sow': return '📋';
    case 'report': return '📊';
    case 'deliverable': return '📦';
    case 'sop': return '📖';
    case 'evidence': return '🔍';
    default: return '📄';
  }
}

export function formatFileSize(bytes?: number): string {
  if (!bytes) return '-';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function canTransitionDocumentStatus(
  currentStatus: Document['status'], 
  newStatus: Document['status']
): boolean {
  const transitions: Record<Document['status'], Document['status'][]> = {
    draft: ['in_review', 'archived'],
    in_review: ['draft', 'approved', 'archived'],
    approved: ['released', 'archived'],
    released: ['archived'],
    archived: [],
  };
  
  return transitions[currentStatus]?.includes(newStatus) || false;
}
