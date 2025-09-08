import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Eye,
  Edit,
  Trash2,
  Building2,
  Users,
  CheckCircle2,
  Clock,
  Activity,
  Copy,
  Check,
  X,
  Mail
} from 'lucide-react';
import { getClientsOverview, getDashboardStats, updateClient, deleteClient } from '../services/api.ts';
import type { ClientsOverviewItem, DashboardStats } from '../services/models.ts';
import { toast } from '../lib/toast.ts';
import KpiCard from './KpiCard.tsx';
import { ConfirmDialog } from './common/ConfirmDialog.tsx';

interface ClientTableFilters {
  search: string;
  status: string;
  hasEngagements: string;
  tags: string;
}

interface ClientColumnVisibility {
  name: boolean;
  primaryContact: boolean;
  tags: boolean;
  engagements: boolean;
  onboarding: boolean;
  status: boolean;
  lastActivity: boolean;
  actions: boolean;
}

const ClientsAdvancedTable: React.FC = () => {
  const [clients, setClients] = useState<ClientsOverviewItem[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ClientTableFilters>({
    search: '',
    status: '',
    hasEngagements: '',
    tags: ''
  });
  
  const [columnVisibility, setColumnVisibility] = useState<ClientColumnVisibility>({
    name: true,
    primaryContact: true,
    tags: true,
    engagements: true,
    onboarding: true,
    status: true,
    lastActivity: true,
    actions: true
  });

  const [sortConfig, setSortConfig] = useState<{
    key: keyof ClientsOverviewItem | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedClients, setSelectedClients] = useState<Set<number>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [copiedEmail, setCopiedEmail] = useState<number | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    clientId: number | null;
    clientName: string;
    isActive: boolean;
  }>({ open: false, clientId: null, clientName: '', isActive: false });
  const [processingAction, setProcessingAction] = useState(false);
  const [processingDelete, setProcessingDelete] = useState(false);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [clientsResponse, statsResponse] = await Promise.all([
          getClientsOverview(200),
          getDashboardStats()
        ]);
        
        if (clientsResponse?.data) {
          setClients(clientsResponse.data);
        }
        
        if (statsResponse) {
          setDashboardStats(statsResponse);
        }
      } catch (error) {
        toast.error('Failed to load clients data');
        console.error('Error loading clients:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Unique values for filters
  const uniqueStatuses = ['Active', 'Inactive'];
  const uniqueEngagementStatuses = ['With Engagements', 'No Engagements'];
  const uniqueTagStatuses = ['With Tags', 'No Tags'];

  // Filter and sort clients
  const filteredAndSortedClients = useMemo(() => {
    let filtered = clients.filter(client => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          client.client_name.toLowerCase().includes(searchLower) ||
          client.primary_contact_name?.toLowerCase().includes(searchLower) ||
          client.primary_contact_email?.toLowerCase().includes(searchLower) ||
          client.tags?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status) {
        if (filters.status === 'Active' && !client.is_active) return false;
        if (filters.status === 'Inactive' && client.is_active) return false;
      }

      // Engagements filter
      if (filters.hasEngagements) {
        const hasEngagements = (client.engagement_count || 0) > 0;
        if (filters.hasEngagements === 'With Engagements' && !hasEngagements) return false;
        if (filters.hasEngagements === 'No Engagements' && hasEngagements) return false;
      }

      // Tags filter
      if (filters.tags) {
        const hasTags = client.tags && client.tags.trim().length > 0;
        if (filters.tags === 'With Tags' && !hasTags) return false;
        if (filters.tags === 'No Tags' && hasTags) return false;
      }

      return true;
    });

    // Sort
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key!];
        const bVal = b[sortConfig.key!];
        
        let comparison = 0;
        if (aVal != null && bVal != null) {
          if (aVal < bVal) comparison = -1;
          if (aVal > bVal) comparison = 1;
        } else if (aVal == null && bVal != null) {
          comparison = 1;
        } else if (aVal != null && bVal == null) {
          comparison = -1;
        }
        
        return sortConfig.direction === 'desc' ? comparison * -1 : comparison;
      });
    }

    return filtered;
  }, [clients, filters, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedClients.length / pageSize);
  const paginatedClients = filteredAndSortedClients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handlers
  const handleSort = (key: keyof ClientsOverviewItem) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectClient = (clientId: number) => {
    setSelectedClients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clientId)) {
        newSet.delete(clientId);
      } else {
        newSet.add(clientId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedClients.size === paginatedClients.length && paginatedClients.length > 0) {
      setSelectedClients(new Set());
    } else {
      setSelectedClients(new Set(paginatedClients.map(c => c.client_id)));
    }
  };

  const toggleRowExpansion = (clientId: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clientId)) {
        newSet.delete(clientId);
      } else {
        newSet.add(clientId);
      }
      return newSet;
    });
  };

  const copyEmail = (email: string, id: number) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(id);
    setTimeout(() => setCopiedEmail(null), 2000);
    toast.success('Email copied to clipboard');
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      hasEngagements: '',
      tags: ''
    });
  };

  const handleDeactivateClient = async () => {
    if (!confirmDialog.clientId) return;
    
    try {
      setProcessingAction(true);
      await updateClient(confirmDialog.clientId, { is_active: false });
      
      // Update local state
      setClients(prev => prev.map(client => 
        client.client_id === confirmDialog.clientId 
          ? { ...client, is_active: false }
          : client
      ));
      
      toast.success(`${confirmDialog.clientName} has been deactivated`);
      setConfirmDialog({ open: false, clientId: null, clientName: '', isActive: false });
    } catch (error) {
      toast.error('Failed to deactivate client');
      console.error('Error deactivating client:', error);
    } finally {
      setProcessingAction(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!confirmDialog.clientId) return;
    
    try {
      setProcessingDelete(true);
      console.log('Attempting to delete client:', confirmDialog.clientId);
      await deleteClient(confirmDialog.clientId);
      
      // Remove from local state
      setClients(prev => prev.filter(client => client.client_id !== confirmDialog.clientId));
      
      toast.success(`${confirmDialog.clientName} has been permanently deleted`);
      setConfirmDialog({ open: false, clientId: null, clientName: '', isActive: false });
    } catch (error) {
      console.error('Delete client error:', error);
      toast.error('Failed to delete client');
      console.error('Error deleting client:', error);
    } finally {
      setProcessingDelete(false);
    }
  };

  const showDeactivateDialog = (client: ClientsOverviewItem) => {
    setConfirmDialog({
      open: true,
      clientId: client.client_id,
      clientName: client.client_name,
      isActive: client.is_active
    });
  };

  const hasActiveFilters = filters.search || filters.status || filters.hasEngagements || filters.tags;

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
  };

  const getOnboardingProgress = (pendingTasks: number | null | undefined) => {
    if (!pendingTasks || pendingTasks === 0) return 100;
    const totalTasks = 10;
    const completedTasks = totalTasks - pendingTasks;
    return Math.max(0, (completedTasks / totalTasks) * 100);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-zinc-800/50 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-zinc-800/50 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active Clients"
          value={dashboardStats?.active_clients ?? 0}
          icon={<Building2 className="w-5 h-5" />}
          tint="#22c55e"
        />
        <KpiCard
          title="Total Clients"
          value={clients.length}
          icon={<Users className="w-5 h-5" />}
          tint="#3b82f6"
        />
        <KpiCard
          title="With Engagements"
          value={clients.filter(c => (c.engagement_count || 0) > 0).length}
          icon={<CheckCircle2 className="w-5 h-5" />}
          tint="#0ea5e9"
        />
        <KpiCard
          title="Pending Onboarding"
          value={clients.reduce((sum, c) => sum + (c.pending_onboarding_tasks || 0), 0)}
          icon={<Clock className="w-5 h-5" />}
          tint="#f59e0b"
        />
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-2 text-sm"
            >
              <X size={14} />
              Clear filters
            </button>
          )}
          <span className="text-sm text-zinc-500">
            {filteredAndSortedClients.length} results
          </span>
        </div>
        <div />
      </div>

      {/* Main Table */}
      <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50 border-b border-zinc-700">
              <tr>
                {/* Removed select-all checkbox column */}
                
                {columnVisibility.name && (
                  <th className="text-left px-4 py-3">
                    <div className="space-y-2">
                      <div 
                        className="text-xs font-bold text-zinc-300 uppercase tracking-wider cursor-pointer hover:text-[#4997D0] transition-colors flex items-center gap-2"
                        onClick={() => handleSort('client_name')}
                      >
                        <Building2 size={14} className="text-[#4997D0]" />
                        Client
                        {sortConfig.key === 'client_name' && (
                          <span className="text-[#4997D0]">
                            {sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                        <input
                          type="text"
                          placeholder="Search clients..."
                          value={filters.search}
                          onChange={(e) => setFilters({...filters, search: e.target.value})}
                          className="w-full pl-7 pr-2 py-1.5 text-xs bg-zinc-800/70 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-[#4997D0]/50 focus:bg-zinc-800 transition-all"
                        />
                      </div>
                    </div>
                  </th>
                )}

                {columnVisibility.primaryContact && (
                  <th className="text-left px-4 py-3 text-sm font-medium text-zinc-300">Primary Contact</th>
                )}

                {columnVisibility.tags && (
                  <th className="text-left px-4 py-3">
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Tags</div>
                      <select
                        value={filters.tags}
                        onChange={(e) => setFilters({...filters, tags: e.target.value})}
                        className="w-full px-2 py-1.5 text-xs bg-zinc-800/70 border border-zinc-700/50 rounded-lg text-white focus:outline-none focus:border-[#4997D0]/50 focus:bg-zinc-800 transition-all"
                      >
                        <option value="">All Tags</option>
                        {uniqueTagStatuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </th>
                )}

                {columnVisibility.engagements && (
                  <th className="text-left px-4 py-3">
                    <div className="space-y-2">
                      <div 
                        className="text-xs font-bold text-zinc-300 uppercase tracking-wider cursor-pointer hover:text-[#4997D0] transition-colors flex items-center gap-2"
                        onClick={() => handleSort('engagement_count')}
                      >
                        Engagements
                        {sortConfig.key === 'engagement_count' && (
                          <span className="text-[#4997D0]">
                            {sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </span>
                        )}
                      </div>
                      <select
                        value={filters.hasEngagements}
                        onChange={(e) => setFilters({...filters, hasEngagements: e.target.value})}
                        className="w-full px-2 py-1.5 text-xs bg-zinc-800/70 border border-zinc-700/50 rounded-lg text-white focus:outline-none focus:border-[#4997D0]/50 focus:bg-zinc-800 transition-all"
                      >
                        <option value="">All Engagements</option>
                        {uniqueEngagementStatuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </th>
                )}

                {columnVisibility.onboarding && (
                  <th className="text-left px-4 py-3 text-sm font-medium text-zinc-300">Onboarding</th>
                )}

                {columnVisibility.status && (
                  <th className="text-left px-4 py-3">
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Status</div>
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters({...filters, status: e.target.value})}
                        className="w-full px-2 py-1.5 text-xs bg-zinc-800/70 border border-zinc-700/50 rounded-lg text-white focus:outline-none focus:border-[#4997D0]/50 focus:bg-zinc-800 transition-all"
                      >
                        <option value="">All Status</option>
                        {uniqueStatuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </th>
                )}

                {columnVisibility.lastActivity && (
                  <th className="text-left px-4 py-3">
                    <div 
                      className="text-xs font-bold text-zinc-300 uppercase tracking-wider cursor-pointer hover:text-[#4997D0] transition-colors flex items-center gap-2"
                      onClick={() => handleSort('last_activity_utc')}
                    >
                      Last Activity
                      {sortConfig.key === 'last_activity_utc' && (
                        <span className="text-[#4997D0]">
                          {sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </span>
                      )}
                    </div>
                  </th>
                )}

                {columnVisibility.actions && (
                  <th className="text-center px-4 py-3 text-sm font-medium text-zinc-300">Actions</th>
                )}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-zinc-800/50">
              {paginatedClients.map((client) => (
                <React.Fragment key={client.client_id}>
                  <tr 
                    className="hover:bg-zinc-800/30 transition-colors group cursor-pointer"
                    onClick={() => toggleRowExpansion(client.client_id)}
                  >
                    {/* Removed per-row checkbox */}
                    
                    {columnVisibility.name && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {client.logo_url ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                              <img 
                                src={client.logo_url} 
                                alt={`${client.client_name} logo`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback to initials if logo fails to load
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              <div className="w-full h-full hidden bg-gradient-to-br from-[#4997D0] to-cyan-500 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                  {client.client_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#4997D0] to-cyan-500 flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-sm">
                                {client.client_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-zinc-100">{client.client_name}</div>
                          </div>
                        </div>
                      </td>
                    )}

                    {columnVisibility.primaryContact && (
                      <td className="px-4 py-3">
                        {client.primary_contact_name || client.primary_contact_email ? (
                          <div>
                            {client.primary_contact_name && (
                              <div className="text-zinc-100">{client.primary_contact_name}</div>
                            )}
                            {client.primary_contact_email && (
                              <div className="flex items-center gap-1">
                                <span className="text-sm text-zinc-400">{client.primary_contact_email}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyEmail(client.primary_contact_email!, client.client_id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  {copiedEmail === client.client_id ? (
                                    <Check size={14} className="text-emerald-400" />
                                  ) : (
                                    <Copy size={14} className="text-zinc-500 hover:text-[#4997D0]" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-zinc-500">—</span>
                        )}
                      </td>
                    )}

                    {columnVisibility.tags && (
                      <td className="px-4 py-3">
                        {client.tags ? (
                          <div className="flex flex-wrap gap-1">
                            {client.tags.split(',').slice(0, 2).map((tag, idx) => (
                              <span key={idx} className="px-2 py-1 bg-zinc-700/50 text-zinc-300 text-xs rounded">
                                {tag.trim()}
                              </span>
                            ))}
                            {client.tags.split(',').length > 2 && (
                              <span className="px-2 py-1 bg-zinc-700/50 text-zinc-400 text-xs rounded">
                                +{client.tags.split(',').length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-zinc-500">—</span>
                        )}
                      </td>
                    )}

                    {columnVisibility.engagements && (
                      <td className="px-4 py-3">
                        <span className="text-zinc-100">{client.engagement_count || 0}</span>
                      </td>
                    )}

                    {columnVisibility.onboarding && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 max-w-[100px]">
                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-[#4997D0] to-cyan-500 rounded-full transition-all duration-1000"
                                style={{ width: `${getOnboardingProgress(client.pending_onboarding_tasks)}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-xs text-white min-w-[35px]">
                            {Math.round(getOnboardingProgress(client.pending_onboarding_tasks))}%
                          </span>
                        </div>
                        {client.pending_onboarding_tasks && client.pending_onboarding_tasks > 0 && (
                          <div className="text-xs text-orange-400 mt-1">
                            {client.pending_onboarding_tasks} pending
                          </div>
                        )}
                      </td>
                    )}

                    {columnVisibility.status && (
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          client.is_active 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {client.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    )}

                    {columnVisibility.lastActivity && (
                      <td className="px-4 py-3 text-zinc-400">
                        {formatDate(client.last_activity_utc)}
                      </td>
                    )}

                    {columnVisibility.actions && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-center">
                          {/* View -> navigate to client profile */}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `/clients/${client.client_id}`;
                            }}
                            className="p-2 bg-zinc-800 hover:bg-[#4997D0]/20 rounded-lg transition-all hover:text-[#4997D0]"
                          >
                            <Eye size={14} />
                          </button>
                          {/* Edit removed per request */}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Delete button clicked for client:', client.client_id);
                              showDeactivateDialog(client);
                            }}
                            className="p-2 bg-zinc-800 hover:bg-red-500/20 rounded-lg transition-all hover:text-red-400"
                            title="Deactivate or delete client"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                  {/* Expandable Row */}
                  {expandedRows.has(client.client_id) && (
                  <tr className="bg-zinc-800/20">
                      <td colSpan={Object.values(columnVisibility).filter(Boolean).length} className="px-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h4 className="font-medium text-zinc-200 mb-2">Client Details</h4>
                            <div className="space-y-1 text-zinc-400">
                              <div>Created: {formatDate(client.created_utc)}</div>
                              {client.tags && (
                                <div>
                                  Tags: 
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {client.tags.split(',').map((tag, idx) => (
                                      <span key={idx} className="px-2 py-1 bg-zinc-700 text-zinc-300 text-xs rounded">
                                        {tag.trim()}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-zinc-200 mb-2">Quick Actions</h4>
                            <div className="flex flex-wrap gap-2">
                              <button 
                                onClick={() => { window.location.href = `/clients/${client.client_id}`; }}
                                className="px-3 py-1 bg-[#4997D0]/20 text-[#4997D0] text-xs rounded hover:bg-[#4997D0]/30 transition-colors"
                              >
                                View Profile
                              </button>
                              {client.primary_contact_email && (
                                <button 
                                  onClick={() => window.open(`mailto:${client.primary_contact_email}`)}
                                  className="px-3 py-1 bg-zinc-700 text-zinc-300 text-xs rounded hover:bg-zinc-600 transition-colors flex items-center gap-1"
                                >
                                  <Mail className="w-3 h-3" />
                                  Email
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800/50">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg text-sm transition-all ${
                      currentPage === page 
                        ? 'bg-[#4997D0] text-white' 
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            
            <div className="text-sm text-zinc-400">
              {filteredAndSortedClients.length} total clients
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredAndSortedClients.length === 0 && !loading && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-300 mb-2">No clients found</h3>
          <p className="text-zinc-500 mb-4">
            {hasActiveFilters
              ? 'Try adjusting your filters to see more results.'
              : 'No clients available.'}
          </p>
        </div>
      )}
      
      {/* Deactivate Client Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title="Client Action Required"
        description={`What would you like to do with "${confirmDialog.clientName}"? You can deactivate to preserve data or permanently delete.`}
        confirmText="Deactivate"
        cancelText="Cancel"
        onConfirm={handleDeactivateClient}
        onCancel={() => setConfirmDialog({ open: false, clientId: null, clientName: '', isActive: false })}
        confirming={processingAction}
        showSecondaryAction={true}
        secondaryText="Delete Permanently"
        onSecondaryAction={handleDeleteClient}
        secondaryConfirming={processingDelete}
        clientName={confirmDialog.clientName}
      />
    </div>
  );
};

export default ClientsAdvancedTable;
