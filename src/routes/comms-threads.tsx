import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  MessageSquare, 
  Clock, 
  User, 
  AlertCircle, 
  CheckCircle, 
  Filter,
  Plus,
  RefreshCw,
  Eye,
  Link as LinkIcon,
  ArrowUpCircle
} from 'lucide-react';
import { PageTitleEditorial } from '../components/PageTitles.tsx';
import { Button } from '../ui/button.tsx';
import { Badge } from '../ui/badge.tsx';
import { 
  listCommsThreads, 
  listPrincipals,
  getThreadStatusColor,
  getProcessStateColor,
  type CommsThread,
  type Principal 
} from '../services/api.ts';
import { formatUtc } from '../utils/date.ts';

interface ThreadsPageState {
  threads: CommsThread[];
  principals: Principal[];
  loading: boolean;
  error: string | null;
  filters: {
    status?: CommsThread['status'];
    process_state?: CommsThread['process_state'];
    assigned_principal_id?: number;
    channel?: 'email' | 'ticket';
  };
  pagination: {
    page: number;
    limit: number;
    total?: number;
  };
}

export default function CommsThreadsPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<ThreadsPageState>({
    threads: [],
    principals: [],
    loading: true,
    error: null,
    filters: {},
    pagination: { page: 1, limit: 20 }
  });

  useEffect(() => {
    loadData();
  }, [state.filters, state.pagination.page]);

  const loadData = async () => {
    try {
      setState(s => ({ ...s, loading: true, error: null }));
      
      const [threadsResponse, principalsResponse] = await Promise.all([
        listCommsThreads({
          ...state.filters,
          page: state.pagination.page,
          limit: state.pagination.limit
        }),
        listPrincipals({ is_active: true })
      ]);

      setState(s => ({
        ...s,
        threads: threadsResponse.data,
        principals: principalsResponse.data,
        loading: false,
        pagination: {
          ...s.pagination,
          total: threadsResponse.meta?.total
        }
      }));
    } catch (error: any) {
      setState(s => ({
        ...s,
        loading: false,
        error: error?.message || 'Failed to load communication threads'
      }));
    }
  };

  const updateFilters = (newFilters: Partial<typeof state.filters>) => {
    setState(s => ({
      ...s,
      filters: { ...s.filters, ...newFilters },
      pagination: { ...s.pagination, page: 1 }
    }));
  };

  const getChannelIcon = (channel: 'email' | 'ticket') => {
    return channel === 'email' ? 
      <Mail size={16} className="text-blue-400" /> : 
      <MessageSquare size={16} className="text-purple-400" />;
  };

  const getStatusBadge = (status: CommsThread['status']) => {
    const colorClass = getThreadStatusColor(status);
    return (
      <Badge variant="muted" className={colorClass}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getProcessStateBadge = (processState: CommsThread['process_state']) => {
    const colorClass = getProcessStateColor(processState);
    return (
      <Badge variant="muted" className={colorClass}>
        {processState.replace('_', ' ')}
      </Badge>
    );
  };

  const getPrincipalName = (principalId?: number) => {
    if (!principalId) return 'Unassigned';
    const principal = state.principals.find(p => p.principal_id === principalId);
    return principal?.display_name || principal?.primary_email || 'Unknown';
  };

  const getUrgencyIndicator = (thread: CommsThread) => {
    // Calculate urgency based on time since last message and status
    const lastMsgDate = new Date(thread.last_msg_at);
    const hoursAgo = (Date.now() - lastMsgDate.getTime()) / (1000 * 60 * 60);
    
    if (thread.status === 'escalated' || hoursAgo > 48) {
      return <AlertCircle size={16} className="text-red-400" />;
    } else if (thread.status === 'pending' || hoursAgo > 24) {
      return <Clock size={16} className="text-amber-400" />;
    } else if (thread.status === 'resolved') {
      return <CheckCircle size={16} className="text-emerald-400" />;
    }
    return null;
  };

  if (state.loading && state.threads.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-zinc-400">Loading communication threads...</span>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Failed to load threads</h2>
        <p className="text-zinc-400 mb-4">{state.error}</p>
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
          eyebrow="Communications Hub"
          title="Message Threads"
          subtitle="Manage email and ticket conversations"
        />
        <div className="flex items-center gap-3">
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
          <Link to="/comms/compose">
            <Button variant="primary">
              <Plus size={16} className="mr-2" />
              New Thread
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Active Threads</p>
              <p className="text-2xl font-bold text-white">
                {state.threads.filter(t => t.status === 'active').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <MessageSquare className="text-blue-400" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Pending</p>
              <p className="text-2xl font-bold text-white">
                {state.threads.filter(t => t.status === 'pending').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
              <Clock className="text-amber-400" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Escalated</p>
              <p className="text-2xl font-bold text-white">
                {state.threads.filter(t => t.status === 'escalated').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
              <ArrowUpCircle className="text-red-400" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Resolved</p>
              <p className="text-2xl font-bold text-white">
                {state.threads.filter(t => t.status === 'resolved').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-emerald-400" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Total</p>
              <p className="text-2xl font-bold text-white">{state.threads.length}</p>
            </div>
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Mail className="text-purple-400" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center gap-4">
          <Filter size={16} className="text-zinc-400" />
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">Status:</span>
            <select
              value={state.filters.status || ''}
              onChange={(e) => updateFilters({ status: e.target.value as CommsThread['status'] || undefined })}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="escalated">Escalated</option>
              <option value="on_hold">On Hold</option>
              <option value="reopened">Reopened</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">Channel:</span>
            <select
              value={state.filters.channel || ''}
              onChange={(e) => updateFilters({ channel: e.target.value as 'email' | 'ticket' || undefined })}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Channels</option>
              <option value="email">Email</option>
              <option value="ticket">Ticket</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">Assigned:</span>
            <select
              value={state.filters.assigned_principal_id || ''}
              onChange={(e) => updateFilters({ assigned_principal_id: Number(e.target.value) || undefined })}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Assignees</option>
              <option value="0">Unassigned</option>
              {state.principals.map(principal => (
                <option key={principal.principal_id} value={principal.principal_id}>
                  {principal.display_name || principal.primary_email}
                </option>
              ))}
            </select>
          </div>

          <div className="ml-auto text-sm text-zinc-400">
            {state.threads.length} thread{state.threads.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Threads Table */}
      <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-modern w-full">
            <thead>
              <tr>
                <th className="w-10"></th>
                <th className="w-16">Channel</th>
                <th>Subject</th>
                <th className="w-32">Status</th>
                <th className="w-32">State</th>
                <th className="w-40">Assigned To</th>
                <th className="w-36">Last Message</th>
                <th className="w-28">Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-zinc-400">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : state.threads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No communication threads found</h3>
                    <p className="text-zinc-400">Start a new conversation or adjust your filters to see threads.</p>
                  </td>
                </tr>
              ) : (
                state.threads.map((thread) => (
                  <tr key={thread.thread_id} className="hover:bg-zinc-800/30">
                    <td>{getUrgencyIndicator(thread)}</td>
                    <td>{getChannelIcon(thread.channel)}</td>
                    <td className="min-w-0">
                      <div className="font-medium text-white truncate">{thread.subject}</div>
                      <div className="text-xs text-zinc-400 mt-1">
                        Thread #{thread.thread_id}
                      </div>
                    </td>
                    <td>{getStatusBadge(thread.status)}</td>
                    <td>{getProcessStateBadge(thread.process_state)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-zinc-400" />
                        <span className="text-sm">{getPrincipalName(thread.assigned_principal_id)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm text-zinc-400">
                        {formatUtc(thread.last_msg_at)}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/comms/threads/${thread.thread_id}`)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {/* Handle quick link */}}
                          className="h-8 w-8 p-0"
                          title="Link to work item"
                        >
                          <LinkIcon size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
