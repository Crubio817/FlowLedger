import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  MessageSquare, 
  User, 
  Clock, 
  Paperclip,
  Send,
  Link as LinkIcon,
  AlertCircle,
  RefreshCw,
  MoreVertical,
  Download,
  FileText
} from 'lucide-react';
import { PageTitleEditorial } from '../components/PageTitles.tsx';
import { Button } from '../ui/button.tsx';
import { Badge } from '../ui/badge.tsx';
import { 
  getCommsThread,
  updateCommsThread,
  replyToCommsThread,
  listPrincipals,
  getThreadStatusColor,
  getProcessStateColor,
  canTransitionThreadStatus,
  type CommsThread,
  type CommsMessage,
  type Principal 
} from '../services/api.ts';
import { formatUtc } from '../utils/date.ts';

interface ThreadDetailState {
  thread: (CommsThread & { messages?: CommsMessage[] }) | null;
  principals: Principal[];
  loading: boolean;
  error: string | null;
  replyText: string;
  sending: boolean;
  updating: boolean;
}

export default function CommsThreadDetailPage() {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<ThreadDetailState>({
    thread: null,
    principals: [],
    loading: true,
    error: null,
    replyText: '',
    sending: false,
    updating: false
  });

  useEffect(() => {
    if (threadId) {
      loadData();
    }
  }, [threadId]);

  const loadData = async () => {
    if (!threadId) return;
    
    try {
      setState(s => ({ ...s, loading: true, error: null }));
      
      const [threadData, principalsData] = await Promise.all([
        getCommsThread(Number(threadId)),
        listPrincipals({ is_active: true })
      ]);

      setState(s => ({
        ...s,
        thread: threadData,
        principals: principalsData.data,
        loading: false
      }));
    } catch (error: any) {
      setState(s => ({
        ...s,
        loading: false,
        error: error?.message || 'Failed to load thread details'
      }));
    }
  };

  const updateThreadStatus = async (status: CommsThread['status']) => {
    if (!state.thread || !canTransitionThreadStatus(state.thread.status, status)) return;
    
    try {
      setState(s => ({ ...s, updating: true }));
      const updatedThread = await updateCommsThread(state.thread.thread_id, { status });
      setState(s => ({ ...s, thread: { ...s.thread!, ...updatedThread }, updating: false }));
    } catch (error: any) {
      setState(s => ({ ...s, updating: false }));
      // Error already handled by withErrors
    }
  };

  const updateThreadAssignment = async (assignedPrincipalId?: number) => {
    if (!state.thread) return;
    
    try {
      setState(s => ({ ...s, updating: true }));
      const updatedThread = await updateCommsThread(state.thread.thread_id, { 
        assigned_principal_id: assignedPrincipalId 
      });
      setState(s => ({ ...s, thread: { ...s.thread!, ...updatedThread }, updating: false }));
    } catch (error: any) {
      setState(s => ({ ...s, updating: false }));
    }
  };

  const sendReply = async () => {
    if (!state.thread || !state.replyText.trim()) return;
    
    try {
      setState(s => ({ ...s, sending: true }));
      await replyToCommsThread(state.thread.thread_id, { body: state.replyText });
      setState(s => ({ ...s, replyText: '', sending: false }));
      // Reload to get the new message
      await loadData();
    } catch (error: any) {
      setState(s => ({ ...s, sending: false }));
    }
  };

  const getStatusTransitions = (currentStatus: CommsThread['status']): CommsThread['status'][] => {
    const allStatuses: CommsThread['status'][] = ['active', 'pending', 'resolved', 'escalated', 'on_hold', 'reopened'];
    return allStatuses.filter(status => 
      status !== currentStatus && canTransitionThreadStatus(currentStatus, status)
    );
  };

  const getPrincipalName = (principalId?: number) => {
    if (!principalId) return 'Unassigned';
    const principal = state.principals.find(p => p.principal_id === principalId);
    return principal?.display_name || principal?.primary_email || 'Unknown';
  };

  const getChannelIcon = (channel: 'email' | 'ticket') => {
    return channel === 'email' ? 
      <Mail size={20} className="text-blue-400" /> : 
      <MessageSquare size={20} className="text-purple-400" />;
  };

  if (state.loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-zinc-400">Loading thread details...</span>
        </div>
      </div>
    );
  }

  if (state.error || !state.thread) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Failed to load thread</h2>
        <p className="text-zinc-400 mb-4">{state.error || 'Thread not found'}</p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={() => navigate('/comms/threads')} variant="outline">
            <ArrowLeft size={16} className="mr-2" />
            Back to Threads
          </Button>
          <Button onClick={loadData} variant="primary">
            <RefreshCw size={16} className="mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/comms/threads')}
            className="p-2"
          >
            <ArrowLeft size={16} />
          </Button>
          <div>
            <PageTitleEditorial
              eyebrow="Communication Thread"
              title={state.thread.subject}
              subtitle={`Thread #${state.thread.thread_id}`}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={loadData} variant="outline" size="sm" disabled={state.updating}>
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Messages */}
          <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl">
            <div className="p-4 border-b border-zinc-800">
              <h3 className="text-lg font-semibold text-white">Messages</h3>
            </div>
            <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
              {state.thread.messages?.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
                  <p className="text-zinc-400">No messages yet</p>
                </div>
              ) : (
                state.thread.messages?.map((message) => (
                  <div 
                    key={message.message_id} 
                    className={`flex gap-3 ${message.direction === 'out' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      message.direction === 'out' 
                        ? 'bg-cyan-500/20 text-cyan-400' 
                        : 'bg-zinc-700 text-zinc-300'
                    }`}>
                      {message.direction === 'out' ? <Send size={16} /> : <User size={16} />}
                    </div>
                    <div className={`flex-1 min-w-0 ${message.direction === 'out' ? 'text-right' : ''}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-white">
                          {message.direction === 'out' ? 'You' : 'External'}
                        </span>
                        <span className="text-xs text-zinc-400">
                          {formatUtc(message.sent_at)}
                        </span>
                        {message.has_attachments && (
                          <Paperclip size={12} className="text-zinc-400" />
                        )}
                      </div>
                      <div className={`p-3 rounded-lg ${
                        message.direction === 'out' 
                          ? 'bg-cyan-500/20 border border-cyan-500/30' 
                          : 'bg-zinc-800/50 border border-zinc-700'
                      }`}>
                        {message.snippet ? (
                          <p className="text-sm text-white">{message.snippet}</p>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-zinc-400">
                            <FileText size={12} />
                            <span>Message content available in full view</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Reply Box */}
          <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl">
            <div className="p-4 border-b border-zinc-800">
              <h3 className="text-lg font-semibold text-white">Reply</h3>
            </div>
            <div className="p-4">
              <textarea
                value={state.replyText}
                onChange={(e) => setState(s => ({ ...s, replyText: e.target.value }))}
                placeholder="Type your reply..."
                className="w-full h-32 px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-cyan-500 resize-none"
              />
              <div className="flex items-center justify-between mt-4">
                <Button variant="ghost" size="sm">
                  <Paperclip size={16} className="mr-2" />
                  Attach Files
                </Button>
                <Button 
                  onClick={sendReply} 
                  disabled={!state.replyText.trim() || state.sending}
                  variant="primary"
                >
                  {state.sending ? (
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                  ) : (
                    <Send size={16} className="mr-2" />
                  )}
                  Send Reply
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Thread Info */}
          <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Thread Details</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {getChannelIcon(state.thread.channel)}
                <div>
                  <p className="text-sm font-medium text-white">Channel</p>
                  <p className="text-xs text-zinc-400 capitalize">{state.thread.channel}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center">
                  <Clock size={16} className="text-zinc-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Last Message</p>
                  <p className="text-xs text-zinc-400">{formatUtc(state.thread.last_msg_at)}</p>
                </div>
              </div>

              {state.thread.first_msg_at && (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <Clock size={16} className="text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Started</p>
                    <p className="text-xs text-zinc-400">{formatUtc(state.thread.first_msg_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Management */}
          <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Status</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-white mb-2">Current Status</p>
                <Badge variant="muted" className={getThreadStatusColor(state.thread.status)}>
                  {state.thread.status.replace('_', ' ')}
                </Badge>
              </div>
              
              <div>
                <p className="text-sm font-medium text-white mb-2">Process State</p>
                <Badge variant="muted" className={getProcessStateColor(state.thread.process_state)}>
                  {state.thread.process_state.replace('_', ' ')}
                </Badge>
              </div>

              <div>
                <p className="text-sm font-medium text-white mb-2">Change Status</p>
                <div className="space-y-2">
                  {getStatusTransitions(state.thread.status).map(status => (
                    <Button
                      key={status}
                      size="sm"
                      variant="outline"
                      onClick={() => updateThreadStatus(status)}
                      disabled={state.updating}
                      className="w-full justify-start"
                    >
                      {status.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Assignment */}
          <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Assignment</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-white mb-2">Assigned To</p>
                <div className="flex items-center gap-2">
                  <User size={16} className="text-zinc-400" />
                  <span className="text-sm">{getPrincipalName(state.thread.assigned_principal_id)}</span>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-white mb-2">Change Assignment</p>
                <select
                  value={state.thread.assigned_principal_id || ''}
                  onChange={(e) => updateThreadAssignment(Number(e.target.value) || undefined)}
                  disabled={state.updating}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Unassigned</option>
                  {state.principals.map(principal => (
                    <option key={principal.principal_id} value={principal.principal_id}>
                      {principal.display_name || principal.primary_email}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <LinkIcon size={16} className="mr-2" />
                Link to Work Item
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download size={16} className="mr-2" />
                Export Thread
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
