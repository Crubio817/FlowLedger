// Workstream Module v2.1 - Pursuits Page Component
// Manage active pursuits with stage progression and checklist gating

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Target, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  Eye,
  ArrowRight,
  DollarSign,
  Calendar,
  Trophy,
  XCircle,
  Send,
  FileText,
  LayoutGrid,
  List
} from 'lucide-react';
import { 
  listPursuits, 
  updatePursuit, 
  changePursuitStage,
  submitPursuit,
  markPursuitWon,
  markPursuitLost,
  getPursuitChecklist
} from '../services/workstream.api.ts';
import { PURSUIT_TRANSITIONS, getStageColor, formatCurrency } from '../services/workstream.types.ts';
import type { Pursuit, PursuitFilters, PursuitChecklist } from '../services/workstream.types.ts';
import { Badge } from '../ui/badge.tsx';
import { Button } from '../ui/button.tsx';
import { Input } from '../ui/input.tsx';
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter } from '../ui/dialog.tsx';
import FloatingActionButton from '../components/FloatingActionButton.tsx';
import { PageTitleEditorial } from '../components/PageTitles.tsx';
import StandardHeader from '../components/StandardHeader.tsx';
import { formatUtc } from '../utils/date.ts';
import { toast } from '../lib/toast.ts';

interface PursuitActionModalProps {
  pursuit: Pursuit | null;
  action: 'stage' | 'submit' | 'won' | 'lost' | null;
  open: boolean;
  onClose: () => void;
  onCompleted: () => void;
}

function PursuitActionModal({ pursuit, action, open, onClose, onCompleted }: PursuitActionModalProps) {
  const [stage, setStage] = useState<Pursuit['stage']>('qual');
  const [notes, setNotes] = useState('');
  const [wonValue, setWonValue] = useState('');
  const [lostReason, setLostReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [checklist, setChecklist] = useState<PursuitChecklist[]>([]);

  useEffect(() => {
    if (pursuit && open && action === 'stage') {
      loadChecklist();
      setStage('qual');
      setNotes('');
    }
  }, [pursuit, open, action]);

  const loadChecklist = async () => {
    if (!pursuit) return;
    try {
      const items = await getPursuitChecklist(pursuit.pursuit_id);
      setChecklist(items);
    } catch (error) {
      console.error('Failed to load checklist:', error);
    }
  };

  const getModalTitle = (): string => {
    switch (action) {
      case 'stage': return 'Change Stage';
      case 'submit': return 'Submit Pursuit';
      case 'won': return 'Mark as Won';
      case 'lost': return 'Mark as Lost';
      default: return '';
    }
  };

  const canProceed = (): boolean => {
    if (action === 'stage' && (stage === 'pink' || stage === 'red')) {
      const requiredItems = checklist.filter(item => 
        item.required_for_stage === stage && !item.completed
      );
      return requiredItems.length === 0;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!pursuit) return;

    try {
      setLoading(true);
      
      switch (action) {
        case 'stage':
          await changePursuitStage(pursuit.pursuit_id, stage, notes || undefined);
          toast.success(`Stage changed to ${stage}`);
          break;
        case 'submit':
          await submitPursuit(pursuit.pursuit_id, notes || undefined);
          toast.success('Pursuit submitted');
          break;
        case 'won':
          await markPursuitWon(
            pursuit.pursuit_id, 
            wonValue ? parseInt(wonValue) : undefined, 
            notes || undefined
          );
          toast.success('Pursuit marked as won');
          break;
        case 'lost':
          await markPursuitLost(pursuit.pursuit_id, lostReason || undefined, notes || undefined);
          toast.success('Pursuit marked as lost');
          break;
      }
      
      onCompleted();
      onClose();
    } catch (error) {
      toast.error(`Failed to ${action} pursuit`);
    } finally {
      setLoading(false);
    }
  };

  if (!pursuit || !action) return null;

  const availableStages = PURSUIT_TRANSITIONS[pursuit.stage] || [];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader title={getModalTitle()} />
        <DialogBody>
          <div className="space-y-4">
            {action === 'stage' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    New Stage
                  </label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as Pursuit['stage'])}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    {availableStages.map(s => (
                      <option key={s} value={s}>{s.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                {/* Checklist for Pink/Red stages */}
                {(stage === 'pink' || stage === 'red') && checklist.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Required Checklist for {stage.toUpperCase()}
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {checklist
                        .filter(item => item.required_for_stage === stage)
                        .map(item => (
                          <div key={item.checklist_id} className="flex items-center gap-2 text-sm">
                            {item.completed ? (
                              <CheckCircle2 size={16} className="text-emerald-400" />
                            ) : (
                              <Clock size={16} className="text-amber-400" />
                            )}
                            <span className={item.completed ? 'text-zinc-300' : 'text-white'}>
                              {item.item_name}
                            </span>
                          </div>
                        ))}
                    </div>
                    {!canProceed() && (
                      <p className="text-sm text-amber-400 mt-2">
                        Complete all required checklist items to proceed.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            {action === 'won' && (
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Final Value ($)
                </label>
                <Input
                  type="number"
                  value={wonValue}
                  onChange={(e) => setWonValue(e.target.value)}
                  placeholder="Final contract value"
                />
              </div>
            )}

            {action === 'lost' && (
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Lost Reason
                </label>
                <select
                  value={lostReason}
                  onChange={(e) => setLostReason(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Select reason...</option>
                  <option value="price">Price too high</option>
                  <option value="timeline">Timeline issues</option>
                  <option value="competitor">Lost to competitor</option>
                  <option value="budget">No budget</option>
                  <option value="scope">Scope mismatch</option>
                  <option value="other">Other</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white resize-none focus:outline-none focus:border-cyan-500"
                placeholder="Additional notes..."
              />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSubmit}
              disabled={loading || (action === 'stage' && !canProceed())}
            >
              {loading ? 'Processing...' : `${action === 'stage' ? 'Change Stage' : action.charAt(0).toUpperCase() + action.slice(1)}`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface PursuitCardProps {
  pursuit: Pursuit;
  onAction: (pursuit: Pursuit, action: 'stage' | 'submit' | 'won' | 'lost') => void;
}

function PursuitCard({ pursuit, onAction }: PursuitCardProps) {
  const getSlaIcon = (slaStatus?: 'green' | 'amber' | 'red') => {
    switch (slaStatus) {
      case 'green': return <CheckCircle2 size={14} className="text-emerald-400" />;
      case 'amber': return <Clock size={14} className="text-amber-400" />;
      case 'red': return <AlertCircle size={14} className="text-red-400" />;
      default: return null;
    }
  };

  const availableTransitions = PURSUIT_TRANSITIONS[pursuit.stage] || [];
  const canAdvance = availableTransitions.length > 0;

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white truncate mb-1">{pursuit.title}</h3>
          <div className="flex items-center gap-2">
            <Badge variant="muted" className="text-xs">
              <span className={getStageColor(pursuit.stage)}>
                {pursuit.stage.toUpperCase()}
              </span>
            </Badge>
            {pursuit.sla_badge && getSlaIcon(pursuit.sla_badge)}
          </div>
        </div>
        <Link to={`/workstream/pursuits/${pursuit.pursuit_id}`}>
          <Button variant="ghost" size="sm">
            <Eye size={14} />
          </Button>
        </Link>
      </div>

      {/* Forecast and Due Date */}
      <div className="mb-3 space-y-2">
        {pursuit.forecast_value_usd && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign size={14} className="text-emerald-400" />
            <span className="text-zinc-300">
              {formatCurrency(pursuit.forecast_value_usd)}
            </span>
          </div>
        )}
        {pursuit.due_date && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={14} className="text-blue-400" />
            <span className="text-zinc-300">
              Due {new Date(pursuit.due_date).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Probability and Checklist */}
      <div className="flex items-center justify-between mb-3 text-sm text-zinc-400">
        <span>Probability: {pursuit.probability}%</span>
        {pursuit.checklist_required && (
          <span className={pursuit.checklist_complete ? 'text-emerald-400' : 'text-amber-400'}>
            {pursuit.checklist_complete ? 'Checklist ✓' : 'Checklist pending'}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {pursuit.stage === 'submit' && (
          <>
            <Button
              onClick={() => onAction(pursuit, 'won')}
              variant="primary"
              size="sm"
              className="flex-1"
            >
              <Trophy size={14} className="mr-1" />
              Won
            </Button>
            <Button
              onClick={() => onAction(pursuit, 'lost')}
              variant="outline"
              size="sm"
            >
              <XCircle size={14} />
            </Button>
          </>
        )}

        {pursuit.stage === 'red' && (
          <Button
            onClick={() => onAction(pursuit, 'submit')}
            variant="primary"
            size="sm"
            className="flex-1"
          >
            <Send size={14} className="mr-1" />
            Submit
          </Button>
        )}

        {canAdvance && pursuit.stage !== 'submit' && (
          <Button
            onClick={() => onAction(pursuit, 'stage')}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <ArrowRight size={14} className="mr-1" />
            Advance
          </Button>
        )}

        {!canAdvance && pursuit.stage !== 'won' && pursuit.stage !== 'lost' && (
          <Button
            onClick={() => onAction(pursuit, 'lost')}
            variant="ghost"
            size="sm"
          >
            <XCircle size={14} />
          </Button>
        )}
      </div>
    </div>
  );
}

export default function PursuitsPage() {
  const navigate = useNavigate();
  const [pursuits, setPursuits] = useState<Pursuit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PursuitFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPursuit, setSelectedPursuit] = useState<Pursuit | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<'stage' | 'submit' | 'won' | 'lost' | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 50;

  useEffect(() => {
    loadPursuits();
  }, [page, filters]);

  const loadPursuits = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listPursuits(filters, page, limit);
      setPursuits(response.data);
      setTotal(response.meta?.total || 0);
    } catch (e: any) {
      setError(e?.message || 'Failed to load pursuits');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (pursuit: Pursuit, action: 'stage' | 'submit' | 'won' | 'lost') => {
    setSelectedPursuit(pursuit);
    setCurrentAction(action);
    setActionModalOpen(true);
  };

  const filteredPursuits = (Array.isArray(pursuits) ? pursuits : []).filter(pursuit => {
    if (searchQuery.trim()) {
      return pursuit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             pursuit.description?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const pursuitsByStage = filteredPursuits.reduce((acc, pursuit) => {
    if (!acc[pursuit.stage]) acc[pursuit.stage] = [];
    acc[pursuit.stage].push(pursuit);
    return acc;
  }, {} as Record<string, Pursuit[]>);

  const stageColumns = [
    { key: 'qual', label: 'Qualification', color: 'text-blue-400' },
    { key: 'pink', label: 'Pink', color: 'text-pink-400' },
    { key: 'red', label: 'Red', color: 'text-red-400' },
    { key: 'submit', label: 'Submitted', color: 'text-purple-400' },
    { key: 'won', label: 'Won', color: 'text-emerald-400' },
    { key: 'lost', label: 'Lost', color: 'text-zinc-500' },
  ];

  if (loading && pursuits.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-zinc-400">Loading pursuits...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Standardized Header */}
      <StandardHeader
        title="Pursuits"
        subtitle="Active deals and opportunities"
        color="blue"
        variant="comfortable"
      />
      
      <div className="pb-6 space-y-6">
        {/* View Controls */}
        <div className="flex justify-end px-6">
        <div className="flex gap-3">
          <div className="flex items-center gap-1 bg-zinc-900/50 border border-zinc-800 rounded-lg p-1">
            <Button
              onClick={() => setViewMode('kanban')}
              variant={viewMode === 'kanban' ? 'primary' : 'ghost'}
              size="sm"
            >
              <LayoutGrid size={16} />
            </Button>
            <Button
              onClick={() => setViewMode('list')}
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
            >
              <List size={16} />
            </Button>
          </div>
          <Button onClick={loadPursuits} variant="outline" size="sm">
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4 p-4 bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl mx-6">
        <Search size={16} className="text-zinc-400" />
        <Input
          placeholder="Search pursuits..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-zinc-400" />
          <select
            value={filters.stage || ''}
            onChange={(e) => setFilters({ ...filters, stage: e.target.value || undefined })}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Stages</option>
            <option value="qual">Qualification</option>
            <option value="pink">Pink</option>
            <option value="red">Red</option>
            <option value="submit">Submitted</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filters.sla || ''}
            onChange={(e) => setFilters({ ...filters, sla: e.target.value as any || undefined })}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="">All SLA</option>
            <option value="red">Overdue</option>
            <option value="amber">Due Soon</option>
            <option value="green">On Track</option>
          </select>
        </div>

        <div className="text-sm text-zinc-400">
          {filteredPursuits.length} of {total} pursuits
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="text-center py-12 bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl mx-6">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Failed to load pursuits</h2>
          <p className="text-zinc-400 mb-4">{error}</p>
          <Button onClick={loadPursuits} variant="primary">
            <RefreshCw size={16} className="mr-2" />
            Retry
          </Button>
        </div>
      )}

      {/* Main Content */}
      {viewMode === 'kanban' ? (
        /* Kanban View */
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-6 mx-6">
          {stageColumns.map(column => (
            <div key={column.key} className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-lg">
                <h3 className={`font-medium ${column.color}`}>{column.label}</h3>
                <Badge variant="muted" className="text-xs">
                  {pursuitsByStage[column.key]?.length || 0}
                </Badge>
              </div>
              <div className="space-y-3">
                {(pursuitsByStage[column.key] || []).map(pursuit => (
                  <PursuitCard
                    key={pursuit.pursuit_id}
                    pursuit={pursuit}
                    onAction={handleAction}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4 mx-6">
          {filteredPursuits.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl">
              <Target className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-zinc-400 mb-2">No pursuits found</h3>
              <p className="text-zinc-500">Create your first pursuit to get started</p>
            </div>
          ) : (
            filteredPursuits.map(pursuit => (
              <PursuitCard
                key={pursuit.pursuit_id}
                pursuit={pursuit}
                onAction={handleAction}
              />
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between mx-6">
          <div className="text-sm text-zinc-400">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} pursuits
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <Button
              onClick={() => setPage(p => p + 1)}
              disabled={page * limit >= total}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Action Modal */}
      <PursuitActionModal
        pursuit={selectedPursuit}
        action={currentAction}
        open={actionModalOpen}
        onClose={() => {
          setActionModalOpen(false);
          setSelectedPursuit(null);
          setCurrentAction(null);
        }}
        onCompleted={loadPursuits}
      />

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={() => navigate('/workstream/pursuits/new')}
        label="Add Pursuit"
        icon={<Target size={20} />}
      />
      </div>
    </div>
  );
}
