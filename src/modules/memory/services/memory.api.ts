/**
 * Memory Layer API Client
 * Core API integration following FlowLedger patterns
 */

import { toast } from '../../../lib/toast.ts';
import { http } from '../../../services/client.ts';
import type { 
  MemoryCard, 
  MemoryAtom, 
  CreateMemoryAtom, 
  MemorySearchResult, 
  MemoryFilters,
  MemoryRedaction
} from './memory.types.ts';

export type MemoryApiEnvelope<T> = { 
  status: string; 
  data: T; 
  meta?: { 
    relevance_score?: number;
    last_updated?: string;
    atom_count?: number;
    total?: number;
  };
};

function withErrors<T>(fn: () => Promise<T>, errMsg = 'Memory request failed'): Promise<T> {
  return fn().catch((e: any) => {
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
          } catch {
            msg = String(e.message || errMsg);
          }
        } else if (e?.message && typeof e.message === 'string') {
          msg = e.message;
        }
      }
    } catch {
      msg = errMsg;
    }
    
    toast.error(msg);
    e.normalizedMessage = msg;
    throw e;
  });
}

export const memoryApi = {
  /**
   * Get memory card for an entity
   */
  getCard: async (
    entityType: 'pursuit' | 'candidate' | 'engagement' | 'comms_thread', 
    entityId: number,
    orgId: number = 1 // Default org_id, should come from auth context
  ): Promise<MemoryCard> => {
    const params = new URLSearchParams({
      org_id: orgId.toString(),
      entity_type: entityType,
      entity_id: entityId.toString()
    });
    
    return withErrors(
      () => http.get<MemoryCard>(`/memory/card?${params}`),
      'Failed to load memory card'
    );
  },

  /**
   * Create a new memory atom
   */
  addAtom: async (
    atom: CreateMemoryAtom,
    orgId: number = 1
  ): Promise<{ message: string }> => {
    const params = new URLSearchParams({
      org_id: orgId.toString()
    });
    
    return withErrors(
      () => http.post<{ message: string }>(`/memory/atoms?${params}`, atom),
      'Failed to create memory atom'
    );
  },

  /**
   * Redact or correct a memory atom
   */
  redactAtom: async (
    redaction: MemoryRedaction,
    orgId: number = 1
  ): Promise<{ message: string }> => {
    const params = new URLSearchParams({
      org_id: orgId.toString()
    });
    
    return withErrors(
      () => http.post<{ message: string }>(`/memory/redactions?${params}`, redaction),
      'Failed to redact memory atom'
    );
  }
};
