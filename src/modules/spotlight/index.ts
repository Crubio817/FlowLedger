// Spotlight Module v1.0 - Public API
// Export all public types, components, and hooks for integration

// Types
export type {
  Spotlight,
  SpotlightField,
  SpotlightValue,
  SpotlightRule,
  CreateSpotlightRequest,
  UpdateSpotlightRequest,
  SpotlightListResponse,
  SpotlightDetailResponse,
  SpotlightEvaluationRequest,
  SpotlightEvaluationResult,
  CloneSpotlightRequest,
  SpotlightFilters,
  SpotlightFieldFilters,
  SpotlightFormData,
  SpotlightBuilderState,
  SpotlightEvaluationState,
  SignalSpotlightMatch,
  CandidateSpotlightAssociation,
  SpotlightAnalytics,
  SpotlightPerformanceMetrics,
  SpotlightDomain,
  SpotlightRecommendation,
  SpotlightFieldType,
  SpotlightError,
  SpotlightApiError,
} from './services/spotlight.types.ts';

// API Functions
export {
  getSpotlights,
  getSpotlight,
  createSpotlight,
  updateSpotlight,
  deleteSpotlight,
  cloneSpotlight,
  getSpotlightFields,
  createSpotlightField,
  updateSpotlightField,
  deleteSpotlightField,
  evaluateSpotlight,
  evaluateSignalAgainstAllSpotlights,
  getSpotlightEvaluations,
  getSpotlightAnalytics,
  getSpotlightPerformance,
  getSignalSpotlightMatches,
  associateCandidateWithSpotlight,
  getCandidateSpotlights,
  testSpotlightMatch,
  getAvailableDomains,
  getSpotlightDomains,
} from './services/spotlight.api.ts';

// React Hooks
export {
  spotlightKeys,
  useSpotlights,
  useSpotlight,
  useCreateSpotlight,
  useUpdateSpotlight,
  useDeleteSpotlight,
  useCloneSpotlight,
  useSpotlightFields,
  useCreateSpotlightField,
  useUpdateSpotlightField,
  useDeleteSpotlightField,
  useEvaluateSpotlight,
  useEvaluateSignalAgainstAllSpotlights,
  useSpotlightEvaluations,
  useSpotlightAnalytics,
  useSpotlightPerformance,
  useSignalSpotlightMatches,
  useAssociateCandidateWithSpotlight,
  useCandidateSpotlights,
  useAvailableDomains,
  useSpotlightDomains,
  useOptimisticSpotlightUpdate,
} from './hooks/useSpotlight.ts';

// Components
export { default as SpotlightCard, SpotlightItem, SpotlightList } from './components/SpotlightCard.tsx';
export { default as SpotlightBuilder } from './components/SpotlightBuilder.tsx';
export { default as SpotlightBuilderStepped } from './components/SpotlightBuilderStepped.tsx';
export { default as SpotlightProfilesGallery } from './components/SpotlightProfilesGallery.tsx';
export { default as DomainInput } from './components/DomainInput.tsx';

// Component Props Types
export type { 
  SpotlightCardProps, 
  SpotlightListProps, 
  SpotlightItemProps 
} from './components/SpotlightCard.tsx';
export type { SpotlightBuilderProps } from './components/SpotlightBuilder.tsx';
export type { SpotlightBuilderSteppedProps } from './components/SpotlightBuilderStepped.tsx';
export type { DomainInputProps } from './components/DomainInput.tsx';

// Utility Functions
export {
  getRecommendationColor,
  getMatchScoreLabel,
  formatSpotlightFieldValue,
  validateFieldValue,
} from './services/spotlight.types.ts';

// Validation Schemas
export {
  CreateSpotlightSchema,
  UpdateSpotlightSchema,
  SpotlightEvaluationSchema,
} from './services/spotlight.types.ts';
