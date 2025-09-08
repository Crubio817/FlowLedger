// Workstream Module v2.1 - Today Panel Component
// Unified dashboard showing urgent signals, candidates, and pursuits

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Calendar
} from 'lucide-react';
import { getTodayPanel, getWorkstreamStats } from '../services/workstream.api.ts';
import { calculateSlaStatus, getValueBandColor, getStageColor } from '../services/workstream.types.ts';
import type { TodayPanelItem } from '../services/workstream.types.ts';
import { Badge } from '../ui/badge.tsx';
import { Button } from '../ui/button.tsx';
import KpiCard from './KpiCard.tsx';
import { PageTitleEditorial } from './PageTitles.tsx';
import { formatUtc } from '../utils/date.ts';

interface WorkstreamStats {
  today_due: number;
  overdue: number;
  this_week: number;
  avg_cycle_time: number;
  win_rate: number;
}

export default function TodayPanel() {
  const [items, setItems] = useState<TodayPanelItem[]>([]);
  const [stats, setStats] = useState<WorkstreamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'signal' | 'candidate' | 'pursuit'>('all');
  const [filterSla, setFilterSla] = useState<'all' | 'green' | 'amber' | 'red'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [panelData, statsData] = await Promise.all([
        getTodayPanel(),
        getWorkstreamStats(),
      ]);
      setItems(Array.isArray(panelData) ? panelData : []);
      setStats(statsData);
    } catch (e: any) {
      setError(e?.message || 'Failed to load today panel');
      setItems([]); // Ensure items is always an array
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = (Array.isArray(items) ? items : []).filter(item => {
    if (filterType !== 'all' && item.item_type !== filterType) return false;
    if (filterSla !== 'all' && item.sla_badge !== filterSla) return false;
    return true;
  });

  const getSlaIcon = (slaStatus?: 'green' | 'amber' | 'red') => {
    switch (slaStatus) {
      case 'green': return <CheckCircle2 size={14} className="text-emerald-400" />;
      case 'amber': return <Clock size={14} className="text-amber-400" />;
      case 'red': return <AlertCircle size={14} className="text-red-400" />;
      default: return <Clock size={14} className="text-zinc-500" />;
    }
  };

  const getTypeIcon = (itemType: string) => {
    switch (itemType) {
      case 'signal': return <TrendingUp size={16} className="text-blue-400" />;
      case 'candidate': return <Users size={16} className="text-purple-400" />;
      case 'pursuit': return <Target size={16} className="text-emerald-400" />;
      default: return <FileText size={16} className="text-zinc-400" />;
    }
  };

  const getItemUrl = (item: TodayPanelItem): string => {
    switch (item.item_type) {
      case 'signal': return `/workstream/signals/${item.item_id}`;
      case 'candidate': return `/workstream/candidates/${item.item_id}`;
      case 'pursuit': return `/workstream/pursuits/${item.item_id}`;
      default: return '#';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-zinc-400">Loading today panel...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Failed to load today panel</h2>
        <p className="text-zinc-400 mb-4">{error}</p>
        <Button onClick={loadData} variant="primary">
          <RefreshCw size={16} className="mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <PageTitleEditorial
          eyebrow="Workstream Dashboard"
          title="Today's Priorities"
          subtitle="Critical workstream items requiring attention"
        />
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard
            title="Due Today"
            value={stats.today_due}
            icon={<Clock className="w-5 h-5" />}
            tint="#f59e0b"
          />
          <KpiCard
            title="Overdue"
            value={stats.overdue}
            icon={<AlertCircle className="w-5 h-5" />}
            tint="#ef4444"
          />
          <KpiCard
            title="This Week"
            value={stats.this_week}
            icon={<Calendar className="w-5 h-5" />}
            tint="#3b82f6"
          />
          <KpiCard
            title="Avg Cycle"
            value={stats.avg_cycle_time}
            icon={<TrendingUp className="w-5 h-5" />}
            tint="#10b981"
          />
          <KpiCard
            title="Win Rate"
            value={`${stats.win_rate}%`}
            icon={<Target className="w-5 h-5" />}
            tint="#8b5cf6"
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl">
        <Filter size={16} className="text-zinc-400" />
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-400">Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All</option>
            <option value="signal">Signals</option>
            <option value="candidate">Candidates</option>
            <option value="pursuit">Pursuits</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-400">SLA:</span>
          <select
            value={filterSla}
            onChange={(e) => setFilterSla(e.target.value as any)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All</option>
            <option value="red">Overdue</option>
            <option value="amber">Due Soon</option>
            <option value="green">On Track</option>
          </select>
        </div>

        <div className="ml-auto text-sm text-zinc-400">
          {filteredItems.length} of {items.length} items
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">All caught up!</h3>
            <p className="text-zinc-400">No urgent items require your attention right now.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={`${item.item_type}-${item.item_id}`} className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {/* Type Icon */}
                  <div className="mt-1">
                    {getTypeIcon(item.item_type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title and Type */}
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-white truncate">{item.label}</h3>
                      <Badge variant="muted" className="text-xs">
                        {item.item_type}
                      </Badge>
                      {item.sla_badge && (
                        <div className="flex items-center gap-1">
                          {getSlaIcon(item.sla_badge)}
                          <span className="text-xs text-zinc-400">{item.sla_metric}</span>
                        </div>
                      )}
                    </div>

                    {/* State and Details */}
                    <div className="flex items-center gap-4 text-sm text-zinc-400">
                      <span>Status: <span className={getStageColor(item.state)}>{item.state}</span></span>
                      
                      {item.urgency_score && (
                        <span>Urgency: <span className="text-amber-400">{item.urgency_score}/100</span></span>
                      )}
                      
                      {item.value_band && (
                        <span>Value: <span className={getValueBandColor(item.value_band)}>{item.value_band}</span></span>
                      )}
                      
                      {item.forecast_value_usd && (
                        <span>Forecast: <span className="text-emerald-400">${item.forecast_value_usd.toLocaleString()}</span></span>
                      )}

                      {item.last_touch_at && (
                        <span>Last touch: {formatUtc(item.last_touch_at)}</span>
                      )}
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-3 mt-2">
                      {item.has_threads && (
                        <span className="flex items-center gap-1 text-xs text-blue-400">
                          <FileText size={12} />
                          Threads
                        </span>
                      )}
                      {item.has_docs && (
                        <span className="flex items-center gap-1 text-xs text-purple-400">
                          <FileText size={12} />
                          Docs
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <Link 
                    to={getItemUrl(item)}
                    className="p-2 hover:bg-zinc-800/50 rounded-lg transition-colors text-zinc-400 hover:text-white"
                  >
                    <ExternalLink size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center gap-4 pt-6">
        <Link to="/workstream/signals">
          <Button variant="outline">
            <TrendingUp size={16} className="mr-2" />
            View All Signals
          </Button>
        </Link>
        <Link to="/workstream/candidates">
          <Button variant="outline">
            <Users size={16} className="mr-2" />
            View All Candidates
          </Button>
        </Link>
        <Link to="/workstream/pursuits">
          <Button variant="outline">
            <Target size={16} className="mr-2" />
            View All Pursuits
          </Button>
        </Link>
      </div>
    </div>
  );
}
