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
  Sparkles,
  Star,
  Phone,
  MapPin,
  Calendar,
  BarChart3,
  Target,
  Award,
  Mail
} from 'lucide-react';
import { getClientsOverview, getDashboardStats, updateClient, deleteClient } from '../services/api.ts';
import type { ClientsOverviewItem, DashboardStats } from '../services/models.ts';
import { toast } from '../lib/toast.ts';
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
  const [pageSize] = useState(6); // Match advanced table pagination
  const [selectedClients, setSelectedClients] = useState<Set<number>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<number | null>(null);
  const [animatingRows, setAnimatingRows] = useState(new Set());
  const [tableVisible, setTableVisible] = useState(false);
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

  // Animate table on mount
  useEffect(() => {
    const timer = setTimeout(() => setTableVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Unique values for filters
  const uniqueStatuses = ['Active', 'Inactive'];
  const uniqueEngagementStatuses = ['With Engagements', 'No Engagements'];
  const uniqueTagStatuses = ['With Tags', 'No Tags'];

  // Filter and sort clients
  const filteredAndSortedClients = useMemo(() => {
    let filtered = clients.filter(client => {
      // Search filter (name, email, tags)
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

  // Add animation when data changes
  useEffect(() => {
    const newAnimating = new Set(paginatedClients.map(item => item.client_id));
    setAnimatingRows(newAnimating);
    const timer = setTimeout(() => setAnimatingRows(new Set()), 600);
    return () => clearTimeout(timer);
  }, [currentPage, paginatedClients]);

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

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      hasEngagements: '',
      tags: ''
    });
  };

  const hasActiveFilters = filters.search || filters.status || filters.hasEngagements || filters.tags;

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
  };

  const getOnboardingProgress = (pendingTasks: number | null | undefined) => {
    if (!pendingTasks || pendingTasks === 0) return 100;
    // Assume 10 total tasks for demo purposes
    const totalTasks = 10;
    const completedTasks = totalTasks - pendingTasks;
    return Math.max(0, (completedTasks / totalTasks) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#101010] p-8">
        <div className="animate-pulse space-y-6 max-w-7xl mx-auto">
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
    <div className="min-h-screen bg-[#101010] p-8">
      {/* Animated background */}
      <div 
        className="fixed inset-0 overflow-hidden pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.012) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      >
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-[#4997D0]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-[#4997D0]/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '700ms'}}></div>
      </div>
      
      <div className={`max-w-7xl mx-auto relative z-10 transition-all duration-1000 ${tableVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-white via-[#4997D0] to-cyan-400 bg-clip-text text-transparent mb-3 flex items-center gap-3">
              Client Management
              <Sparkles className="text-[#4997D0] animate-pulse" size={32} />
            </h1>
            <p className="text-zinc-400 text-lg">Comprehensive client overview and engagement tracking</p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl">
              <div className="flex items-center gap-2">
                <Activity className="text-[#4997D0]" size={16} />
                <span className="text-zinc-400 text-sm">Active Clients</span>
                <span className="text-white font-bold">{dashboardStats?.active_clients ?? '—'}</span>
              </div>
            </div>
            <div className="px-4 py-2 bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl">
              <div className="flex items-center gap-2">
                <Users className="text-amber-400" size={16} />
                <span className="text-zinc-400 text-sm">Total Clients</span>
                <span className="text-white font-bold">{clients.length}</span>
              </div>
            </div>
            <div className="px-4 py-2 bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-400" size={16} />
                <span className="text-zinc-400 text-sm">With Engagements</span>
                <span className="text-white font-bold">{clients.filter(c => (c.engagement_count || 0) > 0).length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
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
            {selectedClients.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#4997D0]">{selectedClients.size} selected</span>
                <button className="px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-red-400 hover:bg-red-500/20 transition-all">
                  <Trash2 size={14} />
                </button>
                <button className="px-2 py-1 bg-[#4997D0]/10 border border-[#4997D0]/20 rounded text-[#4997D0] hover:bg-[#4997D0]/20 transition-all">
                  <Download size={14} />
                </button>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            {/* Column visibility toggle */}
            <div className="relative group">
              <button className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all flex items-center gap-2">
                <Eye size={18} />
                <span>Columns</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                {Object.entries(columnVisibility).map(([col, visible]) => (
                  <label key={col} className="flex items-center gap-2 p-2 hover:bg-zinc-800 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visible}
                      onChange={() => setColumnVisibility({...columnVisibility, [col]: !visible})}
                      className="rounded border-zinc-600 bg-zinc-800 text-[#4997D0]"
                    />
                    <span className="text-sm text-zinc-300 capitalize">{col}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <button className="px-5 py-2.5 bg-gradient-to-r from-[#4997D0] to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#4997D0]/30 transition-all transform hover:scale-105">
              <span className="flex items-center gap-2">
                <Sparkles size={18} />
                Add Client
              </span>
            </button>
          </div>
        </div>

        {/* Main Table */}
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#4997D0]/10 via-[#4997D0]/5 to-[#4997D0]/10 rounded-3xl blur-xl"></div>
          
          <div className="relative bg-zinc-950/90 backdrop-blur-xl border border-zinc-800/50 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-zinc-900 border-b border-zinc-800">
                    <th className="p-4 sticky left-0 bg-zinc-900 z-10">
                      <input
                        type="checkbox"
                        checked={selectedClients.size === paginatedClients.length && paginatedClients.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-[#4997D0]"
                      />
                    </th>
                    
                    {columnVisibility.name && (
                      <th className="p-4 text-left">
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
                              className="w-full pl-7 pr-2 py-1.5 text-xs bg-zinc-800/70 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-[#4997D0]/50 focus:bg-zinc-800 focus:shadow-lg focus:shadow-[#4997D0]/10 transition-all"
                            />
                          </div>
                        </div>
                      </th>
                    )}

                    {columnVisibility.primaryContact && (
                      <th className="p-4 text-left">
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                            <Mail size={14} className="text-purple-400" />
                            Primary Contact
                          </div>
                          <div className="h-7"></div>
                        </div>
                      </th>
                    )}

                    {columnVisibility.tags && (
                      <th className="p-4 text-left">
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                            <Star size={14} className="text-amber-400" />
                            Tags
                          </div>
                          <select
                            value={filters.tags}
                            onChange={(e) => setFilters({...filters, tags: e.target.value})}
                            className="w-full px-2 py-1.5 text-xs bg-zinc-800/70 border border-zinc-700/50 rounded-lg text-white focus:outline-none focus:border-[#4997D0]/50 focus:bg-zinc-800 transition-all appearance-none cursor-pointer"
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
                      <th className="p-4 text-left">
                        <div className="space-y-2">
                          <div 
                            className="text-xs font-bold text-zinc-300 uppercase tracking-wider cursor-pointer hover:text-[#4997D0] transition-colors flex items-center gap-2"
                            onClick={() => handleSort('engagement_count')}
                          >
                            <Target size={14} className="text-emerald-400" />
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
                            className="w-full px-2 py-1.5 text-xs bg-zinc-800/70 border border-zinc-700/50 rounded-lg text-white focus:outline-none focus:border-[#4997D0]/50 focus:bg-zinc-800 transition-all appearance-none cursor-pointer"
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
                      <th className="p-4 text-left">
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                            <BarChart3 size={14} className="text-blue-400" />
                            Onboarding
                          </div>
                          <div className="h-7"></div>
                        </div>
                      </th>
                    )}

                    {columnVisibility.status && (
                      <th className="p-4 text-left">
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                            <Activity size={14} className="text-rose-400" />
                            Status
                          </div>
                          <select
                            value={filters.status}
                            onChange={(e) => setFilters({...filters, status: e.target.value})}
                            className="w-full px-2 py-1.5 text-xs bg-zinc-800/70 border border-zinc-700/50 rounded-lg text-white focus:outline-none focus:border-[#4997D0]/50 focus:bg-zinc-800 transition-all appearance-none cursor-pointer"
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
                      <th className="p-4 text-left">
                        <div className="space-y-2">
                          <div 
                            className="text-xs font-bold text-zinc-300 uppercase tracking-wider cursor-pointer hover:text-[#4997D0] transition-colors flex items-center gap-2"
                            onClick={() => handleSort('last_activity_utc')}
                          >
                            <Clock size={14} className="text-orange-400" />
                            Last Activity
                            {sortConfig.key === 'last_activity_utc' && (
                              <span className="text-[#4997D0]">
                                {sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </span>
                            )}
                          </div>
                          <div className="h-7"></div>
                        </div>
                      </th>
                    )}

                    {columnVisibility.actions && (
                      <th className="p-4 text-center">
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                            Actions
                          </div>
                          <div className="h-7"></div>
                        </div>
                      </th>
                    )}
                  </tr>
                </thead>
                
                <tbody>
                  {paginatedClients.map((client, index) => (
                    <React.Fragment key={client.client_id}>
                      <tr 
                        className={`
                          border-b border-zinc-800/30 transition-all duration-500
                          ${hoveredRow === client.client_id ? 'bg-gradient-to-r from-[#4997D0]/5 via-[#4997D0]/3 to-[#4997D0]/5' : ''}
                          ${selectedClients.has(client.client_id) ? 'bg-[#4997D0]/5' : ''}
                          ${animatingRows.has(client.client_id) ? 'opacity-0 animate-fadeIn' : ''}
                          hover:shadow-lg hover:shadow-[#4997D0]/10 group cursor-pointer
                        `}
                        style={{
                          animationDelay: `${index * 100}ms`,
                          animationFillMode: 'forwards'
                        }}
                        onMouseEnter={() => setHoveredRow(client.client_id)}
                        onMouseLeave={() => setHoveredRow(null)}
                        onClick={() => toggleRowExpansion(client.client_id)}
                      >
                        <td className="p-4 sticky left-0 bg-zinc-950/90 backdrop-blur z-10">
                          <input
                            type="checkbox"
                            checked={selectedClients.has(client.client_id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSelectClient(client.client_id);
                            }}
                            className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-[#4997D0]"
                          />
                        </td>
                        
                        {columnVisibility.name && (
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                {client.logo_url ? (
                                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4997D0] via-blue-500 to-cyan-500 p-[2px] shadow-lg shadow-[#4997D0]/20">
                                    <div className="w-full h-full bg-zinc-900 rounded-xl overflow-hidden">
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
                                      <div className="w-full h-full hidden bg-zinc-900 rounded-xl flex items-center justify-center">
                                        <span className="text-lg font-bold text-white">
                                          {client.client_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4997D0] via-blue-500 to-cyan-500 p-[2px] shadow-lg shadow-[#4997D0]/20">
                                    <div className="w-full h-full bg-zinc-900 rounded-xl flex items-center justify-center">
                                      <span className="text-lg font-bold text-white">
                                        {client.client_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                      </span>
                                    </div>
                                  </div>
                                )}
                                {client.is_active && (
                                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-zinc-950 rounded-full animate-pulse"></div>
                                )}
                              </div>
                              <div>
                                <p className="text-white font-semibold text-sm group-hover:text-[#4997D0] transition-colors">
                                  {client.client_name}
                                </p>
                                <p className="text-zinc-500 text-xs">ID: {client.client_id}</p>
                                <div className="flex items-center gap-1 mt-1">
                                  <Calendar size={12} className="text-zinc-600" />
                                  <span className="text-zinc-600 text-xs">Created {formatDate(client.created_utc)}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        )}

                        {columnVisibility.primaryContact && (
                          <td className="p-4">
                            {client.primary_contact_name || client.primary_contact_email ? (
                              <div>
                                {client.primary_contact_name && (
                                  <div className="text-white font-medium text-sm">{client.primary_contact_name}</div>
                                )}
                                {client.primary_contact_email && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-zinc-400 text-xs">{client.primary_contact_email}</span>
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
                          <td className="p-4">
                            {client.tags ? (
                              <div className="flex flex-wrap gap-1">
                                {client.tags.split(',').slice(0, 2).map((tag, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded text-purple-400 text-xs font-medium">
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
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="text-white font-bold text-sm">
                                {client.engagement_count || 0}
                              </span>
                              <span className="text-zinc-600 text-xs">
                                {client.engagement_count === 1 ? 'engagement' : 'engagements'}
                              </span>
                            </div>
                          </td>
                        )}

                        {columnVisibility.onboarding && (
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 max-w-[100px]">
                                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-[#4997D0] to-cyan-500 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${getOnboardingProgress(client.pending_onboarding_tasks)}%` }}
                                  ></div>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-white min-w-[35px]">
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
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${client.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></div>
                              <span className={`text-xs font-medium ${client.is_active ? 'text-emerald-400' : 'text-red-400'}`}>
                                {client.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </td>
                        )}

                        {columnVisibility.lastActivity && (
                          <td className="p-4">
                            <span className="text-zinc-400 text-sm">
                              {formatDate(client.last_activity_utc)}
                            </span>
                          </td>
                        )}

                        {columnVisibility.actions && (
                          <td className="p-4">
                            <div className="flex items-center gap-2 justify-center">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle view action
                                }}
                                className="p-2 bg-zinc-800 hover:bg-[#4997D0]/20 rounded-lg transition-all hover:text-[#4997D0]"
                              >
                                <Eye size={14} />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle edit action
                                }}
                                className="p-2 bg-zinc-800 hover:bg-amber-500/20 rounded-lg transition-all hover:text-amber-400"
                              >
                                <Edit size={14} />
                              </button>
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
                        <tr className="bg-zinc-900/50 border-b border-zinc-800/30">
                          <td colSpan={Object.values(columnVisibility).filter(Boolean).length + 1} className="p-6">
                            <div className="grid grid-cols-3 gap-6">
                              <div className="space-y-3">
                                <h4 className="text-[#4997D0] font-semibold text-sm flex items-center gap-2">
                                  <Building2 size={16} />
                                  Client Details
                                </h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Client ID</span>
                                    <span className="text-white font-medium">{client.client_id}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Created</span>
                                    <span className="text-white font-medium">{formatDate(client.created_utc)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Status</span>
                                    <span className={`font-medium ${client.is_active ? 'text-emerald-400' : 'text-red-400'}`}>
                                      {client.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <h4 className="text-[#4997D0] font-semibold text-sm flex items-center gap-2">
                                  <BarChart3 size={16} />
                                  Engagement Metrics
                                </h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Total Engagements</span>
                                    <span className="text-white font-medium">{client.engagement_count || 0}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Onboarding Progress</span>
                                    <span className="text-white font-medium">{Math.round(getOnboardingProgress(client.pending_onboarding_tasks))}%</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Pending Tasks</span>
                                    <span className="text-white font-medium">{client.pending_onboarding_tasks || 0}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <h4 className="text-[#4997D0] font-semibold text-sm flex items-center gap-2">
                                  <Activity size={16} />
                                  Activity Status
                                </h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Last Activity</span>
                                    <span className="text-white font-medium">{formatDate(client.last_activity_utc)}</span>
                                  </div>
                                  {client.tags && (
                                    <div className="space-y-1">
                                      <span className="text-zinc-400 text-sm">Tags</span>
                                      <div className="flex flex-wrap gap-1">
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
            <div className="flex items-center justify-between p-4 border-t border-zinc-800/50">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredAndSortedClients.length)} of {filteredAndSortedClients.length} results
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredAndSortedClients.length === 0 && !loading && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-zinc-300 mb-2">No clients found</h3>
            <p className="text-zinc-500 mb-4">
              {hasActiveFilters
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by adding your first client.'}
            </p>
            <button className="px-4 py-2 bg-[#4997D0] text-white rounded-lg hover:bg-[#4997D0]/80 transition-colors">
              Add First Client
            </button>
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
      
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
