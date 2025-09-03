// Generated types placeholder. Use `npm run gen:api` or Orval to regenerate.
export type PageMeta = { page?: number; limit?: number; total?: number };
export type TaskPack = { pack_id: number; pack_code: string; pack_name: string; description?: string | null; status_scope?: 'active'|'prospect'|null; is_active?: boolean; effective_from_utc?: string | null; effective_to_utc?: string | null };
export type PackTask = { task_id: number; pack_id: number; name: string; sort_order: number; due_days: number; status_scope?: 'active'|'prospect'|null; is_active?: boolean };
export type Industry = { industry_id: number; name: string; description?: string | null; is_active?: boolean };
export type ClientIndustry = { client_id: number; industry_id: number; is_primary?: boolean };
