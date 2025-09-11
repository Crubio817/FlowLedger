/**
 * Core Memory Layer Types
 * Foundational types for the FlowLedger Memory System
 */

export interface MemoryAtom {
  atom_id?: number;
  atom_type: 'decision' | 'risk' | 'preference' | 'status' | 'note';
  content: string;
  source: {
    system: string;
    origin_id: string;
    url?: string;
  };
  occurred_at: string; // ISO date string
  score?: number;
  source_url?: string;
  tags?: string[];
  is_active?: boolean;
}

export interface MemoryCard {
  summary: {
    key_facts: string[];
    recent_activity: string[];
    decisions: string[];
  };
  top_atoms: MemoryAtom[];
  last_built_at: string | null;
  etag: string;
  empty: boolean;
}

export interface MemorySearchResult {
  atoms: MemoryAtom[];
  totalResults: number;
  facets: {
    entityTypes: Record<string, number>;
    atomTypes: Record<string, number>;
    tags: Record<string, number>;
    sources: Record<string, number>;
  };
}

export interface MemoryFilters {
  entity_type?: 'pursuit' | 'candidate' | 'engagement' | 'comms_thread';
  entity_id?: number;
  atom_types?: string[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  source?: string;
}

export interface CreateMemoryAtom {
  entity_type: 'pursuit' | 'candidate' | 'engagement' | 'comms_thread';
  entity_id: number;
  atom_type: MemoryAtom['atom_type'];
  content: string;
  source: {
    system: string;
    origin_id: string;
    url?: string;
  };
  occurred_at?: string;
  tags?: string[];
}

export interface MemoryCapture {
  trigger: string;
  entity_type: 'pursuit' | 'candidate' | 'engagement' | 'comms_thread';
  entity_id: number;
  content: string;
  atom_type: MemoryAtom['atom_type'];
  metadata?: Record<string, any>;
}

// Memory-enabled entity interface that modules can implement
export interface MemoryEnabledEntity {
  getMemoryEntityType(): 'pursuit' | 'candidate' | 'engagement' | 'comms_thread';
  getMemoryEntityId(): number;
  getMemoryDisplayName(): string;
}

// Hook for triggering memory capture from other modules
export interface MemoryTrigger {
  event: string;
  entity_type: 'pursuit' | 'candidate' | 'engagement' | 'comms_thread';
  entity_id: number;
  automaticCapture?: boolean;
  suggestionText?: string;
}

// Redaction types to match backend
export interface MemoryRedaction {
  atom_id: number;
  action: 'redact' | 'correct';
  reason: string;
  correction_content?: string;
}
