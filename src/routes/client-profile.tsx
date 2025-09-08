import React, { useState } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button.tsx';
import { Input } from '../ui/input.tsx';
import { Avatar } from '../ui/avatar.tsx';
import { Badge } from '../ui/badge.tsx';
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter } from '../ui/dialog.tsx';
import { getClientsOverview, listClientContacts, listAudits, listClientEngagements } from '../services/api.ts';
import type { ClientsOverviewItem } from '../services/models.ts';
import { formatUtc } from '../utils/date.ts';
import { EnrichmentTab } from '../components/EnrichmentTab.tsx';
import { OnboardingTasksTab } from '../components/OnboardingTasksTab.js';
import { 
  Users2, 
  Briefcase, 
  Tag, 
  FileText, 
  ArrowLeft, 
  Search, 
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  Activity,
  Plus,
  Edit3,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
  Globe,
  MessageSquare,
  Settings,
  MoreHorizontal,
  PieChart,
  BarChart3,
  Zap,
  Shield,
  Target,
  Award,
  Eye,
  Download,
  Share2
} from 'lucide-react';

export default function ClientProfileRoute() {
  const params = useParams();
  const navigate = useNavigate();
  const clientId = Number(params.clientId);
  const [client, setClient] = React.useState<ClientsOverviewItem | null>(null);
  const [contacts, setContacts] = React.useState<any[]>([]);
  const [audits, setAudits] = React.useState<any[]>([]);
  const [engagements, setEngagements] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAllTags, setShowAllTags] = useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true); setErr(null);
        const [ovr, cons, aus, eng] = await Promise.all([
          getClientsOverview(500),
          listClientContacts(1, 200, clientId),
          listAudits(1, 50),
          listClientEngagements(1, 200, clientId),
        ]);
        if (cancelled) return;
        const row = (ovr.data || []).find((r: any) => Number(r.client_id) === Number(clientId)) || null;
        setClient(row);
        const consArr = (cons.data || cons || []);
        const filteredCons = Array.isArray(consArr) ? consArr.filter((c:any) => Number(c.client_id) === Number(clientId)) : [];
        setContacts(filteredCons);
        const allAudits = (aus.data || aus || []) as any[];
        setAudits(allAudits.filter(a => Number(a.client_id) === Number(clientId)).slice(0, 50));
        const engList = (eng && (eng.data ?? eng)) || [];
        setEngagements(Array.isArray(engList) ? engList.filter((e:any) => Number(e.client_id) === Number(clientId)) : []);
      } catch (e: any) {
        setErr(e?.message || 'Failed to load client');
      } finally { setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [clientId]);

  const tags = String(client?.tags || '')
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);

  // Calculate metrics
  const completedAudits = audits.filter(a => a.percent_complete === 100).length;
  const activeEngagements = engagements.filter(e => e.status === 'active').length;
  const primaryContact = contacts.find(c => c.is_primary);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-zinc-400">Loading client profile...</span>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Failed to load client</h2>
          <p className="text-zinc-400 mb-4">{err}</p>
          <Button onClick={() => navigate('/clients')} variant="primary">
            <ArrowLeft size={16} className="mr-2" />
            Back to Clients
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">{/* Consistent with other pages */}
      {/* Hero Section */}
      <div className="relative bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/clients')}
              className="p-3 hover:bg-zinc-800/50 rounded-xl transition-all duration-200 group"
            >
              <ArrowLeft size={20} className="text-zinc-400 group-hover:text-white" />
            </button>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center border border-cyan-500/20">
                <Building2 className="text-cyan-400" size={28} />
              </div>
              
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{client?.client_name || 'Test Client'}</h1>
                  <button className="p-2 hover:bg-zinc-800/50 rounded-lg transition-colors text-zinc-400 hover:text-white">
                    <Star size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-4 text-sm text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>Created {client?.created_utc ? formatUtc(client.created_utc) : 'Recently'}</span>
                  </div>
                  {client?.last_activity_utc && (
                    <div className="flex items-center gap-2">
                      <Activity size={14} />
                      <span>Last active {formatUtc(client.last_activity_utc)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Tag size={14} />
                    <span>ID: {client?.client_id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant={client?.is_active ? 'success' : 'muted'} className="px-3 py-1">
              {client?.is_active ? (
                <>
                  <CheckCircle2 size={14} className="mr-1" />
                  Active
                </>
              ) : (
                <>
                  <Clock size={14} className="mr-1" />
                  Inactive
                </>
              )}
            </Badge>
            
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-zinc-800/50 rounded-lg transition-colors text-zinc-400 hover:text-white">
                <Share2 size={16} />
              </button>
              <button className="p-2 hover:bg-zinc-800/50 rounded-lg transition-colors text-zinc-400 hover:text-white">
                <Download size={16} />
              </button>
              <button className="p-2 hover:bg-zinc-800/50 rounded-lg transition-colors text-zinc-400 hover:text-white">
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Engagements</span>
              <Briefcase className="text-cyan-400" size={16} />
            </div>
            <div className="text-2xl font-bold text-white">{engagements.length}</div>
            <div className="text-xs text-emerald-400">{activeEngagements} active</div>
          </div>
          
          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Contacts</span>
              <Users2 className="text-purple-400" size={16} />
            </div>
            <div className="text-2xl font-bold text-white">{contacts.length}</div>
            <div className="text-xs text-zinc-400">{contacts.filter(c => c.is_primary).length} primary</div>
          </div>
          
          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Audits</span>
              <Shield className="text-amber-400" size={16} />
            </div>
            <div className="text-2xl font-bold text-white">{audits.length}</div>
            <div className="text-xs text-emerald-400">{completedAudits} completed</div>
          </div>
          
          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Tasks</span>
              <Target className="text-orange-400" size={16} />
            </div>
            <div className="text-2xl font-bold text-white">{client?.pending_onboarding_tasks ?? 0}</div>
            <div className="text-xs text-zinc-400">onboarding</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-2xl p-2">
        <nav className="flex space-x-2">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'contacts', label: 'Contacts', icon: Users2, count: contacts.length },
            { id: 'onboarding', label: 'Onboarding', icon: CheckCircle2, count: client?.pending_onboarding_tasks ?? 0 },
            { id: 'enrichment', label: 'Enrichment', icon: Zap },
            { id: 'engagements', label: 'Engagements', icon: Briefcase, count: engagements.length },
            { id: 'audits', label: 'Audits', icon: Shield, count: audits.length },
            { id: 'activity', label: 'Activity', icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50'
              }`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id ? 'bg-cyan-500/20 text-cyan-300' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Primary Contact Card */}
            <div className="lg:col-span-2 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Star className="text-amber-400" size={20} />
                  Primary Contact
                </h3>
                <button className="p-2 hover:bg-zinc-800/50 rounded-lg transition-colors text-zinc-400 hover:text-white">
                  <Edit3 size={16} />
                </button>
              </div>
              
              {primaryContact ? (
                <div className="flex items-start gap-4">
                  <Avatar 
                    name={`${primaryContact.first_name || ''} ${primaryContact.last_name || ''}`.trim() || primaryContact.email} 
                    className="w-16 h-16"
                  />
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-white mb-1">
                      {`${primaryContact.first_name || ''} ${primaryContact.last_name || ''}`.trim() || 'Unnamed Contact'}
                    </h4>
                    <p className="text-zinc-400 mb-4">{primaryContact.title || 'Contact'}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {primaryContact.email && (
                        <div className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-lg">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Mail className="text-blue-400" size={16} />
                          </div>
                          <div>
                            <div className="text-xs text-zinc-500">Email</div>
                            <div className="text-sm text-white">{primaryContact.email}</div>
                          </div>
                        </div>
                      )}
                      
                      {primaryContact.phone && (
                        <div className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-lg">
                          <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <Phone className="text-emerald-400" size={16} />
                          </div>
                          <div>
                            <div className="text-xs text-zinc-500">Phone</div>
                            <div className="text-sm text-white">{primaryContact.phone}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users2 className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-zinc-400 mb-2">No primary contact</h4>
                  <p className="text-zinc-500 mb-4">Add a primary contact to improve communication</p>
                  <Button variant="primary" size="sm">
                    <Plus size={16} className="mr-2" />
                    Add Contact
                  </Button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Zap className="text-cyan-400" size={20} />
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-3 bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-all group">
                    <Plus className="text-cyan-400 mb-1" size={18} />
                    <p className="text-xs text-zinc-300 group-hover:text-white">New Engagement</p>
                  </button>
                  <button onClick={() => setActiveTab('enrichment')} className="p-3 bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-all group">
                    <Zap className="text-emerald-400 mb-1" size={18} />
                    <p className="text-xs text-zinc-300 group-hover:text-white">Enrich Contact</p>
                  </button>
                  <button className="p-3 bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-all group">
                    <MessageSquare className="text-purple-400 mb-1" size={18} />
                    <p className="text-xs text-zinc-300 group-hover:text-white">Send Message</p>
                  </button>
                  <button className="p-3 bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-all group">
                    <FileText className="text-amber-400 mb-1" size={18} />
                    <p className="text-xs text-zinc-300 group-hover:text-white">View Documents</p>
                  </button>
                </div>
              </div>

              {/* Company Details */}
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Building2 size={20} className="text-zinc-400" />
                  Company Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Tag className="text-zinc-500 mt-0.5" size={16} />
                    <div>
                      <p className="text-xs text-zinc-500">Client ID</p>
                      <p className="text-sm text-white">{client?.client_id}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Briefcase className="text-zinc-500 mt-0.5" size={16} />
                    <div>
                      <p className="text-xs text-zinc-500">Engagements</p>
                      <p className="text-sm text-white">{engagements.length}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="text-zinc-500 mt-0.5" size={16} />
                    <div>
                      <p className="text-xs text-zinc-500">Created</p>
                      <p className="text-sm text-white">{client?.created_utc ? formatUtc(client.created_utc) : '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Activity className="text-zinc-500 mt-0.5" size={16} />
                    <div>
                      <p className="text-xs text-zinc-500">Last Activity</p>
                      <p className="text-sm text-white">{client?.last_activity_utc ? formatUtc(client.last_activity_utc) : '-'}</p>
                    </div>
                  </div>
                </div>
                <button className="w-full mt-4 px-4 py-2 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-all text-sm text-zinc-400 hover:text-white flex items-center justify-center gap-2">
                  <Settings size={16} />
                  Client Settings
                </button>
              </div>

              {/* Tags */}
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Tag className="text-orange-400" size={20} />
                    Tags
                  </h3>
                  <button className="p-1 hover:bg-zinc-800/50 rounded transition-colors text-zinc-400 hover:text-white">
                    <Plus size={16} />
                  </button>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  {tags.length > 0 ? (
                    <>
                      {tags.slice(0, showAllTags ? tags.length : 5).map(tag => (
                        <span key={tag} className="px-3 py-1 bg-zinc-800/50 text-zinc-300 text-sm rounded-lg border border-zinc-700">
                          {tag}
                        </span>
                      ))}
                      {tags.length > 5 && (
                        <button onClick={() => setShowAllTags(!showAllTags)} className="px-3 py-1 text-xs text-cyan-400 hover:text-cyan-300">
                          {showAllTags ? 'Show less' : `+${tags.length - 5} more`}
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="text-zinc-500 text-sm">No tags assigned</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {contacts.map((contact) => (
              <div key={contact.contact_id} className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <Avatar 
                    name={`${contact.first_name || ''} ${contact.last_name || ''}`.trim() || contact.email}
                    className="w-12 h-12"
                  />
                  {contact.is_primary && (
                    <Badge variant="success" className="text-xs">
                      <Star size={12} className="mr-1" />
                      Primary
                    </Badge>
                  )}
                </div>
                
                <h4 className="text-lg font-semibold text-white mb-1">
                  {`${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Unnamed Contact'}
                </h4>
                <p className="text-zinc-400 text-sm mb-4">{contact.title || 'Contact'}</p>
                
                <div className="space-y-2">
                  {contact.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="text-zinc-500" size={14} />
                      <span className="text-zinc-300">{contact.email}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="text-zinc-500" size={14} />
                      <span className="text-zinc-300">{contact.phone}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 px-3 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors text-sm font-medium">
                    <Mail size={14} className="mr-1" />
                    Email
                  </button>
                  <button className="p-2 hover:bg-zinc-800/50 rounded-lg transition-colors text-zinc-400 hover:text-white">
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              </div>
            ))}
            
            {contacts.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Users2 className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-zinc-400 mb-2">No contacts found</h3>
                <p className="text-zinc-500 mb-6">Add contacts to improve client communication</p>
                <Button variant="primary">
                  <Plus size={16} className="mr-2" />
                  Add Contact
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'onboarding' && (
          <OnboardingTasksTab clientId={clientId} />
        )}

        {activeTab === 'enrichment' && (
          <EnrichmentTab clientId={clientId} />
        )}

        {activeTab === 'engagements' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Engagements</h2>
              <Button variant="primary">
                <Plus size={16} className="mr-2" />
                New Engagement
              </Button>
            </div>
            
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-800/50">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400 uppercase tracking-wide">Title</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400 uppercase tracking-wide">Status</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400 uppercase tracking-wide">Start Date</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400 uppercase tracking-wide">End Date</th>
                      <th className="text-right px-6 py-4 text-sm font-medium text-zinc-400 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {engagements.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <Briefcase className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-zinc-400 mb-2">No engagements</h3>
                          <p className="text-zinc-500">Create your first engagement to get started</p>
                        </td>
                      </tr>
                    )}
                    {engagements.map((engagement) => (
                      <tr key={engagement.engagement_id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">{engagement.title || engagement.name || '-'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={engagement.status === 'active' ? 'success' : 'muted'}>
                            {engagement.status || 'Unknown'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-zinc-300">
                          {(engagement.start_date ?? engagement.start_utc ?? engagement.startDate) 
                            ? new Date(engagement.start_date ?? engagement.start_utc ?? engagement.startDate).toLocaleDateString()
                            : '-'
                          }
                        </td>
                        <td className="px-6 py-4 text-zinc-300">
                          {(engagement.end_date ?? engagement.end_utc ?? engagement.endDate)
                            ? new Date(engagement.end_date ?? engagement.end_utc ?? engagement.endDate).toLocaleDateString()
                            : '-'
                          }
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 hover:bg-zinc-800/50 rounded-lg transition-colors text-zinc-400 hover:text-white">
                            <ExternalLink size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audits' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Audit History</h2>
              <div className="flex gap-3">
                <Button variant="outline">
                  <BarChart3 size={16} className="mr-2" />
                  Analytics
                </Button>
                <Button variant="primary">
                  <Plus size={16} className="mr-2" />
                  New Audit
                </Button>
              </div>
            </div>
            
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-800/50">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400 uppercase tracking-wide">Title</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400 uppercase tracking-wide">Phase</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400 uppercase tracking-wide">Progress</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400 uppercase tracking-wide">Updated</th>
                      <th className="text-right px-6 py-4 text-sm font-medium text-zinc-400 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {audits.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <Shield className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-zinc-400 mb-2">No audits found</h3>
                          <p className="text-zinc-500">Audits will appear here once they're created</p>
                        </td>
                      </tr>
                    )}
                    {audits.map((audit) => (
                      <tr key={audit.audit_id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">{audit.title || '-'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-zinc-300">{audit.phase || '-'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-zinc-800 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${audit.percent_complete || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-zinc-300 min-w-[3rem]">
                              {typeof audit.percent_complete === 'number' ? `${audit.percent_complete}%` : '-'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-zinc-300">
                          {audit.updated_utc ? formatUtc(audit.updated_utc) : '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 hover:bg-zinc-800/50 rounded-lg transition-colors text-zinc-400 hover:text-white">
                            <ExternalLink size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
            
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6">
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-zinc-400 mb-2">Activity Timeline</h3>
                <p className="text-zinc-500">Activity tracking will be implemented soon</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
