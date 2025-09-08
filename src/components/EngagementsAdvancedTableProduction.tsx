import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Plus,
  Filter,
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Play,
  Pause,
  XCircle,
  Activity,
  Briefcase,
  Users,
  FileText,
  BarChart3,
  Layers,
  GitBranch,
  Settings
} from 'lucide-react';

import { Badge } from '../ui/badge.tsx';
import { Button } from '../ui/button.tsx';
import { Input } from '../ui/input.tsx';
import Modal from './Modal.tsx';
import KpiCard from './KpiCard.tsx';
import { Loading } from './Loading.tsx';
import { EmptyState } from './EmptyState.tsx';
import RealTimeIndicators from './RealTimeIndicators.tsx';

import {
  engagementsApi,
  type Engagement,
  type Feature,
  type AuditStep,
  type JobTask,
  type Milestone,
  type ChangeRequest,
  type EngagementFilters,
  ENGAGEMENT_TRANSITIONS,
  FEATURE_TRANSITIONS,
  calculateEngagementProgress
} from '../services/engagements.api.ts';

import { ENGAGEMENTS_API, FEATURE_FLAGS, ORG_CONFIG } from '@config';
import { toast } from '../lib/toast.ts';

// ================================
// TYPES & INTERFACES
// ================================

interface EngagementWithDetails extends Engagement {
  features?: Feature[];
  auditSteps?: AuditStep[];
  jobTasks?: JobTask[];
  milestones?: Milestone[];
  changeRequests?: ChangeRequest[];
}

interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: EngagementWithDetails) => React.ReactNode;
}

interface EngagementTableFilters {
  search: string;
  type: string;
  status: string;
  health: string;
  clientId: string;
  ownerId: string;
  dueDateRange: {
    start: string;
    end: string;
  };
}

// ================================
// MAIN COMPONENT
// ================================

export const EngagementsAdvancedTableProduction: React.FC = () => {
  // ================================
  // STATE MANAGEMENT
  // ================================
  
  const [engagements, setEngagements] = useState<EngagementWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEngagementId, setSelectedEngagementId] = useState<number | null>(null);
  
  // Table state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [totalCount, setTotalCount] = useState(0);
  
  // Filter state
  const [filters, setFilters] = useState<EngagementTableFilters>({
    search: '',
    type: '',
    status: '',
    health: '',
    clientId: '',
    ownerId: '',
    dueDateRange: {
      start: '',
      end: ''
    }
  });
  
  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showChangeRequestModal, setShowChangeRequestModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Engagement>>({});
  const [saving, setSaving] = useState(false);

  // ================================
  // DATA LOADING
  // ================================

  const loadEngagements = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiFilters: EngagementFilters = {
        orgId: ORG_CONFIG.orgId,
        search: filters.search || undefined,
        type: filters.type ? [filters.type as any] : undefined,
        status: filters.status ? [filters.status as any] : undefined,
        health: filters.health ? [filters.health as any] : undefined,
        client_id: filters.clientId ? parseInt(filters.clientId) : undefined,
        owner_id: filters.ownerId ? parseInt(filters.ownerId) : undefined,
        due_range: (filters.dueDateRange.start || filters.dueDateRange.end) ? {
          start: filters.dueDateRange.start || undefined,
          end: filters.dueDateRange.end || undefined
        } : undefined
      };

      const response = await engagementsApi.getEngagements(apiFilters);
      
      if (response.status === 'success') {
        // Load related data for each engagement
        const engagementsWithDetails = await Promise.all(
          response.data.map(async (engagement) => {
            const details: EngagementWithDetails = { ...engagement };
            
            try {
              // Load type-specific data
              if (engagement.type === 'project') {
                const featuresResponse = await engagementsApi.getFeatures(engagement.id);
                if (featuresResponse.status === 'success') {
                  details.features = featuresResponse.data;
                  details.progress_pct = calculateEngagementProgress(featuresResponse.data);
                }
              } else if (engagement.type === 'audit') {
                const stepsResponse = await engagementsApi.getAuditSteps(engagement.id);
                if (stepsResponse.status === 'success') {
                  details.auditSteps = stepsResponse.data;
                  details.progress_pct = engagementsApi.calculateProgress(stepsResponse.data, ['done']);
                }
              } else if (engagement.type === 'job') {
                const tasksResponse = await engagementsApi.getJobTasks(engagement.id);
                if (tasksResponse.status === 'success') {
                  details.jobTasks = tasksResponse.data;
                  details.progress_pct = engagementsApi.calculateProgress(tasksResponse.data, ['done']);
                }
              }

              // Load milestones and change requests for all types
              const [milestonesResponse, changeRequestsResponse] = await Promise.all([
                engagementsApi.getMilestones(engagement.id),
                engagementsApi.getChangeRequests(engagement.id)
              ]);

              if (milestonesResponse.status === 'success') {
                details.milestones = milestonesResponse.data;
              }

              if (changeRequestsResponse.status === 'success') {
                details.changeRequests = changeRequestsResponse.data;
              }

              // Calculate computed fields
              if (engagement.due_at) {
                const dueDate = new Date(engagement.due_at);
                const today = new Date();
                const diffTime = dueDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                details.days_remaining = diffDays;
                details.is_overdue = diffDays < 0;
              }

            } catch (e) {
              console.warn(`Failed to load details for engagement ${engagement.id}:`, e);
            }
            
            return details;
          })
        );

        setEngagements(engagementsWithDetails);
        setTotalCount(response.meta?.total || engagementsWithDetails.length);
      } else {
        setError('Failed to load engagements');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load engagements');
      console.error('Error loading engagements:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEngagements();
  }, [currentPage, pageSize, sortField, sortDirection, filters]);

  // ================================
  // EVENT HANDLERS
  // ================================

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (key: keyof EngagementTableFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleCreateEngagement = async () => {
    try {
      setSaving(true);
      
      const payload = {
        ...formData,
        org_id: parseInt(ORG_CONFIG.orgId),
        client_id: formData.client_id!,
        name: formData.name!,
        owner_id: formData.owner_id!,
        type: formData.type!,
        start_at: formData.start_at!
      } as Omit<Engagement, 'id' | 'created_at' | 'updated_at'>;

      const response = await engagementsApi.createEngagement(payload);
      
      if (response.status === 'success') {
        toast.success('Engagement created successfully');
        setShowCreateModal(false);
        setFormData({});
        await loadEngagements();
      }
    } catch (e: any) {
      console.error('Error creating engagement:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEngagement = async () => {
    if (!selectedEngagementId) return;
    
    try {
      setSaving(true);
      
      const response = await engagementsApi.updateEngagement(selectedEngagementId, formData);
      
      if (response.status === 'success') {
        toast.success('Engagement updated successfully');
        setShowEditModal(false);
        setFormData({});
        setSelectedEngagementId(null);
        await loadEngagements();
      }
    } catch (e: any) {
      console.error('Error updating engagement:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEngagement = async (id: number) => {
    if (!confirm('Are you sure you want to delete this engagement? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await engagementsApi.deleteEngagement(id);
      
      if (response.status === 'success') {
        toast.success('Engagement deleted successfully');
        await loadEngagements();
      }
    } catch (e: any) {
      console.error('Error deleting engagement:', e);
    }
  };

  const handleStateTransition = async (engagementId: number, newState: string) => {
    const engagement = engagements.find(e => e.id === engagementId);
    if (!engagement) return;

    if (!engagementsApi.validateStateTransition(engagement.status, newState, 'engagement')) {
      toast.error(`Invalid state transition from ${engagement.status} to ${newState}`);
      return;
    }

    try {
      const response = await engagementsApi.updateEngagement(engagementId, { status: newState as any });
      
      if (response.status === 'success') {
        toast.success(`Engagement status updated to ${newState}`);
        await loadEngagements();
      }
    } catch (e: any) {
      console.error('Error updating engagement status:', e);
    }
  };

  // ================================
  // TABLE CONFIGURATION
  // ================================

  const columns: TableColumn[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      width: '25%',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            row.type === 'project' ? 'bg-blue-500' :
            row.type === 'audit' ? 'bg-purple-500' :
            'bg-green-500'
          }`} />
          <div>
            <div className="font-medium text-[var(--text-1)]">{value}</div>
            <div className="text-xs text-[var(--text-2)]">{row.client_name}</div>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      width: '10%',
      render: (value, engagement) => (
        <div className="text-center">
          <Badge variant="muted" className="capitalize">
            {engagement.type.replace('_', ' ')}
          </Badge>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '12%',
      render: (value) => {
        const statusConfig = {
          active: { color: 'bg-green-500', icon: Play },
          on_hold: { color: 'bg-yellow-500', icon: Pause },
          completed: { color: 'bg-blue-500', icon: CheckCircle2 },
          cancelled: { color: 'bg-red-500', icon: XCircle }
        };
        
        const config = statusConfig[value as keyof typeof statusConfig];
        const Icon = config?.icon || Circle;
        
        return (
          <div className="flex items-center gap-2">
            <Icon size={14} className={`${config?.color.replace('bg-', 'text-')} || 'text-gray-500'}`} />
            <span className="capitalize">{value.replace('_', ' ')}</span>
          </div>
        );
      }
    },
    {
      key: 'health',
      label: 'Health',
      sortable: true,
      width: '10%',
      render: (value) => {
        const healthConfig = {
          green: { color: 'bg-green-500', text: 'On Track' },
          yellow: { color: 'bg-yellow-500', text: 'At Risk' },
          red: { color: 'bg-red-500', text: 'Issues' }
        };
        
        const config = healthConfig[value as keyof typeof healthConfig];
        
        return (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${config?.color || 'bg-gray-500'}`} />
            <span className="text-xs">{config?.text || value}</span>
          </div>
        );
      }
    },
    {
      key: 'progress_pct',
      label: 'Progress',
      sortable: true,
      width: '15%',
      render: (value, row) => {
        const percentage = Math.round((value || 0) * 100);
        const itemCount = 
          row.type === 'project' ? row.features?.length || 0 :
          row.type === 'audit' ? row.auditSteps?.length || 0 :
          row.jobTasks?.length || 0;
        
        return (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>{percentage}%</span>
              <span className="text-[var(--text-2)]">{itemCount} items</span>
            </div>
            <div className="w-full bg-[var(--background-3)] rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  percentage >= 80 ? 'bg-green-500' :
                  percentage >= 50 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      }
    },
    {
      key: 'due_at',
      label: 'Due Date',
      sortable: true,
      width: '12%',
      render: (value, row) => {
        if (!value) return <span className="text-[var(--text-3)]">No due date</span>;
        
        const dueDate = new Date(value);
        const isOverdue = row.is_overdue;
        const daysRemaining = row.days_remaining;
        
        return (
          <div className={`text-xs ${isOverdue ? 'text-red-500' : 'text-[var(--text-2)]'}`}>
            <div>{dueDate.toLocaleDateString()}</div>
            <div className="flex items-center gap-1 mt-1">
              {isOverdue ? (
                <>
                  <AlertTriangle size={12} />
                  <span>Overdue by {Math.abs(daysRemaining || 0)} days</span>
                </>
              ) : (
                <>
                  <Clock size={12} />
                  <span>{daysRemaining} days left</span>
                </>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: 'owner_name',
      label: 'Owner',
      sortable: true,
      width: '10%',
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center text-xs text-white">
            {value?.split(' ').map((n: string) => n[0]).join('') || '?'}
          </div>
          <span className="text-xs">{value || 'Unassigned'}</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '6%',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            className="p-1 hover:bg-[var(--background-2)] rounded"
            onClick={() => {
              setSelectedEngagementId(row.id);
              setShowDetailsModal(true);
            }}
            title="View Details"
          >
            <Eye size={14} />
          </button>
          <button
            className="p-1 hover:bg-[var(--background-2)] rounded"
            onClick={() => {
              setSelectedEngagementId(row.id);
              setFormData(row);
              setShowEditModal(true);
            }}
            title="Edit"
          >
            <Edit size={14} />
          </button>
          <button
            className="p-1 hover:bg-[var(--background-2)] rounded text-red-500"
            onClick={() => handleDeleteEngagement(row.id)}
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  // ================================
  // COMPUTED VALUES
  // ================================

  const statistics = useMemo(() => {
    const totalEngagements = engagements.length;
    const activeEngagements = engagements.filter(e => e.status === 'active').length;
    const completedEngagements = engagements.filter(e => e.status === 'completed').length;
    const overdueEngagements = engagements.filter(e => e.is_overdue).length;
    const avgProgress = engagements.reduce((sum, e) => sum + (e.progress_pct || 0), 0) / totalEngagements || 0;
    
    const healthCounts = engagements.reduce((acc, e) => {
      acc[e.health] = (acc[e.health] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEngagements,
      activeEngagements,
      completedEngagements,
      overdueEngagements,
      avgProgress: Math.round(avgProgress * 100),
      healthCounts
    };
  }, [engagements]);

  // ================================
  // RENDER
  // ================================

  if (loading && engagements.length === 0) {
    return <Loading label="Loading engagements..." />;
  }

  if (error && engagements.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-[var(--text-1)] mb-2">Failed to load engagements</h3>
          <p className="text-[var(--text-2)] mb-4">{error}</p>
          <Button onClick={loadEngagements}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-1)]">Engagements</h1>
          <p className="text-sm text-[var(--text-2)] mt-1">
            Manage projects, audits, and jobs across your organization
          </p>
        </div>
        <div className="flex items-center gap-3">
                    <RealTimeIndicators
            className="ml-4"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFiltersModal(true)}
          >
            <Filter size={16} className="mr-2" />
            Filters
          </Button>
          <Button
            size="sm"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} className="mr-2" />
            New Engagement
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <KpiCard
          title="Total"
          value={statistics.totalEngagements}
          icon={<Briefcase className="h-5 w-5" />}
          deltaPct={0}
        />
        <KpiCard
          title="Active"
          value={statistics.activeEngagements}
          icon={<Play className="h-5 w-5" />}
          deltaPct={0}
        />
        <KpiCard
          title="Completed"
          value={statistics.completedEngagements}
          icon={<CheckCircle2 className="h-5 w-5" />}
          deltaPct={0}
        />
        <KpiCard
          title="Overdue"
          value={statistics.overdueEngagements}
          icon={<AlertTriangle className="h-5 w-5" />}
          deltaPct={0}
        />
        <KpiCard
          title="Avg Progress"
          value={`${statistics.avgProgress}%`}
          icon={<BarChart3 className="h-5 w-5" />}
          deltaPct={0}
        />
        <KpiCard
          title="Health Score"
          value={`${statistics.healthCounts.green || 0}/${statistics.totalEngagements}`}
          icon={<Activity className="h-5 w-5" />}
          deltaPct={0}
        />
      </div>

      {/* Main Table */}
      {engagements.length === 0 ? (
        <EmptyState
          title="No engagements found"
          message="Get started by creating your first engagement"
          action={
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              Create Engagement
            </button>
          }
        />
      ) : (
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h3 className="text-lg font-medium text-slate-200">Engagements</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {engagements.map((engagement) => (
                  <tr key={engagement.id} className="hover:bg-slate-900/50">
                    {columns.map((column) => (
                      <td key={column.key} className="px-6 py-4 text-sm text-slate-300">
                        {column.render ? column.render((engagement as any)[column.key], engagement) : (engagement as any)[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <EngagementCreateModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateEngagement}
          formData={formData}
          onFormChange={setFormData}
          saving={saving}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <EngagementEditModal
          onClose={() => {
            setShowEditModal(false);
            setSelectedEngagementId(null);
            setFormData({});
          }}
          onSave={handleUpdateEngagement}
          formData={formData}
          onFormChange={setFormData}
          saving={saving}
        />
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedEngagementId && (
        <EngagementDetailsModal
          engagementId={selectedEngagementId}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedEngagementId(null);
          }}
          onStateChange={handleStateTransition}
        />
      )}

      {/* Filters Modal */}
      {showFiltersModal && (
        <EngagementFiltersModal
          filters={filters}
          onFiltersChange={setFilters}
          onClose={() => setShowFiltersModal(false)}
        />
      )}
    </div>
  );
};

// ================================
// MODAL COMPONENTS
// ================================

interface EngagementCreateModalProps {
  onClose: () => void;
  onSave: () => void;
  formData: Partial<Engagement>;
  onFormChange: (data: Partial<Engagement>) => void;
  saving: boolean;
}

const EngagementCreateModal: React.FC<EngagementCreateModalProps> = ({
  onClose,
  onSave,
  formData,
  onFormChange,
  saving
}) => {
  return (
    <Modal onClose={onClose} title="Create New Engagement">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-1)] mb-2">
              Name *
            </label>
            <Input
              value={formData.name || ''}
              onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
              placeholder="Enter engagement name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--text-1)] mb-2">
              Type *
            </label>
            <select
              className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--background-1)] text-[var(--text-1)]"
              value={formData.type || ''}
              onChange={(e) => onFormChange({ ...formData, type: e.target.value as any })}
            >
              <option value="">Select type</option>
              <option value="project">Project</option>
              <option value="audit">Audit</option>
              <option value="job">Job</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-1)] mb-2">
              Client ID *
            </label>
            <Input
              type="number"
              value={formData.client_id || ''}
              onChange={(e) => onFormChange({ ...formData, client_id: parseInt(e.target.value) || undefined })}
              placeholder="Enter client ID"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--text-1)] mb-2">
              Owner ID *
            </label>
            <Input
              type="number"
              value={formData.owner_id || ''}
              onChange={(e) => onFormChange({ ...formData, owner_id: parseInt(e.target.value) || undefined })}
              placeholder="Enter owner ID"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-1)] mb-2">
              Start Date *
            </label>
            <Input
              type="date"
              value={formData.start_at?.split('T')[0] || ''}
              onChange={(e) => onFormChange({ ...formData, start_at: e.target.value ? `${e.target.value}T00:00:00.000Z` : undefined })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--text-1)] mb-2">
              Due Date
            </label>
            <Input
              type="date"
              value={formData.due_at?.split('T')[0] || ''}
              onChange={(e) => onFormChange({ ...formData, due_at: e.target.value ? `${e.target.value}T23:59:59.999Z` : undefined })}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button 
            onClick={onSave} 
            disabled={saving || !formData.name || !formData.type || !formData.client_id || !formData.owner_id || !formData.start_at}
          >
            {saving ? 'Creating...' : 'Create Engagement'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

interface EngagementEditModalProps {
  onClose: () => void;
  onSave: () => void;
  formData: Partial<Engagement>;
  onFormChange: (data: Partial<Engagement>) => void;
  saving: boolean;
}

const EngagementEditModal: React.FC<EngagementEditModalProps> = ({
  onClose,
  onSave,
  formData,
  onFormChange,
  saving
}) => {
  return (
    <Modal onClose={onClose} title="Edit Engagement">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-1)] mb-2">
            Name
          </label>
          <Input
            value={formData.name || ''}
            onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
            placeholder="Enter engagement name"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-1)] mb-2">
              Status
            </label>
            <select
              className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--background-1)] text-[var(--text-1)]"
              value={formData.status || ''}
              onChange={(e) => onFormChange({ ...formData, status: e.target.value as any })}
            >
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--text-1)] mb-2">
              Health
            </label>
            <select
              className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--background-1)] text-[var(--text-1)]"
              value={formData.health || ''}
              onChange={(e) => onFormChange({ ...formData, health: e.target.value as any })}
            >
              <option value="green">Green (On Track)</option>
              <option value="yellow">Yellow (At Risk)</option>
              <option value="red">Red (Issues)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-1)] mb-2">
            Due Date
          </label>
          <Input
            type="date"
            value={formData.due_at?.split('T')[0] || ''}
            onChange={(e) => onFormChange({ ...formData, due_at: e.target.value ? `${e.target.value}T23:59:59.999Z` : undefined })}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? 'Updating...' : 'Update Engagement'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

interface EngagementDetailsModalProps {
  engagementId: number;
  onClose: () => void;
  onStateChange: (engagementId: number, newState: string) => void;
}

const EngagementDetailsModal: React.FC<EngagementDetailsModalProps> = ({
  engagementId,
  onClose,
  onStateChange
}) => {
  const [engagement, setEngagement] = useState<EngagementWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEngagement = async () => {
      try {
        const response = await engagementsApi.getEngagement(engagementId);
        if (response.status === 'success') {
          setEngagement(response.data as EngagementWithDetails);
        }
      } catch (e) {
        console.error('Error loading engagement details:', e);
      } finally {
        setLoading(false);
      }
    };

    loadEngagement();
  }, [engagementId]);

  if (loading) {
    return (
      <Modal onClose={onClose} title="Engagement Details">
        <div className="flex justify-center py-8">
          <Loading label="Loading engagement details..." />
        </div>
      </Modal>
    );
  }

  if (!engagement) {
    return (
      <Modal onClose={onClose} title="Engagement Details">
        <div className="text-center py-8">
          <p>Engagement not found</p>
        </div>
      </Modal>
    );
  }

  const availableTransitions = ENGAGEMENT_TRANSITIONS[engagement.status as keyof typeof ENGAGEMENT_TRANSITIONS] || [];

  return (
    <Modal onClose={onClose} title={engagement.name}>
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-[var(--background-2)] rounded-lg">
          <div>
            <label className="text-xs text-[var(--text-2)] mb-1 block">Type</label>
            <Badge variant="muted" className="capitalize">
              {engagement.type}
            </Badge>
          </div>
          <div>
            <label className="text-xs text-[var(--text-2)] mb-1 block">Status</label>
            <div className="flex items-center gap-2">
              <Badge variant="muted">{engagement.status.replace('_', ' ')}</Badge>
              {availableTransitions.length > 0 && (
                <select
                  className="text-xs px-2 py-1 border border-[var(--border)] rounded"
                  onChange={(e) => {
                    if (e.target.value) {
                      onStateChange(engagement.id, e.target.value);
                    }
                  }}
                  value=""
                >
                  <option value="">Change to...</option>
                  {availableTransitions.map(state => (
                    <option key={state} value={state}>
                      {state.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <div>
            <label className="text-xs text-[var(--text-2)] mb-1 block">Health</label>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                engagement.health === 'green' ? 'bg-green-500' :
                engagement.health === 'yellow' ? 'bg-yellow-500' :
                'bg-red-500'
              }`} />
              <span className="text-sm capitalize">{engagement.health}</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-[var(--text-2)] mb-1 block">Progress</label>
            <div className="text-sm font-medium">
              {Math.round((engagement.progress_pct || 0) * 100)}%
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-[var(--text-2)] mb-1 block">Start Date</label>
            <div className="text-sm">{new Date(engagement.start_at).toLocaleDateString()}</div>
          </div>
          {engagement.due_at && (
            <div>
              <label className="text-xs text-[var(--text-2)] mb-1 block">Due Date</label>
              <div className={`text-sm ${engagement.is_overdue ? 'text-red-500' : ''}`}>
                {new Date(engagement.due_at).toLocaleDateString()}
                {engagement.is_overdue && (
                  <span className="ml-2 text-xs">(Overdue)</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Type-specific content */}
        {engagement.type === 'project' && engagement.features && (
          <div>
            <h4 className="font-medium text-[var(--text-1)] mb-3">Features ({engagement.features.length})</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {engagement.features.map(feature => (
                <div key={feature.id} className="flex items-center justify-between p-2 bg-[var(--background-2)] rounded">
                  <span className="text-sm">{feature.title}</span>
                  <Badge variant={feature.state === 'done' ? 'success' : 'muted'}>
                    {feature.state.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {engagement.type === 'audit' && engagement.auditSteps && (
          <div>
            <h4 className="font-medium text-[var(--text-1)] mb-3">Audit Steps ({engagement.auditSteps.length})</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {engagement.auditSteps.map(step => (
                <div key={step.id} className="flex items-center justify-between p-2 bg-[var(--background-2)] rounded">
                  <span className="text-sm">{step.step_number}. {step.title}</span>
                  <Badge variant={step.state === 'done' ? 'success' : 'muted'}>
                    {step.state}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {engagement.type === 'job' && engagement.jobTasks && (
          <div>
            <h4 className="font-medium text-[var(--text-1)] mb-3">Tasks ({engagement.jobTasks.length})</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {engagement.jobTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-2 bg-[var(--background-2)] rounded">
                  <span className="text-sm">{task.title}</span>
                  <Badge variant={task.state === 'done' ? 'success' : 'muted'}>
                    {task.state.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Change Requests */}
        {engagement.changeRequests && engagement.changeRequests.length > 0 && (
          <div>
            <h4 className="font-medium text-[var(--text-1)] mb-3">Change Requests ({engagement.changeRequests.length})</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {engagement.changeRequests.map(cr => (
                <div key={cr.id} className="flex items-center justify-between p-2 bg-[var(--background-2)] rounded">
                  <div>
                    <div className="text-sm font-medium">{cr.title}</div>
                    <div className="text-xs text-[var(--text-2)]">{cr.origin} • {cr.value_delta ? `$${cr.value_delta}` : 'No value change'}</div>
                  </div>
                  <Badge variant={cr.status === 'approved' ? 'success' : 'muted'}>
                    {cr.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
};

interface EngagementFiltersModalProps {
  filters: EngagementTableFilters;
  onFiltersChange: (filters: EngagementTableFilters) => void;
  onClose: () => void;
}

const EngagementFiltersModal: React.FC<EngagementFiltersModalProps> = ({
  filters,
  onFiltersChange,
  onClose
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      type: '',
      status: '',
      health: '',
      clientId: '',
      ownerId: '',
      dueDateRange: { start: '', end: '' }
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    onClose();
  };

  return (
    <Modal onClose={onClose} title="Filter Engagements">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-1)] mb-2">
              Type
            </label>
            <select
              className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--background-1)] text-[var(--text-1)]"
              value={localFilters.type}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="">All types</option>
              <option value="project">Project</option>
              <option value="audit">Audit</option>
              <option value="job">Job</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--text-1)] mb-2">
              Status
            </label>
            <select
              className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--background-1)] text-[var(--text-1)]"
              value={localFilters.status}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-1)] mb-2">
              Health
            </label>
            <select
              className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--background-1)] text-[var(--text-1)]"
              value={localFilters.health}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, health: e.target.value }))}
            >
              <option value="">All health levels</option>
              <option value="green">Green (On Track)</option>
              <option value="yellow">Yellow (At Risk)</option>
              <option value="red">Red (Issues)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--text-1)] mb-2">
              Client ID
            </label>
            <Input
              type="number"
              value={localFilters.clientId}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, clientId: e.target.value }))}
              placeholder="Filter by client ID"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-1)] mb-2">
            Due Date Range
          </label>
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              value={localFilters.dueDateRange.start}
              onChange={(e) => setLocalFilters(prev => ({ 
                ...prev, 
                dueDateRange: { ...prev.dueDateRange, start: e.target.value } 
              }))}
              placeholder="Start date"
            />
            <Input
              type="date"
              value={localFilters.dueDateRange.end}
              onChange={(e) => setLocalFilters(prev => ({ 
                ...prev, 
                dueDateRange: { ...prev.dueDateRange, end: e.target.value } 
              }))}
              placeholder="End date"
            />
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleReset}>
            Reset Filters
          </Button>
          <div className="space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleApply}>
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EngagementsAdvancedTableProduction;
