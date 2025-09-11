/**
 * Memory Module Main Export
 * Provides clean API for other modules to integrate memory functionality
 */

// Core components
export { default as MemoryCard } from './components/MemoryCard.tsx';

// Hooks - simplified to match backend API
export { 
  useMemoryCard,
  useAddMemoryAtom,
  useRedactMemoryAtom,
  useMemoryCapture
} from './hooks/useMemory.ts';

// Types
export type {
  MemoryAtom,
  MemoryCard as MemoryCardType,
  MemoryFilters,
  CreateMemoryAtom,
  MemoryCapture,
  MemoryEnabledEntity,
  MemoryTrigger,
  MemoryRedaction
} from './services/memory.types.ts';

// API
export { memoryApi } from './services/memory.api.ts';

// Helper utilities for other modules
export const createMemoryTrigger = (
  event: string,
  entityType: 'pursuit' | 'candidate' | 'engagement' | 'comms_thread',
  entityId: number,
  suggestionText?: string
) => ({
  event,
  entityType,
  entityId,
  automaticCapture: false,
  suggestionText
});

export const memoryEntityHelper = {
  // Helper to make any object memory-enabled
  makeMemoryEnabled: (
    entityType: 'pursuit' | 'candidate' | 'engagement' | 'comms_thread',
    entityId: number,
    displayName: string
  ) => ({
    getMemoryEntityType: () => entityType,
    getMemoryEntityId: () => entityId,
    getMemoryDisplayName: () => displayName
  })
};
