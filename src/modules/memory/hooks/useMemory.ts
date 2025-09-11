/**
 * Memory Layer React Query Hooks
 * Simplified to match actual backend API endpoints
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memoryApi } from '../services/memory.api.ts';
import type { 
  MemoryCard, 
  MemoryAtom, 
  CreateMemoryAtom, 
  MemoryRedaction
} from '../services/memory.types.ts';

// Query key factory
export const memoryKeys = {
  all: ['memory'] as const,
  cards: () => [...memoryKeys.all, 'cards'] as const,
  card: (entityType: string, entityId: number) => 
    [...memoryKeys.cards(), entityType, entityId] as const,
};

/**
 * Get memory card for an entity
 */
export const useMemoryCard = (
  entityType: 'pursuit' | 'candidate' | 'engagement' | 'comms_thread', 
  entityId: number,
  orgId: number = 1
) => {
  return useQuery({
    queryKey: memoryKeys.card(entityType, entityId),
    queryFn: () => memoryApi.getCard(entityType, entityId, orgId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!(entityType && entityId),
  });
};

/**
 * Add memory atom mutation
 */
export const useAddMemoryAtom = (orgId: number = 1) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (atom: CreateMemoryAtom) => memoryApi.addAtom(atom, orgId),
    onSuccess: (newAtom, variables) => {
      // Invalidate and refetch memory card
      queryClient.invalidateQueries({
        queryKey: memoryKeys.card(variables.entity_type, variables.entity_id)
      });
    },
  });
};

/**
 * Redact memory atom mutation
 */
export const useRedactMemoryAtom = (orgId: number = 1) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (redaction: MemoryRedaction) => memoryApi.redactAtom(redaction, orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: memoryKeys.all
      });
    },
  });
};

/**
 * Hook for memory capture - simplified interface for other modules
 */
export const useMemoryCapture = (orgId: number = 1) => {
  const addAtom = useAddMemoryAtom(orgId);
  
  const captureMemory = (
    entityType: 'pursuit' | 'candidate' | 'engagement' | 'comms_thread',
    entityId: number,
    content: string,
    atomType: MemoryAtom['atom_type'] = 'note',
    tags: string[] = []
  ) => {
    return addAtom.mutate({
      entity_type: entityType,
      entity_id: entityId,
      atom_type: atomType,
      content,
      source: {
        system: 'flowledger',
        origin_id: `manual-${Date.now()}`,
      },
      occurred_at: new Date().toISOString(),
      tags
    });
  };
  
  return {
    captureMemory,
    isLoading: addAtom.isPending,
    error: addAtom.error,
  };
};
