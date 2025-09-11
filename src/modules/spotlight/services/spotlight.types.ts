// Spotlight Module v1.0 - TypeScript Types
// Comprehensive type definitions for Ideal Customer Profile (ICP) management

import { z } from 'zod';

// ================================
// Core Entity Types
// ================================

export interface Spotlight {
  spotlight_id: number;
  org_id: number;
  name: string;
  domain: string;
  description?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  row_version?: string;
  field_count?: number; // Populated in list views
  fields?: SpotlightField[]; // Populated in detail views
}

export interface SpotlightField {
  field_id: number;
  org_id: number;
  domain: string;
  field_name: string;
  field_type: 'text' | 'number' | 'boolean' | 'enum' | 'date';
  is_required: boolean;
  display_order: number;
  enum_values?: string[] | null;
  created_at: string;
  row_version?: string;
  value?: any; // Field value for specific spotlight instance
  rules?: SpotlightRule[]; // Conditional visibility rules
}

export interface SpotlightValue {
  value_id: number;
  org_id: number;
  spotlight_id: number;
  field_id: number;
  field_value?: string;
  created_at: string;
  updated_at: string;
  row_version?: string;
}

export interface SpotlightRule {
  rule_id: number;
  org_id: number;
  field_id: number;
  condition_field_id: number;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'contains';
  condition_value: string;
  created_at: string;
  row_version?: string;
}

// ================================
// API Request/Response Types
// ================================

export interface CreateSpotlightRequest {
  org_id: number;
  name: string;
  domain: string;
  description?: string;
}

export interface UpdateSpotlightRequest {
  org_id: number;
  name?: string;
  domain?: string;
  description?: string;
  active?: boolean;
  field_values?: Record<string, any>; // field_id -> value mapping
}

export interface SpotlightListResponse {
  status: 'ok';
  data: Spotlight[];
  meta: {
    page: number;
    limit: number;
    total?: number;
  };
}

export interface SpotlightDetailResponse {
  status: 'ok';
  data: Spotlight;
}

export interface SpotlightEvaluationRequest {
  org_id: number;
  signal_data: Record<string, any>; // Dynamic signal properties
}

export interface SpotlightEvaluationResult {
  match_score: number; // 0.0 - 1.0
  matched_fields: number;
  total_fields: number;
  recommendation: 'high_match' | 'medium_match' | 'low_match' | 'no_match';
  field_matches?: Array<{
    field_name: string;
    matched: boolean;
    signal_value: any;
    spotlight_value: any;
  }>;
}

export interface CloneSpotlightRequest {
  org_id: number;
  name: string;
}

// ================================
// Filter Types
// ================================

export interface SpotlightFilters {
  org_id: number;
  domain?: string;
  active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface SpotlightFieldFilters {
  org_id: number;
  domain?: string;
  field_type?: SpotlightField['field_type'];
}

// ================================
// UI State Types
// ================================

export interface SpotlightFormData {
  name: string;
  domain: string;
  description: string;
  active: boolean;
  field_values: Record<number, any>; // field_id -> value
}

export interface SpotlightBuilderState {
  mode: 'create' | 'edit' | 'clone';
  spotlight?: Spotlight;
  availableFields: SpotlightField[];
  formData: SpotlightFormData;
  isDirty: boolean;
  errors: Record<string, string>;
}

export interface SpotlightEvaluationState {
  isEvaluating: boolean;
  result?: SpotlightEvaluationResult;
  error?: string;
  lastEvaluatedAt?: string;
}

// ================================
// Integration Types
// ================================

export interface SignalSpotlightMatch {
  signal_id: number;
  spotlight_id: number;
  match_score: number;
  recommendation: SpotlightEvaluationResult['recommendation'];
  evaluated_at: string;
  field_matches: SpotlightEvaluationResult['field_matches'];
}

export interface CandidateSpotlightAssociation {
  candidate_id: number;
  spotlight_id: number;
  confidence_score: number;
  associated_at: string;
  notes?: string;
}

// ================================
// Analytics Types
// ================================

export interface SpotlightAnalytics {
  spotlight_id: number;
  name: string;
  domain: string;
  total_evaluations: number;
  high_matches: number;
  medium_matches: number;
  low_matches: number;
  avg_match_score: number;
  conversion_rate: number; // % of high matches that became candidates
  last_used_at?: string;
}

export interface SpotlightPerformanceMetrics {
  overview: {
    total_profiles: number;
    active_profiles: number;
    total_evaluations: number;
    avg_match_score: number;
  };
  top_performers: SpotlightAnalytics[];
  match_distribution: {
    high_match: number;
    medium_match: number;
    low_match: number;
    no_match: number;
  };
  domain_breakdown: Array<{
    domain: string;
    profile_count: number;
    avg_score: number;
  }>;
}

// ================================
// Validation Schemas
// ================================

export const CreateSpotlightSchema = z.object({
  org_id: z.number().min(1),
  name: z.string().min(1).max(255),
  domain: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
});

export const UpdateSpotlightSchema = z.object({
  org_id: z.number().min(1),
  name: z.string().min(1).max(255).optional(),
  domain: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  active: z.boolean().optional(),
  field_values: z.record(z.any()).optional(),
});

export const SpotlightEvaluationSchema = z.object({
  org_id: z.number().min(1),
  signal_data: z.record(z.any()),
});

// ================================
// Utility Types
// ================================

export type SpotlightDomain = string; // Could be enum in future: 'tech' | 'finance' | 'healthcare' etc.

export type SpotlightRecommendation = SpotlightEvaluationResult['recommendation'];

export type SpotlightFieldType = SpotlightField['field_type'];

// ================================
// Error Types
// ================================

export interface SpotlightError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

export interface SpotlightApiError {
  status: 'error';
  error: SpotlightError;
}

// ================================
// Helper Functions
// ================================

export function getRecommendationColor(recommendation: SpotlightRecommendation): string {
  switch (recommendation) {
    case 'high_match': return 'text-green-400';
    case 'medium_match': return 'text-yellow-400';
    case 'low_match': return 'text-orange-400';
    case 'no_match': return 'text-red-400';
    default: return 'text-gray-400';
  }
}

export function getMatchScoreLabel(score: number): string {
  if (score >= 0.8) return 'Excellent Match';
  if (score >= 0.6) return 'Good Match';
  if (score >= 0.4) return 'Fair Match';
  return 'Poor Match';
}

export function formatSpotlightFieldValue(value: any, fieldType: SpotlightFieldType): string {
  if (value === null || value === undefined) return '';
  
  switch (fieldType) {
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'date':
      return new Date(value).toLocaleDateString();
    case 'number':
      return Number(value).toLocaleString();
    default:
      return String(value);
  }
}

export function validateFieldValue(value: any, field: SpotlightField): string | null {
  if (field.is_required && (value === null || value === undefined || value === '')) {
    return `${field.field_name} is required`;
  }

  switch (field.field_type) {
    case 'number':
      if (value !== '' && isNaN(Number(value))) {
        return `${field.field_name} must be a number`;
      }
      break;
    case 'date':
      if (value && isNaN(Date.parse(value))) {
        return `${field.field_name} must be a valid date`;
      }
      break;
    case 'enum':
      if (value && field.enum_values && !field.enum_values.includes(value)) {
        return `${field.field_name} must be one of: ${field.enum_values.join(', ')}`;
      }
      break;
  }

  return null;
}
