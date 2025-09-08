import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button.tsx';
import {
  Plus,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  Calendar,
  Eye,
  Trash2,
  RefreshCw,
  Download,
  User
} from 'lucide-react';
import {
  listEnrichmentJobs,
  getEnrichmentStats,
  type EnrichmentJob,
  type EnrichmentStats,
  listClientContacts,
  type ClientContact
} from '../services/api.ts';
import { EnrichmentModal } from './EnrichmentModal.js';
import { EnrichmentStatusBadge } from './EnrichmentStatusBadge.js';

interface EnrichmentTabProps {
  clientId: number;
}

export function EnrichmentTab({ clientId }: EnrichmentTabProps) {
  const [jobs, setJobs] = useState<EnrichmentJob[]>([]);
  const [contacts, setContacts] = useState<ClientContact[]>([]);
  const [stats, setStats] = useState<EnrichmentStats>({
    total: 0,
    pending: 0,
    completed: 0,
    failed: 0
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsResponse, statsResponse, contactsResponse] = await Promise.all([
        listEnrichmentJobs(clientId),
        getEnrichmentStats(clientId),
        listClientContacts(1, 200, clientId)
      ]);

      setJobs(jobsResponse.data || []);
      setStats(statsResponse);
      setContacts(contactsResponse.data || []);
    } catch (error) {
      console.error('Failed to load enrichment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [clientId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-zinc-400">Loading enrichment data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Zap className="text-emerald-400" size={28} />
            Contact Enrichment
          </h2>
          <p className="text-zinc-400 mt-1">
            Enhance contact data with enriched information from external providers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </Button>
          <Button 
            variant="primary" 
            onClick={() => setIsModalOpen(true)}
            className="gap-2"
          >
            <Plus size={16} />
            New Enrichment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Total Enrichments</span>
            <TrendingUp className="text-cyan-400" size={16} />
          </div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-zinc-400">all time</div>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Pending Jobs</span>
            <Clock className="text-amber-400" size={16} />
          </div>
          <div className="text-2xl font-bold text-white">{stats.pending}</div>
          <div className="text-xs text-amber-400">in queue</div>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Completed</span>
            <CheckCircle2 className="text-emerald-400" size={16} />
          </div>
          <div className="text-2xl font-bold text-white">{stats.completed}</div>
          <div className="text-xs text-emerald-400">successful</div>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Failed</span>
            <AlertCircle className="text-red-400" size={16} />
          </div>
          <div className="text-2xl font-bold text-white">{stats.failed}</div>
          <div className="text-xs text-red-400">errors</div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50 border-b border-zinc-700">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400 uppercase tracking-wide">Contact</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400 uppercase tracking-wide">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400 uppercase tracking-wide">Provider</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400 uppercase tracking-wide">Created</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-zinc-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Zap className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-zinc-400 mb-2">No enrichment jobs</h3>
                    <p className="text-zinc-500 mb-6">Start enriching contacts to enhance your client data</p>
                    <Button 
                      variant="primary" 
                      onClick={() => setIsModalOpen(true)}
                      className="gap-2"
                    >
                      <Plus size={16} />
                      Start First Enrichment
                    </Button>
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.job_id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                          <User className="text-cyan-400" size={16} />
                        </div>
                        <div>
                          <div className="font-medium text-white">{job.contact_name}</div>
                          {job.contact_email && (
                            <div className="text-sm text-zinc-400">{job.contact_email}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <EnrichmentStatusBadge status={job.status} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-zinc-300">FullEnrich</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-zinc-300">
                        <Calendar size={14} />
                        {new Date(job.created_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-1 justify-end">
                        {job.status === 'COMPLETED' && job.enriched_data && (
                          <button className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-white">
                            <Eye size={16} />
                          </button>
                        )}
                        {job.status === 'COMPLETED' && (
                          <button className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-white">
                            <Download size={16} />
                          </button>
                        )}
                        <button className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-red-400">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enrichment Modal */}
      {isModalOpen && (
        <EnrichmentModal
          open={isModalOpen}
          clientId={clientId}
          contacts={contacts}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
