import { http } from '../../services/client.ts';
import type { ApiEnvelope } from '../../services/api.ts';
import type { TaskPack, PackTask, Industry, ClientIndustry, PageMeta } from './types.ts';

// Minimal typed endpoints used by hooks. Replace with full codegen when available.

export const api = {
  // Task Packs
  listTaskPacks: (params: { page?: number; page_size?: number; q?: string; status_scope?: 'active'|'prospect'|'any'; include_inactive?: 0|1 } = {}) =>
    http.get<ApiEnvelope<TaskPack[]>>(`/task-packs${query(params)}`),
  getTaskPack: (packId: number) => http.get<ApiEnvelope<TaskPack>>(`/task-packs/${packId}`),
  createTaskPack: (body: Partial<TaskPack>) => http.post<ApiEnvelope<TaskPack>>(`/task-packs`, body),
  updateTaskPack: (packId: number, body: Partial<TaskPack>) => http.put<ApiEnvelope<TaskPack>>(`/task-packs/${packId}`, body),
  toggleTaskPackActive: (packId: number, is_active: boolean) => http.put<ApiEnvelope<TaskPack>>(`/task-packs/${packId}`, { is_active }),
  deleteTaskPack: (packId: number) => http.del<ApiEnvelope<{ deleted?: number }>>(`/task-packs/${packId}`),
  // Pack Tasks
  listPackTasks: (packId: number, params: { page?: number; page_size?: number } = {}) => http.get<ApiEnvelope<PackTask[]>>(`/task-packs/${packId}/tasks${query(params)}`),
  createPackTask: (packId: number, body: Partial<PackTask>) => http.post<ApiEnvelope<PackTask>>(`/task-packs/${packId}/tasks`, body),
  updatePackTask: (packId: number, taskId: number, body: Partial<PackTask>) => http.put<ApiEnvelope<PackTask>>(`/task-packs/${packId}/tasks/${taskId}`, body),
  togglePackTaskActive: (packId: number, taskId: number, is_active: boolean) => http.put<ApiEnvelope<PackTask>>(`/task-packs/${packId}/tasks/${taskId}`, { is_active }),
  deletePackTask: (packId: number, taskId: number) => http.del<ApiEnvelope<{ deleted?: number }>>(`/task-packs/${packId}/tasks/${taskId}`),

  // Industries (optionally separate base)
  listIndustries: (params: { page?: number; page_size?: number; q?: string; include_inactive?: 0|1 } = {}) => http.get<ApiEnvelope<Industry[]>>(`/industries${query(params)}`),
  getIndustry: (industryId: number) => http.get<ApiEnvelope<Industry>>(`/industries/${industryId}`),
  createIndustry: (body: Partial<Industry>) => http.post<ApiEnvelope<Industry>>(`/industries`, body),
  updateIndustry: (industryId: number, body: Partial<Industry>) => http.put<ApiEnvelope<Industry>>(`/industries/${industryId}`, body),
  deleteIndustry: (industryId: number) => http.del<ApiEnvelope<{ deleted?: number }>>(`/industries/${industryId}`),

  // Client ↔ Industries
  listClientIndustries: (clientId: number) => http.get<ApiEnvelope<ClientIndustry[]>>(`/clients/${clientId}/industries`),
  addClientIndustry: (clientId: number, body: { industry_id: number; is_primary?: boolean }) => http.post<ApiEnvelope<ClientIndustry>>(`/clients/${clientId}/industries`, body),
  updateClientIndustry: (clientId: number, industryId: number, body: { is_primary: boolean }) => http.put<ApiEnvelope<ClientIndustry>>(`/clients/${clientId}/industries/${industryId}`, body),
  removeClientIndustry: (clientId: number, industryId: number) => http.del<ApiEnvelope<{ deleted?: number }>>(`/clients/${clientId}/industries/${industryId}`),
};

function query(params: Record<string, any> = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}
