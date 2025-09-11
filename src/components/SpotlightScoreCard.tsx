import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '../ui/badge.tsx';
import { Button } from '../ui/button.tsx';
import { 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RotateCcw,
  BarChart3
} from 'lucide-react';
import { getSpotlightScores, rescoreItem } from '../services/workstream.api.ts';
import type { SpotlightScoreBreakdown } from '../services/workstream.types.ts';
import { toast } from 'react-hot-toast';

interface SpotlightScoreCardProps {
  itemType: 'signal' | 'candidate' | 'pursuit';
  itemId: number;
  spotlightId?: number;
  variant?: 'full' | 'compact';
  onScoreUpdate?: (newScore: SpotlightScoreBreakdown) => void;
}

export function SpotlightScoreCard({ 
  itemType, 
  itemId, 
  spotlightId,
  variant = 'full',
  onScoreUpdate 
}: SpotlightScoreCardProps) {
  const { 
    data: scoreData, 
    isLoading, 
    refetch,
    error 
  } = useQuery({
    queryKey: ['spotlight-scores', itemType, itemId, spotlightId],
    queryFn: () => getSpotlightScores(itemType, itemId, spotlightId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });

  const handleRescore = async () => {
    try {
      const result = await rescoreItem(itemType, itemId, {
        spotlight_id: spotlightId,
        reason: 'Manual rescore requested'
      });
      
      onScoreUpdate?.(result);
      refetch();
      toast.success('Score updated successfully');
    } catch (error) {
      toast.error('Failed to rescore item');
    }
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg p-4 animate-pulse bg-card">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 bg-muted rounded w-24"></div>
          <div className="h-5 bg-muted rounded w-16"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded"></div>
          <div className="h-3 bg-muted rounded w-5/6"></div>
          <div className="h-3 bg-muted rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error || !scoreData) {
    return (
      <div className="border border-red-200 rounded-lg p-4 bg-card">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">Score unavailable</span>
        </div>
      </div>
    );
  }

  const { total_score, score_breakdown, top_positive, top_negative } = scoreData;
  const scorePercentage = Math.round(total_score * 100);

  // Determine priority tier based on score
  const getPriorityTier = (score: number) => {
    if (score >= 0.8) return 'critical';
    if (score >= 0.6) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
  };

  const priorityTier = getPriorityTier(total_score);

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">{scorePercentage}%</span>
        </div>
        <Badge variant={priorityTier === 'critical' || priorityTier === 'high' ? 'success' : 'muted'} className="text-xs">
          {priorityTier.toUpperCase()}
        </Badge>
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-card">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <h3 className="font-medium">Match Score</h3>
          </div>
          <Badge variant={priorityTier === 'critical' || priorityTier === 'high' ? 'success' : 'muted'}>
            {priorityTier.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Overall Score */}
        <div className="text-center">
          <div className="text-3xl font-bold text-primary mb-1">
            {scorePercentage}%
          </div>
          <div className="w-full bg-muted rounded-full h-2 mb-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${scorePercentage}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Overall Match Score
          </p>
        </div>

        {/* Top Insights */}
        {(top_positive || top_negative) && (
          <div className="space-y-2">
            {top_positive && (
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-green-700">{top_positive}</span>
              </div>
            )}
            {top_negative && (
              <div className="flex items-start gap-2 text-sm">
                <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span className="text-red-700">{top_negative}</span>
              </div>
            )}
          </div>
        )}

        {/* Component Breakdown */}
        {score_breakdown && score_breakdown.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Score Breakdown
            </h4>
            
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {score_breakdown.slice(0, 5).map((component, index) => {
                const isPositive = component.contribution >= 0;
                const Icon = isPositive ? CheckCircle : XCircle;
                const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
                
                return (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-3 w-3 ${colorClass}`} />
                      <span className="truncate">{component.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${colorClass} text-xs`}>
                        {isPositive ? '+' : ''}{Math.round(component.contribution * 100)}
                      </span>
                      {component.reason && (
                        <div className="group relative">
                          <AlertTriangle className="h-3 w-3 text-muted-foreground cursor-help" />
                          <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-popover border rounded shadow-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 max-w-48">
                            {component.reason}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {score_breakdown.length > 5 && (
                <div className="text-xs text-muted-foreground text-center">
                  +{score_breakdown.length - 5} more components
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRescore}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-3 w-3" />
            Rescore
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-3 w-3" />
            Details
          </Button>
        </div>
      </div>
    </div>
  );
}
