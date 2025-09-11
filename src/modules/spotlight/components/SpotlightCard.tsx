// Spotlight Module v1.0 - Main Component
// SpotlightCard: Display and manage spotlight profiles with evaluation features

import React, { useState, useMemo } from 'react';
import { 
  Target, 
  TrendingUp, 
  Settings, 
  Copy, 
  Trash2, 
  Play, 
  Pause,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Edit3,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  useSpotlights,
  useSpotlight,
  useCreateSpotlight,
  useUpdateSpotlight,
  useDeleteSpotlight,
  useCloneSpotlight,
  useEvaluateSpotlight,
  useSpotlightPerformance,
} from '../hooks/useSpotlight.ts';
import type {
  Spotlight,
  SpotlightEvaluationResult,
  SpotlightFilters,
  CreateSpotlightRequest,
  UpdateSpotlightRequest,
} from '../services/spotlight.types.ts';

// ================================
// Component Props
// ================================

interface SpotlightCardProps {
  orgId: number;
  domain?: string;
  variant?: 'compact' | 'detailed' | 'evaluation';
  signalData?: Record<string, any>; // For evaluation mode
  onSpotlightSelect?: (spotlight: Spotlight) => void;
  onEvaluationComplete?: (spotlight: Spotlight, result: SpotlightEvaluationResult) => void;
  showCreateButton?: boolean;
  className?: string;
}

interface SpotlightListProps {
  spotlights: Spotlight[];
  orgId: number;
  variant: SpotlightCardProps['variant'];
  signalData?: Record<string, any>;
  onSpotlightSelect?: (spotlight: Spotlight) => void;
  onEvaluationComplete?: (spotlight: Spotlight, result: SpotlightEvaluationResult) => void;
}

interface SpotlightItemProps {
  spotlight: Spotlight;
  orgId: number;
  variant: SpotlightCardProps['variant'];
  signalData?: Record<string, any>;
  onSelect?: (spotlight: Spotlight) => void;
  onEvaluationComplete?: (spotlight: Spotlight, result: SpotlightEvaluationResult) => void;
}

// ================================
// Individual Spotlight Item
// ================================

const SpotlightItem: React.FC<SpotlightItemProps> = ({
  spotlight,
  orgId,
  variant = 'compact',
  signalData,
  onSelect,
  onEvaluationComplete,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  const { data: performanceData } = useSpotlightPerformance(spotlight.spotlight_id, orgId);
  const { mutateAsync: evaluateSpotlight } = useEvaluateSpotlight();
  const { mutateAsync: updateSpotlight } = useUpdateSpotlight();
  const { mutateAsync: cloneSpotlight } = useCloneSpotlight();
  const { mutateAsync: deleteSpotlight } = useDeleteSpotlight();

  // Evaluate spotlight against signal data
  const handleEvaluate = async () => {
    if (!signalData) return;
    
    setIsEvaluating(true);
    try {
      const result = await evaluateSpotlight({
        spotlightId: spotlight.spotlight_id,
        data: { org_id: orgId, signal_data: signalData },
      });
      
      onEvaluationComplete?.(spotlight, result);
    } catch (error) {
      console.error('Evaluation failed:', error);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Toggle spotlight active status
  const handleToggleActive = async () => {
    try {
      await updateSpotlight({
        spotlightId: spotlight.spotlight_id,
        data: { org_id: orgId, active: !spotlight.active },
      });
    } catch (error) {
      console.error('Toggle active failed:', error);
    }
  };

  // Clone spotlight
  const handleClone = async () => {
    try {
      await cloneSpotlight({
        spotlightId: spotlight.spotlight_id,
        data: { org_id: orgId, name: `${spotlight.name} (Copy)` },
      });
    } catch (error) {
      console.error('Clone failed:', error);
    }
  };

  // Delete spotlight
  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${spotlight.name}"?`)) return;
    
    try {
      await deleteSpotlight({ spotlightId: spotlight.spotlight_id, orgId });
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  // Calculate match score if signal data provided
  const matchScore = useMemo(() => {
    if (!signalData || !spotlight.fields?.length) return null;
    
    let matched = 0;
    let total = 0;
    
    for (const field of spotlight.fields) {
      if (!field.value) continue;
      total++;
      
      const signalValue = signalData[field.field_name];
      if (signalValue && matchesCriteria(signalValue, field.value, field.field_type)) {
        matched++;
      }
    }
    
    return total > 0 ? matched / total : 0;
  }, [signalData, spotlight.fields]);

  // Helper function to check if values match
  const matchesCriteria = (signalValue: any, spotlightValue: any, fieldType: string): boolean => {
    if (!signalValue || !spotlightValue) return false;
    
    switch (fieldType) {
      case 'text':
        return String(signalValue).toLowerCase().includes(String(spotlightValue).toLowerCase());
      case 'number':
        return Number(signalValue) === Number(spotlightValue);
      case 'boolean':
        return Boolean(signalValue) === Boolean(spotlightValue);
      case 'enum':
        return String(signalValue) === String(spotlightValue);
      case 'date':
        return new Date(signalValue).getTime() === new Date(spotlightValue).getTime();
      default:
        return false;
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 0.8) return 'text-green-400';
    if (score >= 0.6) return 'text-yellow-400';
    if (score >= 0.4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getMatchLabel = (score: number) => {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="bg-zinc-800/50 backdrop-blur-md border border-zinc-700/50 rounded-lg p-4 hover:border-cyan-500/30 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <h3 
              className="font-medium text-white truncate cursor-pointer hover:text-cyan-400 transition-colors"
              onClick={() => onSelect?.(spotlight)}
            >
              {spotlight.name}
            </h3>
            {!spotlight.active && (
              <span className="px-2 py-0.5 text-xs bg-gray-700 text-gray-300 rounded">
                Inactive
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span className="px-2 py-0.5 bg-zinc-700/50 rounded text-xs">
              {spotlight.domain}
            </span>
            {spotlight.field_count && (
              <span className="text-xs">
                {spotlight.field_count} fields
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Match Score */}
          {matchScore !== null && (
            <div className={`text-sm font-medium ${getMatchColor(matchScore)}`}>
              {Math.round(matchScore * 100)}%
            </div>
          )}

          {/* Evaluation Button */}
          {signalData && (
            <button
              onClick={handleEvaluate}
              disabled={isEvaluating}
              className="p-1.5 text-cyan-400 hover:bg-cyan-400/10 rounded transition-colors disabled:opacity-50"
              title="Evaluate against signal"
            >
              {isEvaluating ? (
                <Clock className="w-4 h-4 animate-spin" />
              ) : (
                <BarChart3 className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Active Toggle */}
          <button
            onClick={handleToggleActive}
            className={`p-1.5 rounded transition-colors ${
              spotlight.active 
                ? 'text-green-400 hover:bg-green-400/10' 
                : 'text-gray-400 hover:bg-gray-400/10'
            }`}
            title={spotlight.active ? 'Deactivate' : 'Activate'}
          >
            {spotlight.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* More Options */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleClone}
              className="p-1.5 text-zinc-400 hover:text-cyan-400 hover:bg-cyan-400/10 rounded transition-colors"
              title="Clone spotlight"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
              title="Delete spotlight"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-zinc-400 hover:text-white rounded transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Description */}
      {spotlight.description && (
        <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
          {spotlight.description}
        </p>
      )}

      {/* Performance Metrics */}
      {performanceData && variant !== 'compact' && (
        <div className="flex items-center gap-4 text-xs text-zinc-400 mb-3">
          <div className="flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            {performanceData.evaluation_count} evaluations
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {Math.round(performanceData.avg_match_score * 100)}% avg match
          </div>
        </div>
      )}

      {/* Expanded Details */}
      {isExpanded && spotlight.fields && (
        <div className="mt-3 pt-3 border-t border-zinc-700/50">
          <h4 className="text-sm font-medium text-white mb-2">Profile Fields</h4>
          <div className="space-y-2">
            {spotlight.fields.map((field) => (
              <div key={field.field_id} className="flex justify-between items-center text-sm">
                <span className="text-zinc-300">{field.field_name}</span>
                <span className="text-zinc-400">
                  {field.value || 'Not set'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ================================
// Spotlight List Component
// ================================

const SpotlightList: React.FC<SpotlightListProps> = ({
  spotlights,
  orgId,
  variant,
  signalData,
  onSpotlightSelect,
  onEvaluationComplete,
}) => {
  if (spotlights.length === 0) {
    return (
      <div className="text-center py-8">
        <Target className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
        <p className="text-zinc-400 mb-2">No spotlight profiles found</p>
        <p className="text-sm text-zinc-500">
          Create a profile to start evaluating signals
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {spotlights.map((spotlight) => (
        <SpotlightItem
          key={spotlight.spotlight_id}
          spotlight={spotlight}
          orgId={orgId}
          variant={variant}
          signalData={signalData}
          onSelect={onSpotlightSelect}
          onEvaluationComplete={onEvaluationComplete}
        />
      ))}
    </div>
  );
};

// ================================
// Main SpotlightCard Component
// ================================

const SpotlightCard: React.FC<SpotlightCardProps> = ({
  orgId,
  domain,
  variant = 'compact',
  signalData,
  onSpotlightSelect,
  onEvaluationComplete,
  showCreateButton = true,
  className = '',
}) => {
  const [filters, setFilters] = useState<SpotlightFilters>({
    org_id: orgId,
    domain,
    active: true,
    limit: 20,
  });

  const { data: spotlightsResponse, isLoading, error } = useSpotlights(filters);
  const { mutateAsync: createSpotlight } = useCreateSpotlight();

  const spotlights = spotlightsResponse?.data || [];

  const handleCreateSpotlight = async () => {
    const name = prompt('Enter spotlight name:');
    if (!name) return;

    const spotlightDomain = domain || prompt('Enter domain:');
    if (!spotlightDomain) return;

    try {
      await createSpotlight({
        org_id: orgId,
        name,
        domain: spotlightDomain,
        description: `New ${spotlightDomain} profile`,
      });
    } catch (error) {
      console.error('Create spotlight failed:', error);
    }
  };

  if (error) {
    return (
      <div className={`bg-red-900/20 border border-red-500/30 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="w-4 h-4" />
          Failed to load spotlights
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-zinc-900/50 backdrop-blur-md border border-zinc-700/50 rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-700/50">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-cyan-400" />
          <h2 className="font-medium text-white">
            Spotlight Profiles
            {domain && <span className="text-zinc-400 ml-2">({domain})</span>}
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Filters */}
          <select
            value={filters.active === undefined ? 'all' : filters.active ? 'active' : 'inactive'}
            onChange={(e) => {
              const value = e.target.value;
              setFilters(prev => ({
                ...prev,
                active: value === 'all' ? undefined : value === 'active',
              }));
            }}
            className="bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-sm text-white"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Create Button */}
          {showCreateButton && (
            <button
              onClick={handleCreateSpotlight}
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white text-sm rounded transition-colors"
            >
              Create
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Clock className="w-6 h-6 text-cyan-400 animate-spin" />
            <span className="ml-2 text-zinc-400">Loading spotlights...</span>
          </div>
        ) : (
          <SpotlightList
            spotlights={spotlights}
            orgId={orgId}
            variant={variant}
            signalData={signalData}
            onSpotlightSelect={onSpotlightSelect}
            onEvaluationComplete={onEvaluationComplete}
          />
        )}
      </div>
    </div>
  );
};

export default SpotlightCard;
export { SpotlightItem, SpotlightList };
export type { SpotlightCardProps, SpotlightListProps, SpotlightItemProps };
