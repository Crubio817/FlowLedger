// Spotlight Module v1.0 - API Service Layer
// HTTP client for Ideal Customer Profile (ICP) management

import { http } from '../../../services/client.ts';
import { toast } from 'react-hot-toast';
import type {
  Spotlight,
  SpotlightField,
  SpotlightListResponse,
  SpotlightDetailResponse,
  CreateSpotlightRequest,
  UpdateSpotlightRequest,
  SpotlightEvaluationRequest,
  SpotlightEvaluationResult,
  CloneSpotlightRequest,
  SpotlightFilters,
  SpotlightFieldFilters,
  SpotlightPerformanceMetrics,
} from './spotlight.types.ts';

// ================================
// Error Handling Wrapper
// ================================

function withErrors<T>(fn: () => Promise<T>, errMsg = 'Request failed'): Promise<T> {
  return fn().catch((e: any) => {
    let message = errMsg;
    
    // Extract meaningful error messages
    if (e?.response?.data?.error?.message) {
      message = e.response.data.error.message;
    } else if (e?.message) {
      message = e.message;
    } else if (typeof e === 'string') {
      message = e;
    }
    
    // Show user-friendly error notification
    toast.error(message);
    throw e;
  });
}

// ================================
// Spotlight Management API
// ================================

/**
 * List spotlights with optional filtering
 */
export async function getSpotlights(filters: SpotlightFilters): Promise<SpotlightListResponse> {
  const params = new URLSearchParams();
  
  // Required parameter
  params.append('org_id', String(filters.org_id));
  
  // Optional filters
  if (filters.domain) params.append('domain', filters.domain);
  if (filters.active !== undefined) params.append('active', String(filters.active));
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));

  return withErrors(
    () => http.get<SpotlightListResponse>(`/spotlights?${params.toString()}`),
    'Failed to load spotlights'
  );
}

/**
 * Get spotlight details with fields and values
 */
export async function getSpotlight(spotlightId: number, orgId: number): Promise<SpotlightDetailResponse> {
  return withErrors(
    () => http.get<SpotlightDetailResponse>(`/spotlights/${spotlightId}?org_id=${orgId}`),
    'Failed to load spotlight details'
  );
}

/**
 * Create a new spotlight profile
 */
export async function createSpotlight(data: CreateSpotlightRequest): Promise<Spotlight> {
  return withErrors(
    () => http.post<Spotlight>('/spotlights', data),
    'Failed to create spotlight'
  );
}

/**
 * Update existing spotlight profile and field values
 */
export async function updateSpotlight(
  spotlightId: number, 
  data: UpdateSpotlightRequest
): Promise<{ message: string }> {
  if (!spotlightId || isNaN(spotlightId)) {
    throw new Error(`Invalid spotlightId: ${spotlightId}`);
  }
  
  return withErrors(
    () => http.put<{ message: string }>(`/spotlights/${spotlightId}`, data),
    'Failed to update spotlight'
  );
}

/**
 * Delete a spotlight profile
 */
export async function deleteSpotlight(spotlightId: number, orgId: number): Promise<{ message: string }> {
  return withErrors(
    () => http.del<{ message: string }>(`/spotlights/${spotlightId}?org_id=${orgId}`),
    'Failed to delete spotlight'
  );
}

/**
 * Clone an existing spotlight profile
 */
export async function cloneSpotlight(
  spotlightId: number, 
  data: CloneSpotlightRequest
): Promise<Spotlight> {
  return withErrors(
    () => http.post<Spotlight>(`/spotlights/${spotlightId}/clone`, data),
    'Failed to clone spotlight'
  );
}

// ================================
// Field Management API
// ================================

/**
 * Get available fields for a domain
 */
export async function getSpotlightFields(filters: SpotlightFieldFilters): Promise<SpotlightField[]> {
  const params = new URLSearchParams();
  params.append('org_id', String(filters.org_id));
  if (filters.domain) params.append('domain', filters.domain);
  if (filters.field_type) params.append('field_type', filters.field_type);

  return withErrors(
    async () => {
      const response = await http.get<{ status: string; data: SpotlightField[] }>(`/spotlights/fields?${params.toString()}`);
      // Handle both envelope and direct array responses
      if (Array.isArray(response)) {
        return response;
      }
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      // Fallback for unexpected response format
      console.warn('Unexpected response format from spotlights/fields:', response);
      return [];
    },
    'Failed to load spotlight fields'
  );
}

/**
 * Create a new field definition for a domain
 */
export async function createSpotlightField(field: Omit<SpotlightField, 'field_id' | 'created_at' | 'row_version'>): Promise<SpotlightField> {
  return withErrors(
  () => http.post<SpotlightField>('/spotlights/fields', field),
    'Failed to create spotlight field'
  );
}

/**
 * Update field definition
 */
export async function updateSpotlightField(
  fieldId: number, 
  data: Partial<SpotlightField>
): Promise<SpotlightField> {
  return withErrors(
  () => http.put<SpotlightField>(`/spotlights/fields/${fieldId}`, data),
    'Failed to update spotlight field'
  );
}

/**
 * Delete a field definition (will also remove all values)
 */
export async function deleteSpotlightField(fieldId: number, orgId: number): Promise<{ message: string }> {
  return withErrors(
  () => http.del<{ message: string }>(`/spotlights/fields/${fieldId}?org_id=${orgId}`),
    'Failed to delete spotlight field'
  );
}

// ================================
// Evaluation API
// ================================

/**
 * Evaluate signal data against a spotlight profile
 */
export async function evaluateSpotlight(
  spotlightId: number,
  data: SpotlightEvaluationRequest
): Promise<SpotlightEvaluationResult> {
  return withErrors(
    () => http.post<SpotlightEvaluationResult>(`/spotlights/${spotlightId}/evaluate`, data),
    'Failed to evaluate signal against spotlight'
  );
}

/**
 * Evaluate signal against all active spotlights for a domain
 */
export async function evaluateSignalAgainstAllSpotlights(
  orgId: number,
  domain: string,
  signalData: Record<string, any>
): Promise<Array<{ spotlight: Spotlight; evaluation: SpotlightEvaluationResult }>> {
  return withErrors(
    () => http.post<Array<{ spotlight: Spotlight; evaluation: SpotlightEvaluationResult }>>(
      '/spotlights/evaluate-batch',
      { org_id: orgId, domain, signal_data: signalData }
    ),
    'Failed to evaluate signal against spotlights'
  );
}

/**
 * Get historical evaluations for a spotlight
 */
export async function getSpotlightEvaluations(
  spotlightId: number,
  orgId: number,
  limit = 50
): Promise<Array<{
  evaluation_id: number;
  signal_id?: number;
  match_score: number;
  recommendation: string;
  evaluated_at: string;
}>> {
  return withErrors(
    () => http.get<Array<any>>(`/spotlights/${spotlightId}/evaluations?org_id=${orgId}&limit=${limit}`),
    'Failed to load spotlight evaluations'
  );
}

// ================================
// Analytics API
// ================================

/**
 * Get spotlight performance metrics
 */
export async function getSpotlightAnalytics(orgId: number): Promise<SpotlightPerformanceMetrics> {
  return withErrors(
    () => http.get<SpotlightPerformanceMetrics>(`/spotlights/analytics?org_id=${orgId}`),
    'Failed to load spotlight analytics'
  );
}

/**
 * Get performance data for a specific spotlight
 */
export async function getSpotlightPerformance(spotlightId: number, orgId: number): Promise<{
  evaluation_count: number;
  avg_match_score: number;
  match_distribution: Record<string, number>;
  recent_evaluations: Array<{
    date: string;
    count: number;
    avg_score: number;
  }>;
}> {
  return withErrors(
    () => http.get(`/spotlights/${spotlightId}/performance?org_id=${orgId}`),
    'Failed to load spotlight performance data'
  );
}

// ================================
// Integration Helpers
// ================================

/**
 * Get matching spotlights for a signal
 */
export async function getSignalSpotlightMatches(
  signalId: number,
  orgId: number
): Promise<Array<{
  spotlight: Spotlight;
  match_score: number;
  recommendation: string;
}>> {
  return withErrors(
    () => http.get(`/signals/${signalId}/spotlight-matches?org_id=${orgId}`),
    'Failed to load signal spotlight matches'
  );
}

/**
 * Associate a candidate with a spotlight
 */
export async function associateCandidateWithSpotlight(
  candidateId: number,
  spotlightId: number,
  orgId: number,
  notes?: string
): Promise<{ message: string }> {
  return withErrors(
    () => http.post(`/candidates/${candidateId}/spotlight-association`, {
      org_id: orgId,
      spotlight_id: spotlightId,
      notes,
    }),
    'Failed to associate candidate with spotlight'
  );
}

/**
 * Get spotlights associated with a candidate
 */
export async function getCandidateSpotlights(
  candidateId: number,
  orgId: number
): Promise<Array<{
  spotlight: Spotlight;
  confidence_score: number;
  associated_at: string;
  notes?: string;
}>> {
  return withErrors(
    () => http.get(`/candidates/${candidateId}/spotlights?org_id=${orgId}`),
    'Failed to load candidate spotlights'
  );
}

// ================================
// Utility Functions
// ================================

/**
 * Test if signal data matches spotlight criteria
 */
export function testSpotlightMatch(
  signalData: Record<string, any>,
  spotlight: Spotlight
): {
  score: number;
  matches: Array<{ field: string; matched: boolean; reason: string }>;
} {
  if (!spotlight.fields || spotlight.fields.length === 0) {
    return { score: 0, matches: [] };
  }

  let matched = 0;
  const matches: Array<{ field: string; matched: boolean; reason: string }> = [];

  for (const field of spotlight.fields) {
    if (!field.value) continue; // Skip fields without values set

    const signalValue = signalData[field.field_name];
    const spotlightValue = field.value;
    let isMatch = false;
    let reason = '';

    if (!signalValue) {
      reason = 'No signal data for this field';
    } else {
      switch (field.field_type) {
        case 'text':
          isMatch = String(signalValue).toLowerCase().includes(String(spotlightValue).toLowerCase());
          reason = isMatch ? 'Text contains expected value' : 'Text does not contain expected value';
          break;
        case 'number':
          isMatch = Number(signalValue) === Number(spotlightValue);
          reason = isMatch ? 'Numbers match exactly' : 'Numbers do not match';
          break;
        case 'boolean':
          isMatch = Boolean(signalValue) === Boolean(spotlightValue);
          reason = isMatch ? 'Boolean values match' : 'Boolean values do not match';
          break;
        case 'enum':
          isMatch = String(signalValue) === String(spotlightValue);
          reason = isMatch ? 'Enum values match' : 'Enum values do not match';
          break;
        case 'date':
          const signalDate = new Date(signalValue).getTime();
          const spotlightDate = new Date(spotlightValue).getTime();
          isMatch = signalDate === spotlightDate;
          reason = isMatch ? 'Dates match' : 'Dates do not match';
          break;
        default:
          reason = 'Unknown field type';
      }
    }

    if (isMatch) matched++;
    matches.push({
      field: field.field_name,
      matched: isMatch,
      reason,
    });
  }

  const score = spotlight.fields.length > 0 ? matched / spotlight.fields.length : 0;
  return { score, matches };
}

/**
 * Get domains available for spotlights
 */
export async function getAvailableDomains(orgId: number): Promise<string[]> {
  return withErrors(
    async () => {
      const response = await http.get<string[] | { data: string[] }>(`/spotlights/domains?org_id=${orgId}`);
      
      // Handle both direct array response and envelope response
      if (Array.isArray(response)) {
        return response;
      } else if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('Unexpected response format from spotlights/domains:', response);
        return [];
      }
    },
    'Failed to load available domains'
  );
}

/**
 * Get unique domains for autocomplete suggestions
 */
export async function getSpotlightDomains(orgId: number): Promise<string[]> {
  return withErrors(
    async () => {
      const response = await http.get<string[] | { data: string[] }>(`/spotlights/domains?org_id=${orgId}`);
      
      // Handle both direct array response and envelope response
      if (Array.isArray(response)) {
        return response;
      } else if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('getSpotlightDomains: Unexpected response format:', response);
        return [];
      }
    },
    'Failed to load spotlight domains'
  );
}
