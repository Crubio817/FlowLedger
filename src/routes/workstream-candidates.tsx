// Workstream Module v2.1 - Candidates Page Component
// Manage candidates with kanban board and list views

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  AlertCircle, 
  Target,
  Eye,
  Edit3,
  ArrowUp,
  Clock,
  CheckCircle2,
  Mail,
  Phone,
  Building2,
  LayoutGrid,
  List
} from 'lucide-react';
import { 
  listCandidates, 
  updateCandidate, 
  promoteCandidate,
  triggerDrip
} from '../services/workstream.api.ts';
import { CANDIDATE_TRANSITIONS, getValueBandColor } from '../services/workstream.types.ts';
import type { Candidate, CandidateFilters } from '../services/workstream.types.ts';
import { Badge } from '../ui/badge.tsx';
import { Button } from '../ui/button.tsx';
import { Input } from '../ui/input.tsx';
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter } from '../ui/dialog.tsx';
import FloatingActionButton from '../components/FloatingActionButton.tsx';
import { PageTitleEditorial } from '../components/PageTitles.tsx';
import { formatUtc } from '../utils/date.ts';
import { toast } from '../lib/toast.ts';

interface PromoteCandidateModalProps {
  candidate: Candidate | null;
  open: boolean;
  onClose: () => void;
  onPromoted: () => void;
}

function PromoteCandidateModal({ candidate, open, onClose, onPromoted }: PromoteCandidateModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [forecastValue, setForecastValue] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!candidate || !title.trim()) return;

    try {
      setLoading(true);
      await promoteCandidate(candidate.candidate_id, {
        title: title.trim(),
        description: description.trim() || undefined,
        forecast_value_usd: forecastValue ? parseInt(forecastValue) : undefined,
        due_date: dueDate || undefined,
      });
      toast.success('Candidate promoted to pursuit');
      onPromoted();
      onClose();
    } catch (error) {
      toast.error('Failed to promote candidate');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (candidate && open) {
      setTitle(candidate.title || '');
      setDescription(candidate.notes || '');
      setForecastValue('');
      setDueDate('');
    }
  }, [candidate, open]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader title="Promote to Pursuit" />
        <DialogBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Pursuit Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Process improvement engagement"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white resize-none focus:outline-none focus:border-cyan-500"
                placeholder="Pursuit description and context..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Forecast Value ($)
                </label>
                <Input
                  type="number"
                  value={forecastValue}
                  onChange={(e) => setForecastValue(e.target.value)}
                  placeholder="100000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Due Date
                </label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
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
              disabled={loading || !title.trim()}
            >
              {loading ? 'Promoting...' : 'Promote to Pursuit'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface CandidateCardProps {
  candidate: Candidate;
  onStatusChange: (candidate: Candidate, newStatus: Candidate['status']) => void;
  onPromote: (candidate: Candidate) => void;
  onDrip: (candidate: Candidate) => void;
}

function CandidateCard({ candidate, onStatusChange, onPromote, onDrip }: CandidateCardProps) {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'new': return 'text-blue-400';
      case 'triaged': return 'text-purple-400';
      case 'nurture': return 'text-amber-400';
      case 'on_hold': return 'text-zinc-500';
      case 'promoted': return 'text-emerald-400';
      case 'archived': return 'text-zinc-600';
      default: return 'text-zinc-400';
    }
  };

  const getSlaIcon = (slaStatus?: 'green' | 'amber' | 'red') => {
    switch (slaStatus) {
      case 'green': return <CheckCircle2 size={14} className="text-emerald-400" />;
      case 'amber': return <Clock size={14} className="text-amber-400" />;
      case 'red': return <AlertCircle size={14} className="text-red-400" />;
      default: return null;
    }
  };

  const availableTransitions = CANDIDATE_TRANSITIONS[candidate.status] || [];

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white truncate mb-1">{candidate.title}</h3>
          <div className="flex items-center gap-2">
            <Badge variant="muted" className="text-xs">
              {candidate.status.replace('_', ' ')}
            </Badge>
            <span className={`text-xs ${getValueBandColor(candidate.value_band)}`}>
              {candidate.value_band}
            </span>
            {candidate.sla_badge && getSlaIcon(candidate.sla_badge)}
          </div>
        </div>
        <Link to={`/workstream/candidates/${candidate.candidate_id}`}>
          <Button variant="ghost" size="sm">
            <Eye size={14} />
          </Button>
        </Link>
      </div>

      {/* Contact Info */}
      {(candidate.contact_name || candidate.contact_email) && (
        <div className="mb-3 space-y-1">
          {candidate.contact_name && (
            <div className="flex items-center gap-2 text-sm">
              <Users size={14} className="text-zinc-500" />
              <span className="text-zinc-300">{candidate.contact_name}</span>
            </div>
          )}
          {candidate.contact_email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail size={14} className="text-zinc-500" />
              <span className="text-zinc-300">{candidate.contact_email}</span>
            </div>
          )}
        </div>
      )}

      {/* Confidence and Last Touch */}
      <div className="flex items-center justify-between mb-3 text-sm text-zinc-400">
        <span>Confidence: {candidate.confidence}%</span>
        {candidate.last_touch_at && (
          <span>Touch: {formatUtc(candidate.last_touch_at)}</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {candidate.status === 'triaged' && (
          <Button
            onClick={() => onPromote(candidate)}
            variant="primary"
            size="sm"
            className="flex-1"
          >
            <ArrowUp size={14} className="mr-1" />
            Promote
          </Button>
        )}

        {candidate.status === 'nurture' && (
          <Button
            onClick={() => onDrip(candidate)}
            variant="outline"
            size="sm"
          >
            <Mail size={14} className="mr-1" />
            Drip
          </Button>
        )}

        {availableTransitions.length > 0 && (
          <select
            onChange={(e) => {
              if (e.target.value) {
                onStatusChange(candidate, e.target.value as Candidate['status']);
                e.target.value = '';
              }
            }}
            className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white"
            defaultValue=""
          >
            <option value="">Move to...</option>
            {availableTransitions.map(status => (
              <option key={status} value={status}>
                {status.replace('_', ' ')}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

export default function CandidatesPage() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CandidateFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 50;

  useEffect(() => {
    loadCandidates();
  }, [page, filters]);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listCandidates(filters, page, limit);
      setCandidates(response.data);
      setTotal(response.meta?.total || 0);
    } catch (e: any) {
      setError(e?.message || 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (candidate: Candidate, newStatus: Candidate['status']) => {
    try {
      await updateCandidate(candidate.candidate_id, { status: newStatus });
      toast.success(`Candidate moved to ${newStatus.replace('_', ' ')}`);
      loadCandidates();
    } catch (error) {
      toast.error('Failed to update candidate status');
    }
  };

  const handlePromote = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setPromoteModalOpen(true);
  };

  const handleDrip = async (candidate: Candidate) => {
    try {
      await triggerDrip(candidate.candidate_id);
      toast.success('Drip campaign triggered');
    } catch (error) {
      toast.error('Failed to trigger drip campaign');
    }
  };

  const filteredCandidates = (Array.isArray(candidates) ? candidates : []).filter(candidate => {
    if (searchQuery.trim()) {
      return candidate.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             candidate.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             candidate.contact_email?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const candidatesByStatus = filteredCandidates.reduce((acc, candidate) => {
    if (!acc[candidate.status]) acc[candidate.status] = [];
    acc[candidate.status].push(candidate);
    return acc;
  }, {} as Record<string, Candidate[]>);

  const statusColumns = [
    { key: 'new', label: 'New', color: 'text-blue-400' },
    { key: 'triaged', label: 'Triaged', color: 'text-purple-400' },
    { key: 'nurture', label: 'Nurture', color: 'text-amber-400' },
    { key: 'on_hold', label: 'On Hold', color: 'text-zinc-500' },
    { key: 'promoted', label: 'Promoted', color: 'text-emerald-400' },
    { key: 'archived', label: 'Archived', color: 'text-zinc-600' },
  ];

  if (loading && candidates.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-zinc-400">Loading candidates...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <PageTitleEditorial
          eyebrow="Workstream Management"
          title="Candidates"
          subtitle="Potential opportunities in the pipeline"
        />
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
          <Button onClick={loadCandidates} variant="outline" size="sm">
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4 p-4 bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl">
        <Search size={16} className="text-zinc-400" />
        <Input
          placeholder="Search candidates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-zinc-400" />
          <select
            value={filters.value_band || ''}
            onChange={(e) => setFilters({ ...filters, value_band: e.target.value || undefined })}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Values</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="enterprise">Enterprise</option>
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
          {filteredCandidates.length} of {total} candidates
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="text-center py-12 bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Failed to load candidates</h2>
          <p className="text-zinc-400 mb-4">{error}</p>
          <Button onClick={loadCandidates} variant="primary">
            <RefreshCw size={16} className="mr-2" />
            Retry
          </Button>
        </div>
      )}

      {/* Main Content */}
      {viewMode === 'kanban' ? (
        /* Kanban View */
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {statusColumns.map(column => (
            <div key={column.key} className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-lg">
                <h3 className={`font-medium ${column.color}`}>{column.label}</h3>
                <Badge variant="muted" className="text-xs">
                  {candidatesByStatus[column.key]?.length || 0}
                </Badge>
              </div>
              <div className="space-y-3">
                {(candidatesByStatus[column.key] || []).map(candidate => (
                  <CandidateCard
                    key={candidate.candidate_id}
                    candidate={candidate}
                    onStatusChange={handleStatusChange}
                    onPromote={handlePromote}
                    onDrip={handleDrip}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {filteredCandidates.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl">
              <Users className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-zinc-400 mb-2">No candidates found</h3>
              <p className="text-zinc-500">Create your first candidate to get started</p>
            </div>
          ) : (
            filteredCandidates.map(candidate => (
              <CandidateCard
                key={candidate.candidate_id}
                candidate={candidate}
                onStatusChange={handleStatusChange}
                onPromote={handlePromote}
                onDrip={handleDrip}
              />
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-zinc-400">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} candidates
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

      {/* Promote Candidate Modal */}
      <PromoteCandidateModal
        candidate={selectedCandidate}
        open={promoteModalOpen}
        onClose={() => {
          setPromoteModalOpen(false);
          setSelectedCandidate(null);
        }}
        onPromoted={loadCandidates}
      />

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={() => navigate('/workstream/candidates/new')}
        label="Add Candidate"
        icon={<Users size={20} />}
      />
    </div>
  );
}
