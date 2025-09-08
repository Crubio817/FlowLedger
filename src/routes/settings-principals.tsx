import React, { useState, useEffect } from 'react';
import { 
  Users, 
  User, 
  Building, 
  Bot,
  Plus, 
  Search,
  Filter,
  RefreshCw,
  Edit,
  Trash2,
  Mail,
  Shield,
  ShieldCheck,
  AlertCircle,
  Eye,
  MoreVertical
} from 'lucide-react';
import { PageTitleEditorial } from '../components/PageTitles.tsx';
import { Button } from '../ui/button.tsx';
import { Badge } from '../ui/badge.tsx';
import { 
  listPrincipals,
  createPrincipal,
  updatePrincipal,
  deletePrincipal,
  type Principal 
} from '../services/api.ts';
import { formatUtc } from '../utils/date.ts';

interface PrincipalsPageState {
  principals: Principal[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  filters: {
    principal_type?: Principal['principal_type'];
    is_internal?: boolean;
    is_active?: boolean;
  };
  showCreateModal: boolean;
  editingPrincipal: Principal | null;
  newPrincipal: {
    principal_type: Principal['principal_type'];
    display_name: string;
    primary_email: string;
    is_internal: boolean;
    is_active: boolean;
  };
}

export default function PrincipalsPage() {
  const [state, setState] = useState<PrincipalsPageState>({
    principals: [],
    loading: true,
    error: null,
    searchTerm: '',
    filters: {},
    showCreateModal: false,
    editingPrincipal: null,
    newPrincipal: {
      principal_type: 'person',
      display_name: '',
      primary_email: '',
      is_internal: true,
      is_active: true
    }
  });

  useEffect(() => {
    loadData();
  }, [state.filters]);

  const loadData = async () => {
    try {
      setState(s => ({ ...s, loading: true, error: null }));
      
      const response = await listPrincipals({
        ...state.filters,
        search: state.searchTerm || undefined
      });

      setState(s => ({
        ...s,
        principals: response.data,
        loading: false
      }));
    } catch (error: any) {
      setState(s => ({
        ...s,
        loading: false,
        error: error?.message || 'Failed to load principals'
      }));
    }
  };

  const updateFilters = (newFilters: Partial<typeof state.filters>) => {
    setState(s => ({
      ...s,
      filters: { ...s.filters, ...newFilters }
    }));
  };

  const handleSearch = () => {
    loadData();
  };

  const handleCreatePrincipal = async () => {
    try {
      setState(s => ({ ...s, loading: true }));
      await createPrincipal(state.newPrincipal);
      setState(s => ({
        ...s,
        showCreateModal: false,
        newPrincipal: {
          principal_type: 'person',
          display_name: '',
          primary_email: '',
          is_internal: true,
          is_active: true
        }
      }));
      await loadData();
    } catch (error: any) {
      setState(s => ({ ...s, loading: false }));
    }
  };

  const handleUpdatePrincipal = async (principalId: number, updates: Partial<Principal>) => {
    try {
      await updatePrincipal(principalId, updates);
      await loadData();
    } catch (error: any) {
      // Error handled by withErrors
    }
  };

  const handleDeletePrincipal = async (principalId: number) => {
    if (!confirm('Are you sure you want to delete this principal?')) return;
    
    try {
      await deletePrincipal(principalId);
      await loadData();
    } catch (error: any) {
      // Error handled by withErrors
    }
  };

  const getPrincipalTypeIcon = (type: Principal['principal_type']) => {
    switch (type) {
      case 'person': return <User size={16} className="text-blue-400" />;
      case 'service': return <Bot size={16} className="text-purple-400" />;
      case 'team': return <Users size={16} className="text-emerald-400" />;
      default: return <User size={16} className="text-zinc-400" />;
    }
  };

  const getPrincipalTypeBadge = (type: Principal['principal_type']) => {
    const colors = {
      person: 'text-blue-400',
      service: 'text-purple-400',
      team: 'text-emerald-400'
    };
    
    return (
      <Badge variant="muted" className={colors[type]}>
        {type}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean, isInternal: boolean) => {
    if (!isActive) {
      return <Badge variant="muted" className="text-zinc-400">Inactive</Badge>;
    }
    
    return isInternal ? (
      <Badge variant="muted" className="text-emerald-400">Internal</Badge>
    ) : (
      <Badge variant="muted" className="text-amber-400">External</Badge>
    );
  };

  const filteredPrincipals = state.principals.filter(principal => {
    if (state.searchTerm) {
      const search = state.searchTerm.toLowerCase();
      return (
        principal.display_name?.toLowerCase().includes(search) ||
        principal.primary_email?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  if (state.loading && state.principals.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-zinc-400">Loading principals...</span>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Failed to load principals</h2>
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
          eyebrow="Identity Management"
          title="Principals"
          subtitle="Manage people, services, and teams"
        />
        <div className="flex items-center gap-3">
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setState(s => ({ ...s, showCreateModal: true }))} variant="primary">
            <Plus size={16} className="mr-2" />
            New Principal
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">People</p>
              <p className="text-2xl font-bold text-white">
                {state.principals.filter(p => p.principal_type === 'person').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <User className="text-blue-400" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Services</p>
              <p className="text-2xl font-bold text-white">
                {state.principals.filter(p => p.principal_type === 'service').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Bot className="text-purple-400" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Teams</p>
              <p className="text-2xl font-bold text-white">
                {state.principals.filter(p => p.principal_type === 'team').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <Users className="text-emerald-400" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Active</p>
              <p className="text-2xl font-bold text-white">
                {state.principals.filter(p => p.is_active).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <ShieldCheck className="text-emerald-400" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 flex items-center gap-2">
            <Search size={16} className="text-zinc-400" />
            <input
              type="text"
              placeholder="Search principals..."
              value={state.searchTerm}
              onChange={(e) => setState(s => ({ ...s, searchTerm: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 bg-transparent text-white placeholder-zinc-400 focus:outline-none"
            />
            <Button onClick={handleSearch} size="sm" variant="outline">
              Search
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <Filter size={16} className="text-zinc-400" />
            
            <select
              value={state.filters.principal_type || ''}
              onChange={(e) => updateFilters({ principal_type: e.target.value as Principal['principal_type'] || undefined })}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Types</option>
              <option value="person">People</option>
              <option value="service">Services</option>
              <option value="team">Teams</option>
            </select>

            <select
              value={state.filters.is_internal?.toString() || ''}
              onChange={(e) => updateFilters({ is_internal: e.target.value ? e.target.value === 'true' : undefined })}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="">All</option>
              <option value="true">Internal</option>
              <option value="false">External</option>
            </select>

            <select
              value={state.filters.is_active?.toString() || ''}
              onChange={(e) => updateFilters({ is_active: e.target.value ? e.target.value === 'true' : undefined })}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Principals Table */}
      <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-modern w-full">
            <thead>
              <tr>
                <th className="w-16">Type</th>
                <th>Name</th>
                <th>Email</th>
                <th className="w-24">Status</th>
                <th className="w-24">Scope</th>
                <th className="w-36">Created</th>
                <th className="w-28">Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-zinc-400">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPrincipals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Users className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No principals found</h3>
                    <p className="text-zinc-400">Create a new principal or adjust your search criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredPrincipals.map((principal) => (
                  <tr key={principal.principal_id} className="hover:bg-zinc-800/30">
                    <td>{getPrincipalTypeIcon(principal.principal_type)}</td>
                    <td>
                      <div className="font-medium text-white">
                        {principal.display_name || 'Unnamed'}
                      </div>
                      <div className="text-xs text-zinc-400">
                        {getPrincipalTypeBadge(principal.principal_type)}
                      </div>
                    </td>
                    <td>
                      {principal.primary_email ? (
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-zinc-400" />
                          <span className="text-sm">{principal.primary_email}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 text-sm">No email</span>
                      )}
                    </td>
                    <td>
                      {getStatusBadge(principal.is_active, principal.is_internal)}
                    </td>
                    <td>
                      {principal.is_internal ? (
                        <Shield size={16} className="text-emerald-400" />
                      ) : (
                        <Shield size={16} className="text-amber-400" />
                      )}
                    </td>
                    <td>
                      <div className="text-sm text-zinc-400">
                        {formatUtc(principal.created_at)}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setState(s => ({ ...s, editingPrincipal: principal }))}
                          className="h-8 w-8 p-0"
                          title="Edit principal"
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeletePrincipal(principal.principal_id)}
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                          title="Delete principal"
                        >
                          <Trash2 size={14} />
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

      {/* Create Principal Modal */}
      {state.showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Principal</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Type</label>
                <select
                  value={state.newPrincipal.principal_type}
                  onChange={(e) => setState(s => ({ 
                    ...s, 
                    newPrincipal: { 
                      ...s.newPrincipal, 
                      principal_type: e.target.value as Principal['principal_type'] 
                    } 
                  }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="person">Person</option>
                  <option value="service">Service</option>
                  <option value="team">Team</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Display Name</label>
                <input
                  type="text"
                  value={state.newPrincipal.display_name}
                  onChange={(e) => setState(s => ({ 
                    ...s, 
                    newPrincipal: { ...s.newPrincipal, display_name: e.target.value } 
                  }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Enter display name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Primary Email</label>
                <input
                  type="email"
                  value={state.newPrincipal.primary_email}
                  onChange={(e) => setState(s => ({ 
                    ...s, 
                    newPrincipal: { ...s.newPrincipal, primary_email: e.target.value } 
                  }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Enter email address"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={state.newPrincipal.is_internal}
                    onChange={(e) => setState(s => ({ 
                      ...s, 
                      newPrincipal: { ...s.newPrincipal, is_internal: e.target.checked } 
                    }))}
                    className="rounded border-zinc-700"
                  />
                  <span className="text-sm text-white">Internal</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={state.newPrincipal.is_active}
                    onChange={(e) => setState(s => ({ 
                      ...s, 
                      newPrincipal: { ...s.newPrincipal, is_active: e.target.checked } 
                    }))}
                    className="rounded border-zinc-700"
                  />
                  <span className="text-sm text-white">Active</span>
                </label>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-6">
              <Button
                onClick={() => setState(s => ({ ...s, showCreateModal: false }))}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePrincipal}
                disabled={!state.newPrincipal.display_name || !state.newPrincipal.primary_email}
                variant="primary"
                className="flex-1"
              >
                Create Principal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
