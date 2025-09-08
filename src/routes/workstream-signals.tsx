// Workstream Module v2.1 - Signals Page Component
// Manage incoming signals with clustering and triage capabilities

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  AlertCircle, 
  Users, 
  Target,
  Eye,
  Trash2,
  Zap,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { 
  listSignals, 
  createSignal, 
  createCandidateFromSignal, 
  ignoreSignal,
  enrichSignal,
  analyzeSignal
} from '../services/workstream.api.ts';
import type { Signal, SignalFilters } from '../services/workstream.types.ts';
import { Badge } from '../ui/badge.tsx';
import { Button } from '../ui/button.tsx';
import { Input } from '../ui/input.tsx';
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter } from '../ui/dialog.tsx';
import FloatingActionButton from '../components/FloatingActionButton.tsx';
import { PageTitleEditorial } from '../components/PageTitles.tsx';
import { formatUtc } from '../utils/date.ts';
import { toast } from '../lib/toast.ts';

interface CreateCandidateModalProps {
  signal: Signal | null;
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

function CreateCandidateModal({ signal, open, onClose, onCreated }: CreateCandidateModalProps) {
  const [title, setTitle] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [valueBand, setValueBand] = useState<'small' | 'medium' | 'large' | 'enterprise'>('medium');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!signal || !title.trim()) return;

    try {
      setLoading(true);
      await createCandidateFromSignal(signal.signal_id, {
        title: title.trim(),
        contact_name: contactName.trim() || undefined,
        contact_email: contactEmail.trim() || undefined,
        value_band: valueBand,
        notes: notes.trim() || undefined,
      });
      toast.success('Candidate created successfully');
      onCreated();
      onClose();
    } catch (error) {
      toast.error('Failed to create candidate');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (signal && open) {
      setTitle(`Opportunity from ${signal.source_type}`);
      setContactName('');
      setContactEmail('');
      setValueBand('medium');
      setNotes(signal.snippet);
    }
  }, [signal, open]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader title="Create Candidate" />
        <DialogBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Opportunity Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Process improvement project"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Contact Name
                </label>
                <Input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Contact person"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Contact Email
                </label>
                <Input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Value Band
              </label>
              <select
                value={valueBand}
                onChange={(e) => setValueBand(e.target.value as any)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="small">Small (&lt;$50k)</option>
                <option value="medium">Medium ($50k-$200k)</option>
                <option value="large">Large ($200k-$500k)</option>
                <option value="enterprise">Enterprise ($500k+)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white resize-none focus:outline-none focus:border-cyan-500"
                placeholder="Additional context..."
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
              disabled={loading || !title.trim()}
            >
              {loading ? 'Creating...' : 'Create Candidate'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function SignalsPage() {
  const navigate = useNavigate();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SignalFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [candidateModalOpen, setCandidateModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 50;

  useEffect(() => {
    loadSignals();
  }, [page, filters]);

  const loadSignals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listSignals(filters, page, limit);
      setSignals(response.data);
      setTotal(response.meta?.total || 0);
    } catch (e: any) {
      setError(e?.message || 'Failed to load signals');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCandidate = (signal: Signal) => {
    setSelectedSignal(signal);
    setCandidateModalOpen(true);
  };

  const handleIgnoreSignal = async (signal: Signal) => {
    if (!confirm('Are you sure you want to ignore this signal?')) return;
    
    try {
      await ignoreSignal(signal.signal_id, 'User dismissed');
      toast.success('Signal ignored');
      loadSignals();
    } catch (error) {
      toast.error('Failed to ignore signal');
    }
  };

  const handleEnrichSignal = async (signal: Signal) => {
    try {
      toast.success('Enriching signal...');
      await enrichSignal(signal.signal_id);
      toast.success('Signal enriched');
      loadSignals();
    } catch (error) {
      toast.error('Failed to enrich signal');
    }
  };

  const getUrgencyColor = (score: number): string => {
    if (score >= 80) return 'text-red-400';
    if (score >= 60) return 'text-amber-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-emerald-400';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'new': return 'text-blue-400';
      case 'triaged': return 'text-purple-400';
      case 'candidate_created': return 'text-emerald-400';
      case 'ignored': return 'text-zinc-500';
      default: return 'text-zinc-400';
    }
  };

  const filteredSignals = (Array.isArray(signals) ? signals : []).filter(signal => {
    if (searchQuery.trim()) {
      return signal.snippet.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  if (loading && signals.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-zinc-400">Loading signals...</span>
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
          title="Signals"
          subtitle="Incoming opportunities and lead signals"
        />
        <div className="flex gap-3">
          <Button onClick={loadSignals} variant="outline" size="sm">
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4 p-4 bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl">
        <Search size={16} className="text-zinc-400" />
        <Input
          placeholder="Search signals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-zinc-400" />
          <select
            value={filters.source || ''}
            onChange={(e) => setFilters({ ...filters, source: e.target.value || undefined })}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Sources</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="web">Web</option>
            <option value="referral">Referral</option>
            <option value="linkedin">LinkedIn</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-400">Status:</span>
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="">All</option>
            <option value="new">New</option>
            <option value="triaged">Triaged</option>
            <option value="candidate_created">Converted</option>
            <option value="ignored">Ignored</option>
          </select>
        </div>

        <div className="text-sm text-zinc-400">
          {filteredSignals.length} of {total} signals
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="text-center py-12 bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Failed to load signals</h2>
          <p className="text-zinc-400 mb-4">{error}</p>
          <Button onClick={loadSignals} variant="primary">
            <RefreshCw size={16} className="mr-2" />
            Retry
          </Button>
        </div>
      )}

      {/* Signals List */}
      <div className="space-y-4">
        {filteredSignals.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl">
            <TrendingUp className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-zinc-400 mb-2">No signals found</h3>
            <p className="text-zinc-500">New signals will appear here when they arrive</p>
          </div>
        ) : (
          filteredSignals.map((signal) => (
            <div key={signal.signal_id} className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp size={20} className="text-blue-400" />
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="muted" className="text-xs">
                        {signal.source_type}
                      </Badge>
                      {signal.cluster_count && signal.cluster_count > 1 && (
                        <Badge variant="success" className="text-xs">
                          Cluster of {signal.cluster_count}
                        </Badge>
                      )}
                      <span className={`text-sm font-medium ${getStatusColor(signal.status)}`}>
                        {signal.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mb-4">
                    <p className="text-white text-sm leading-relaxed mb-2">
                      {signal.snippet}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-6 text-sm text-zinc-400">
                    <div className="flex items-center gap-2">
                      <span>Urgency:</span>
                      <span className={`font-medium ${getUrgencyColor(signal.urgency_score)}`}>
                        {signal.urgency_score}/100
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      <span>{formatUtc(signal.created_utc)}</span>
                    </div>
                    {signal.has_candidate && (
                      <div className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 size={14} />
                        <span>Candidate created</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    onClick={() => handleEnrichSignal(signal)}
                    variant="ghost"
                    size="sm"
                    title="Enrich with AI"
                  >
                    <Zap size={16} />
                  </Button>
                  
                  <Link to={`/workstream/signals/${signal.signal_id}`}>
                    <Button variant="ghost" size="sm" title="View details">
                      <Eye size={16} />
                    </Button>
                  </Link>

                  {signal.status === 'new' || signal.status === 'triaged' ? (
                    <Button
                      onClick={() => handleCreateCandidate(signal)}
                      variant="primary"
                      size="sm"
                    >
                      <Users size={16} className="mr-2" />
                      Create Candidate
                    </Button>
                  ) : null}

                  {signal.status !== 'ignored' && signal.status !== 'candidate_created' && (
                    <Button
                      onClick={() => handleIgnoreSignal(signal)}
                      variant="ghost"
                      size="sm"
                      title="Ignore signal"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-zinc-400">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} signals
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

      {/* Create Candidate Modal */}
      <CreateCandidateModal
        signal={selectedSignal}
        open={candidateModalOpen}
        onClose={() => {
          setCandidateModalOpen(false);
          setSelectedSignal(null);
        }}
        onCreated={loadSignals}
      />

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={() => navigate('/workstream/signals/new')}
        label="Add Signal"
        icon={<TrendingUp size={20} />}
      />
    </div>
  );
}
