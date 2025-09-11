// Spotlight Module v1.0 - React Query Hooks
// Custom hooks for Ideal Customer Profile (ICP) management

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as spotlightApi from '../services/spotlight.api.ts';
import type {
  Spotlight,
  SpotlightField,
  SpotlightFilters,
  SpotlightFieldFilters,
  CreateSpotlightRequest,
  UpdateSpotlightRequest,
  SpotlightEvaluationRequest,
  CloneSpotlightRequest,
  SpotlightPerformanceMetrics,
} from '../services/spotlight.types.ts';

// ================================
// Query Keys
// ================================

export const spotlightKeys = {
  all: ['spotlights'] as const,
  lists: () => [...spotlightKeys.all, 'list'] as const,
  list: (filters: SpotlightFilters) => [...spotlightKeys.lists(), filters] as const,
  details: () => [...spotlightKeys.all, 'detail'] as const,
  detail: (id: number, orgId: number) => [...spotlightKeys.details(), id, orgId] as const,
  fields: () => [...spotlightKeys.all, 'fields'] as const,
  fieldsList: (filters: SpotlightFieldFilters) => [...spotlightKeys.fields(), filters] as const,
  analytics: (orgId: number) => [...spotlightKeys.all, 'analytics', orgId] as const,
  performance: (id: number, orgId: number) => [...spotlightKeys.all, 'performance', id, orgId] as const,
  evaluations: (id: number, orgId: number) => [...spotlightKeys.all, 'evaluations', id, orgId] as const,
} as const;

// ================================
// Spotlight Management Hooks
// ================================

/**
 * Hook to fetch spotlights list with filtering
 */
export function useSpotlights(filters: SpotlightFilters) {
  return useQuery({
    queryKey: spotlightKeys.list(filters),
    queryFn: () => spotlightApi.getSpotlights(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!filters.org_id,
  });
}

/**
 * Hook to fetch spotlight details with fields and values
 */
export function useSpotlight(spotlightId: number, orgId: number) {
  return useQuery({
    queryKey: spotlightKeys.detail(spotlightId, orgId),
    queryFn: () => spotlightApi.getSpotlight(spotlightId, orgId),
    staleTime: 5 * 60 * 1000,
    enabled: !!spotlightId && !!orgId,
  });
}

/**
 * Hook to create a new spotlight
 */
export function useCreateSpotlight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSpotlightRequest) => spotlightApi.createSpotlight(data),
    onSuccess: (newSpotlight) => {
      // Invalidate and refetch spotlights list
      queryClient.invalidateQueries({ queryKey: spotlightKeys.lists() });
      
      // Add the new spotlight to cache
      queryClient.setQueryData(
        spotlightKeys.detail(newSpotlight.spotlight_id, newSpotlight.org_id),
        { status: 'ok', data: newSpotlight }
      );
    },
  });
}

/**
 * Hook to update spotlight profile and field values
 */
export function useUpdateSpotlight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ spotlightId, data }: { spotlightId: number; data: UpdateSpotlightRequest }) =>
      spotlightApi.updateSpotlight(spotlightId, data),
    onSuccess: (_, { spotlightId, data }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: spotlightKeys.detail(spotlightId, data.org_id) });
      queryClient.invalidateQueries({ queryKey: spotlightKeys.lists() });
    },
  });
}

/**
 * Hook to delete a spotlight
 */
export function useDeleteSpotlight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ spotlightId, orgId }: { spotlightId: number; orgId: number }) =>
      spotlightApi.deleteSpotlight(spotlightId, orgId),
    onSuccess: (_, { spotlightId, orgId }) => {
      // Remove from cache and invalidate lists
      queryClient.removeQueries({ queryKey: spotlightKeys.detail(spotlightId, orgId) });
      queryClient.invalidateQueries({ queryKey: spotlightKeys.lists() });
    },
  });
}

/**
 * Hook to clone a spotlight
 */
export function useCloneSpotlight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ spotlightId, data }: { spotlightId: number; data: CloneSpotlightRequest }) =>
      spotlightApi.cloneSpotlight(spotlightId, data),
    onSuccess: (clonedSpotlight) => {
      // Invalidate lists and add cloned spotlight to cache
      queryClient.invalidateQueries({ queryKey: spotlightKeys.lists() });
      queryClient.setQueryData(
        spotlightKeys.detail(clonedSpotlight.spotlight_id, clonedSpotlight.org_id),
        { status: 'ok', data: clonedSpotlight }
      );
    },
  });
}

// ================================
// Field Management Hooks
// ================================

/**
 * Hook to fetch available fields for a domain
 */
export function useSpotlightFields(filters: SpotlightFieldFilters) {
  return useQuery({
    queryKey: spotlightKeys.fieldsList(filters),
    queryFn: () => spotlightApi.getSpotlightFields(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes - fields change less frequently
    enabled: !!filters.org_id,
  });
}

/**
 * Hook to create a new field definition
 */
export function useCreateSpotlightField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (field: Omit<SpotlightField, 'field_id' | 'created_at' | 'row_version'>) =>
      spotlightApi.createSpotlightField(field),
    onSuccess: (newField) => {
      // Invalidate fields list for the domain
      queryClient.invalidateQueries({ queryKey: spotlightKeys.fields() });
    },
  });
}

/**
 * Hook to update field definition
 */
export function useUpdateSpotlightField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fieldId, data }: { fieldId: number; data: Partial<SpotlightField> }) =>
      spotlightApi.updateSpotlightField(fieldId, data),
    onSuccess: () => {
      // Invalidate all field-related queries
      queryClient.invalidateQueries({ queryKey: spotlightKeys.fields() });
      queryClient.invalidateQueries({ queryKey: spotlightKeys.details() });
    },
  });
}

/**
 * Hook to delete a field definition
 */
export function useDeleteSpotlightField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fieldId, orgId }: { fieldId: number; orgId: number }) =>
      spotlightApi.deleteSpotlightField(fieldId, orgId),
    onSuccess: () => {
      // Invalidate field and spotlight queries since field values will be removed
      queryClient.invalidateQueries({ queryKey: spotlightKeys.fields() });
      queryClient.invalidateQueries({ queryKey: spotlightKeys.details() });
    },
  });
}

// ================================
// Evaluation Hooks
// ================================

/**
 * Hook to evaluate signal against a spotlight
 */
export function useEvaluateSpotlight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ spotlightId, data }: { spotlightId: number; data: SpotlightEvaluationRequest }) =>
      spotlightApi.evaluateSpotlight(spotlightId, data),
    onSuccess: (_, { spotlightId, data }) => {
      // Invalidate evaluation history
      queryClient.invalidateQueries({ queryKey: spotlightKeys.evaluations(spotlightId, data.org_id) });
      queryClient.invalidateQueries({ queryKey: spotlightKeys.analytics(data.org_id) });
    },
  });
}

/**
 * Hook to evaluate signal against all spotlights in a domain
 */
export function useEvaluateSignalAgainstAllSpotlights() {
  return useMutation({
    mutationFn: ({ orgId, domain, signalData }: { 
      orgId: number; 
      domain: string; 
      signalData: Record<string, any> 
    }) => spotlightApi.evaluateSignalAgainstAllSpotlights(orgId, domain, signalData),
  });
}

/**
 * Hook to fetch evaluation history for a spotlight
 */
export function useSpotlightEvaluations(spotlightId: number, orgId: number, limit = 50) {
  return useQuery({
    queryKey: spotlightKeys.evaluations(spotlightId, orgId),
    queryFn: () => spotlightApi.getSpotlightEvaluations(spotlightId, orgId, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!spotlightId && !!orgId,
  });
}

// ================================
// Analytics Hooks
// ================================

/**
 * Hook to fetch spotlight analytics dashboard data
 */
export function useSpotlightAnalytics(orgId: number) {
  return useQuery({
    queryKey: spotlightKeys.analytics(orgId),
    queryFn: () => spotlightApi.getSpotlightAnalytics(orgId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!orgId,
  });
}

/**
 * Hook to fetch performance data for a specific spotlight
 */
export function useSpotlightPerformance(spotlightId: number, orgId: number) {
  return useQuery({
    queryKey: spotlightKeys.performance(spotlightId, orgId),
    queryFn: () => spotlightApi.getSpotlightPerformance(spotlightId, orgId),
    staleTime: 5 * 60 * 1000,
    enabled: !!spotlightId && !!orgId,
  });
}

// ================================
// Integration Hooks
// ================================

/**
 * Hook to get spotlight matches for a signal
 */
export function useSignalSpotlightMatches(signalId: number, orgId: number) {
  return useQuery({
    queryKey: [...spotlightKeys.all, 'signal-matches', signalId, orgId],
    queryFn: () => spotlightApi.getSignalSpotlightMatches(signalId, orgId),
    staleTime: 2 * 60 * 1000,
    enabled: !!signalId && !!orgId,
  });
}

/**
 * Hook to associate candidate with spotlight
 */
export function useAssociateCandidateWithSpotlight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      candidateId, 
      spotlightId, 
      orgId, 
      notes 
    }: { 
      candidateId: number; 
      spotlightId: number; 
      orgId: number; 
      notes?: string 
    }) => spotlightApi.associateCandidateWithSpotlight(candidateId, spotlightId, orgId, notes),
    onSuccess: (_, { candidateId, orgId }) => {
      // Invalidate candidate spotlight associations
      queryClient.invalidateQueries({ 
        queryKey: [...spotlightKeys.all, 'candidate-spotlights', candidateId, orgId] 
      });
    },
  });
}

/**
 * Hook to get spotlights associated with a candidate
 */
export function useCandidateSpotlights(candidateId: number, orgId: number) {
  return useQuery({
    queryKey: [...spotlightKeys.all, 'candidate-spotlights', candidateId, orgId],
    queryFn: () => spotlightApi.getCandidateSpotlights(candidateId, orgId),
    staleTime: 5 * 60 * 1000,
    enabled: !!candidateId && !!orgId,
  });
}

// ================================
// Utility Hooks
// ================================

/**
 * Hook to get available domains
 */
export function useAvailableDomains(orgId: number) {
  return useQuery({
    queryKey: [...spotlightKeys.all, 'domains', orgId],
    queryFn: () => spotlightApi.getAvailableDomains(orgId),
    staleTime: 30 * 60 * 1000, // 30 minutes - domains rarely change
    enabled: !!orgId,
  });
}

/**
 * Hook to get spotlight domains for autocomplete
 */
export function useSpotlightDomains(orgId: number) {
  return useQuery({
    queryKey: [...spotlightKeys.all, 'spotlight-domains', orgId],
    queryFn: () => spotlightApi.getSpotlightDomains(orgId),
    staleTime: 30 * 60 * 1000, // 30 minutes - domains rarely change
    enabled: !!orgId,
  });
}

/**
 * Hook for optimistic spotlight updates
 */
export function useOptimisticSpotlightUpdate(spotlightId: number, orgId: number) {
  const queryClient = useQueryClient();

  const updateOptimistically = (updates: Partial<Spotlight>) => {
    const queryKey = spotlightKeys.detail(spotlightId, orgId);
    
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old?.data) return old;
      return {
        ...old,
        data: {
          ...old.data,
          ...updates,
          updated_at: new Date().toISOString(),
        },
      };
    });
  };

  const revertOptimistic = () => {
    queryClient.invalidateQueries({ queryKey: spotlightKeys.detail(spotlightId, orgId) });
  };

  return { updateOptimistically, revertOptimistic };
}
