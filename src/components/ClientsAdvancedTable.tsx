import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Eye, 
  EyeOff, 
  ChevronDown, 
  ChevronUp,
  Mail,
  ExternalLink,
  Building2,
  Users,
  CheckCircle2,
  Clock,
  Activity
} from 'lucide-react';
import { getClientsOverview, getDashboardStats } from '../services/api.ts';
import type { ClientsOverviewItem, DashboardStats } from '../services/models.ts';
import { toast } from '../lib/toast.ts';

interface ClientTableFilters {
  search: string;
  status: 'all' | 'active' | 'inactive';
  hasEngagements: 'all' | 'with' | 'without';
}

interface ClientColumnVisibility {
  primaryContact: boolean;
  tags: boolean;
  engagements: boolean;
  onboarding: boolean;
  lastActivity: boolean;
}

const ClientsAdvancedTable: React.FC = () => {
  const [clients, setClients] = useState<ClientsOverviewItem[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ClientTableFilters>({
    search: '',
    status: 'all',
    hasEngagements: 'all'
  });
  
  const [columnVisibility, setColumnVisibility] = useState<ClientColumnVisibility>({
    primaryContact: true,
    tags: true,
    engagements: true,
    onboarding: true,
    lastActivity: true
  });

  const [sortConfig, setSortConfig] = useState<{
    key: keyof ClientsOverviewItem | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedClients, setSelectedClients] = useState<Set<number>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [clientsResponse, statsResponse] = await Promise.all([
          getClientsOverview(200), // Get more clients for better filtering
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
      if (filters.status !== 'all') {
        if (filters.status === 'active' && !client.is_active) return false;
        if (filters.status === 'inactive' && client.is_active) return false;
      }

      // Engagements filter
      if (filters.hasEngagements !== 'all') {
        const hasEngagements = (client.engagement_count || 0) > 0;
        if (filters.hasEngagements === 'with' && !hasEngagements) return false;
        if (filters.hasEngagements === 'without' && hasEngagements) return false;
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
          comparison = 1; // null values go to end
        } else if (aVal != null && bVal == null) {
          comparison = -1; // null values go to end
        }
        
        return sortConfig.direction === 'desc' ? comparison * -1 : comparison;
      });
    }

    return filtered;
  }, [clients, filters, sortConfig]);

  // Pagination
  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedClients.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedClients, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAndSortedClients.length / pageSize);

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
    if (selectedClients.size === paginatedClients.length) {
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

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
  };

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast.success('Email copied to clipboard');
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
        <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Active Clients</p>
              <p className="text-2xl font-bold text-zinc-100">
                {dashboardStats?.active_clients ?? '—'}
              </p>
            </div>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Building2 className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Total Clients</p>
              <p className="text-2xl font-bold text-zinc-100">{clients.length}</p>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">With Engagements</p>
              <p className="text-2xl font-bold text-zinc-100">
                {clients.filter(c => (c.engagement_count || 0) > 0).length}
              </p>
            </div>
            <div className="p-2 bg-[#4997D0]/10 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-[#4997D0]" />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Pending Onboarding</p>
              <p className="text-2xl font-bold text-zinc-100">
                {clients.reduce((sum, c) => sum + (c.pending_onboarding_tasks || 0), 0)}
              </p>
            </div>
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Table Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search clients, contacts, or tags..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#4997D0]/50"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              className="px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#4997D0]/50"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              className="px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#4997D0]/50"
              value={filters.hasEngagements}
              onChange={(e) => setFilters(prev => ({ ...prev, hasEngagements: e.target.value as any }))}
            >
              <option value="all">All Engagements</option>
              <option value="with">With Engagements</option>
              <option value="without">No Engagements</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-[#4997D0] text-white rounded-lg hover:bg-[#4997D0]/80 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Client
          </button>
          
          <button className="px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-400 hover:text-zinc-100 transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-zinc-400">
        <span>
          Showing {paginatedClients.length} of {filteredAndSortedClients.length} clients
          {selectedClients.size > 0 && ` (${selectedClients.size} selected)`}
        </span>
        
        <div className="flex items-center gap-4">
          <span>Rows per page:</span>
          <select
            className="bg-zinc-800/50 border border-zinc-700 rounded px-2 py-1 text-zinc-100"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50 border-b border-zinc-700">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedClients.size === paginatedClients.length && paginatedClients.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-zinc-600 bg-zinc-800 text-[#4997D0]"
                  />
                </th>
                
                <th 
                  className="text-left px-4 py-3 text-sm font-medium text-zinc-300 cursor-pointer hover:text-zinc-100 transition-colors"
                  onClick={() => handleSort('client_name')}
                >
                  <div className="flex items-center gap-1">
                    Client Name
                    {sortConfig.key === 'client_name' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>

                {columnVisibility.primaryContact && (
                  <th className="text-left px-4 py-3 text-sm font-medium text-zinc-300">Primary Contact</th>
                )}

                {columnVisibility.engagements && (
                  <th 
                    className="text-left px-4 py-3 text-sm font-medium text-zinc-300 cursor-pointer hover:text-zinc-100 transition-colors"
                    onClick={() => handleSort('engagement_count')}
                  >
                    <div className="flex items-center gap-1">
                      Engagements
                      {sortConfig.key === 'engagement_count' && (
                        sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                )}

                {columnVisibility.onboarding && (
                  <th className="text-left px-4 py-3 text-sm font-medium text-zinc-300">Onboarding</th>
                )}

                <th className="text-left px-4 py-3 text-sm font-medium text-zinc-300">Status</th>

                {columnVisibility.lastActivity && (
                  <th 
                    className="text-left px-4 py-3 text-sm font-medium text-zinc-300 cursor-pointer hover:text-zinc-100 transition-colors"
                    onClick={() => handleSort('last_activity_utc')}
                  >
                    <div className="flex items-center gap-1">
                      Last Activity
                      {sortConfig.key === 'last_activity_utc' && (
                        sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                )}

                <th className="w-12 px-4 py-3"></th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-zinc-800/50">
              {paginatedClients.map((client) => (
                <React.Fragment key={client.client_id}>
                  <tr className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedClients.has(client.client_id)}
                        onChange={() => handleSelectClient(client.client_id)}
                        className="rounded border-zinc-600 bg-zinc-800 text-[#4997D0]"
                      />
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-100">{client.client_name}</div>
                      <div className="text-sm text-zinc-400">ID: {client.client_id}</div>
                    </td>

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
                                  onClick={() => copyEmail(client.primary_contact_email!)}
                                  className="text-zinc-500 hover:text-[#4997D0] transition-colors"
                                >
                                  <Mail className="w-3 h-3" />
                                </button>
                              </div>
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
                        {client.pending_onboarding_tasks ? (
                          <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                            {client.pending_onboarding_tasks} pending
                          </span>
                        ) : (
                          <span className="text-zinc-500">—</span>
                        )}
                      </td>
                    )}

                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        client.is_active 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {client.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {columnVisibility.lastActivity && (
                      <td className="px-4 py-3 text-zinc-400">
                        {formatDate(client.last_activity_utc)}
                      </td>
                    )}

                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleRowExpansion(client.client_id)}
                        className="text-zinc-500 hover:text-zinc-100 transition-colors"
                      >
                        {expandedRows.has(client.client_id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {expandedRows.has(client.client_id) && (
                    <tr className="bg-zinc-800/20">
                      <td colSpan={8} className="px-4 py-4">
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
                              <button className="px-3 py-1 bg-[#4997D0]/20 text-[#4997D0] text-xs rounded hover:bg-[#4997D0]/30 transition-colors">
                                View Profile
                              </button>
                              <button className="px-3 py-1 bg-zinc-700 text-zinc-300 text-xs rounded hover:bg-zinc-600 transition-colors">
                                Edit Client
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
                className="px-3 py-1 text-sm bg-zinc-800/50 border border-zinc-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors"
              >
                Previous
              </button>
              
              <span className="text-sm text-zinc-400">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm bg-zinc-800/50 border border-zinc-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors"
              >
                Next
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
            {filters.search || filters.status !== 'all' || filters.hasEngagements !== 'all'
              ? 'Try adjusting your filters to see more results.'
              : 'Get started by adding your first client.'}
          </p>
          <button className="px-4 py-2 bg-[#4997D0] text-white rounded-lg hover:bg-[#4997D0]/80 transition-colors">
            Add First Client
          </button>
        </div>
      )}
    </div>
  );
};

export default ClientsAdvancedTable;
