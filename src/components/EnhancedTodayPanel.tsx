// Enhanced Today Panel v2.3 - With Priority Scoring & Memory Integration
// Leverages v2.2 backend capabilities for intelligent prioritization

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Clock, 
  TrendingUp, 
  Target, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  Filter,
  RefreshCw,
  Users,
  FileText,
  Calendar,
  Star,
  Brain,
  Zap,
  ArrowUp,
  AlertTriangle
} from 'lucide-react';
import { getTodayPanel, getWorkstreamStats } from '../services/workstream.api.ts';
import { calculateSlaStatus, getValueBandColor, getStageColor } from '../services/workstream.types.ts';
import type { TodayPanelItem } from '../services/workstream.types.ts';
import { Badge } from '../ui/badge.tsx';
import { Button } from '../ui/button.tsx';
import { SpotlightScoreCard } from './SpotlightScoreCard.tsx';
import { MemoryCard } from './MemoryCard.tsx';
import KpiCard from './KpiCard.tsx';
import { PageTitleEditorial } from './PageTitles.tsx';
import StandardHeader from './StandardHeader.tsx';
import { toast } from 'react-hot-toast';

interface WorkstreamStats {
  today_due: number;
  overdue: number;
  this_week: number;
  avg_cycle_time: number;
  win_rate: number;
}

type PriorityTier = 'critical' | 'high' | 'medium' | 'low' | 'all';
type ItemType = 'all' | 'signal' | 'candidate' | 'pursuit';

export default function EnhancedTodayPanel() {
  const [selectedItem, setSelectedItem] = useState<TodayPanelItem | null>(null);
  const [showMemoryCard, setShowMemoryCard] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<PriorityTier>('all');
  const [typeFilter, setTypeFilter] = useState<ItemType>('all');

  // Enhanced data fetching with priority filtering
  const { 
    data: todayItems = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['today-panel', priorityFilter === 'all' ? undefined : priorityFilter],
    queryFn: () => getTodayPanel(priorityFilter === 'all' ? undefined : priorityFilter),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  });

  const { data: stats } = useQuery({
    queryKey: ['workstream-stats'],
    queryFn: getWorkstreamStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter and sort items with enhanced logic
  const filteredItems = todayItems
    .filter(item => typeFilter === 'all' || item.item_type === typeFilter)
    .sort((a, b) => {
      // Primary sort: Priority score (if available)
      if (a.priority_score && b.priority_score) {
        const scoreDiff = b.priority_score - a.priority_score;
        if (Math.abs(scoreDiff) > 0.1) return scoreDiff;
      }
      
      // Secondary sort: Priority tier
      const tierOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const aTier = tierOrder[a.priority_tier as keyof typeof tierOrder] || 0;
      const bTier = tierOrder[b.priority_tier as keyof typeof tierOrder] || 0;
      const tierDiff = bTier - aTier;
      if (tierDiff !== 0) return tierDiff;
      
      // Tertiary sort: SLA status (red > amber > green)
      const slaOrder = { red: 3, amber: 2, green: 1 };
      const aSla = slaOrder[a.badge as keyof typeof slaOrder] || 0;
      const bSla = slaOrder[b.badge as keyof typeof slaOrder] || 0;
      
      return bSla - aSla;
    });

  // Group items by priority tier for better visualization
  const itemsByTier = filteredItems.reduce((acc, item) => {
    const tier = item.priority_tier || 'low';
    acc[tier] = acc[tier] || [];
    acc[tier].push(item);
    return acc;
  }, {} as Record<string, TodayPanelItem[]>);

  // Enhanced promotion detection
  const readyToPromote = todayItems.filter(item => 
    item.item_type === 'candidate' && 
    item.priority_score && 
    item.priority_score >= 0.8 && 
    item.icp_band === 'high'
  );

  const getPriorityTierColor = (tier: string) => {
    switch (tier) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (tier: string) => {
    switch (tier) {
      case 'critical': return <AlertTriangle className="h-3 w-3" />;
      case 'high': return <ArrowUp className="h-3 w-3" />;
      case 'medium': return <Target className="h-3 w-3" />;
      case 'low': return <Clock className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Failed to load today's priorities</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <StandardHeader
        title="Today's Priorities"
        subtitle="AI-prioritized workstream items with memory insights"
        color="blue"
        variant="comfortable"
      />

      <div className="pb-6 space-y-6">
        <div className="flex items-center justify-end px-6">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 px-6">
          <KpiCard
            title="Due Today"
            value={stats.today_due}
            icon={<Calendar className="h-5 w-5" />}
          />
          <KpiCard
            title="Overdue"
            value={stats.overdue}
            icon={<AlertCircle className="h-5 w-5" />}
          />
          <KpiCard
            title="This Week"
            value={stats.this_week}
            icon={<Target className="h-5 w-5" />}
          />
          <KpiCard
            title="Avg Cycle"
            value={`${stats.avg_cycle_time}d`}
            icon={<Clock className="h-5 w-5" />}
          />
          <KpiCard
            title="Win Rate"
            value={`${Math.round(stats.win_rate * 100)}%`}
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Priority:</span>
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((tier) => (
            <Button
              key={tier}
              variant={priorityFilter === tier ? "primary" : "outline"}
              size="sm"
              onClick={() => setPriorityFilter(tier)}
              className="text-xs"
            >
              {tier === 'all' ? 'All' : (
                <div className="flex items-center gap-1">
                  {tier !== 'critical' && tier !== 'high' && tier !== 'medium' && tier !== 'low' ? null : getPriorityIcon(tier)}
                  {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </div>
              )}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Type:</span>
          {(['all', 'signal', 'candidate', 'pursuit'] as const).map((type) => (
            <Button
              key={type}
              variant={typeFilter === type ? "primary" : "outline"}
              size="sm"
              onClick={() => setTypeFilter(type)}
              className="text-xs capitalize"
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* Ready to Promote Alert */}
      {readyToPromote.length > 0 && (
        <div className="border border-green-200 rounded-lg p-4 bg-green-50">
          <div className="flex items-start gap-3">
            <Star className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-green-800">Ready to Promote ({readyToPromote.length})</h3>
              <p className="text-sm text-green-700 mb-3">
                High-scoring candidates ready for pursuit promotion
              </p>
              <div className="space-y-2">
                {readyToPromote.slice(0, 3).map((item) => (
                  <div key={item.item_id} className="flex items-center justify-between bg-white rounded border border-green-200 p-2">
                    <div>
                      <span className="font-medium text-sm">{item.label}</span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Score: {Math.round((item.priority_score || 0) * 100)}%</span>
                        <span>•</span>
                        <span>ICP: {item.icp_band}</span>
                        <span>•</span>
                        <span>{item.forecast_value_usd ? `$${item.forecast_value_usd.toLocaleString()}` : item.value_band}</span>
                      </div>
                    </div>
                    <Button size="sm" className="text-xs">
                      Promote
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Priority Tiers */}
      <div className="mx-6">
      {(['critical', 'high', 'medium', 'low'] as const).map((tier) => {
        const tierItems = itemsByTier[tier] || [];
        if (tierItems.length === 0) return null;

        return (
          <div key={tier} className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge className={getPriorityTierColor(tier)}>
                {getPriorityIcon(tier)}
                <span className="ml-1 font-medium">{tier.toUpperCase()}</span>
                <span className="ml-2 bg-white/50 px-1 rounded text-xs">
                  {tierItems.length}
                </span>
              </Badge>
            </div>

            <div className="space-y-2">
              {tierItems.map((item) => (
                <TodayPanelItemCard 
                  key={item.item_id} 
                  item={item}
                  onSelect={setSelectedItem}
                  onShowMemory={() => setShowMemoryCard(true)}
                />
              ))}
            </div>
          </div>
        );
      })}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12 mx-6">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No items found
          </h3>
          <p className="text-sm text-muted-foreground">
            {priorityFilter !== 'all' || typeFilter !== 'all' 
              ? 'Try adjusting your filters'
              : 'All caught up! No urgent items for today.'
            }
          </p>
        </div>
      )}

      {/* Item Detail Sidebar (if item selected) */}
      {selectedItem && (
        <ItemDetailSidebar 
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          showMemoryCard={showMemoryCard}
          onMemoryToggle={() => setShowMemoryCard(!showMemoryCard)}
        />
      )}
    </div>
  </div>
  );
}

// Individual item card with enhanced features
function TodayPanelItemCard({ 
  item, 
  onSelect, 
  onShowMemory 
}: { 
  item: TodayPanelItem;
  onSelect: (item: TodayPanelItem) => void;
  onShowMemory: () => void;
}) {
  const slaColor = {
    green: 'text-green-600',
    amber: 'text-yellow-600', 
    red: 'text-red-600'
  }[item.badge as 'green' | 'amber' | 'red'] || 'text-gray-600';

  return (
    <div className="border rounded-lg p-4 bg-card hover:bg-muted/30 transition-colors cursor-pointer"
         onClick={() => onSelect(item)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-medium text-sm">{item.label}</h3>
            {item.priority_score && (
              <Badge variant="muted" className="text-xs">
                {Math.round(item.priority_score * 100)}%
              </Badge>
            )}
            {item.icp_band && (
              <Badge className="text-xs bg-green-100 text-green-800">
                ICP {item.icp_band}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="capitalize">{item.item_type}</span>
            <span>{item.forecast_value_usd ? `$${item.forecast_value_usd.toLocaleString()}` : item.value_band}</span>
            <span className={slaColor}>
              {item.badge === 'red' && <AlertTriangle className="h-3 w-3 inline mr-1" />}
              SLA: {item.badge}
            </span>
            {item.due_date && (
              <span>Due: {new Date(item.due_date).toLocaleDateString()}</span>
            )}
          </div>

          {/* Remove description section since it doesn't exist in TodayPanelItem */}
        </div>

        <div className="flex items-center gap-1 ml-4">
          {/* Memory indicator */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onShowMemory();
            }}
            className="h-6 w-6 p-0"
          >
            <Brain className="h-3 w-3 text-purple-600" />
          </Button>

          {/* Spotlight score indicator */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => e.stopPropagation()}
            className="h-6 w-6 p-0"
          >
            <Zap className="h-3 w-3 text-blue-600" />
          </Button>

          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

// Item detail sidebar component
function ItemDetailSidebar({ 
  item, 
  onClose, 
  showMemoryCard, 
  onMemoryToggle 
}: {
  item: TodayPanelItem;
  onClose: () => void;
  showMemoryCard: boolean;
  onMemoryToggle: () => void;
}) {
  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-background border-l shadow-lg z-50 overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{item.label}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto h-full">
        {/* Spotlight Score */}
        <SpotlightScoreCard 
          itemType={item.item_type}
          itemId={item.item_id}
          variant="full"
        />

        {/* Memory Card */}
        {showMemoryCard && (
          <MemoryCard 
            entityType={item.item_type}
            entityId={item.item_id}
            variant="full"
          />
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button size="sm" className="flex-1">
            Open Full View
          </Button>
          <Button variant="outline" size="sm" onClick={onMemoryToggle}>
            <Brain className="h-4 w-4 mr-2" />
            {showMemoryCard ? 'Hide' : 'Show'} Context
          </Button>
        </div>
      </div>
    </div>
  );
}
