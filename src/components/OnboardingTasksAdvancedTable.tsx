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
  Mail,
  Calendar,
  Circle,
  PlusCircle,
  ClipboardList,
  AlertCircle
} from 'lucide-react';
import { listOnboardingTasks, getClientsOverview, deleteOnboardingTask, completeOnboardingTask, reopenOnboardingTask } from '../services/api.ts';
import type { OnboardingTask } from '../services/api.ts';
import type { ClientsOverviewItem } from '../services/models.ts';
import { toast } from '../lib/toast.ts';
import { ConfirmDialog } from './common/ConfirmDialog.tsx';
import { Badge } from '../ui/badge.tsx';
import { Button } from '../ui/button.tsx';
import KpiCard from './KpiCard.tsx';

interface TaskTableFilters {
  search: string;
  status: string;
  client: string;
  dueSoon: string;
}

interface TaskColumnVisibility {
  task: boolean;
  client: boolean;
  status: boolean;
  dueDate: boolean;
  description: boolean;
  actions: boolean;
}

interface OnboardingTasksAdvancedTableProps {
  onCreateTask: () => void;
}

const OnboardingTasksAdvancedTable: React.FC<OnboardingTasksAdvancedTableProps> = ({ onCreateTask }) => {
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [clients, setClients] = useState<ClientsOverviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TaskTableFilters>({
    search: '',
    status: '',
    client: '',
    dueSoon: ''
  });
  
  const [columnVisibility, setColumnVisibility] = useState<TaskColumnVisibility>({
    task: true,
    client: true,
    status: true,
    dueDate: true,
    description: true,
    actions: true
  });

  const [sortConfig, setSortConfig] = useState<{
    key: keyof OnboardingTask | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    taskId: number | null;
    taskName: string;
    action: 'delete' | 'complete' | 'reopen';
  }>({ open: false, taskId: null, taskName: '', action: 'delete' });
  const [processingAction, setProcessingAction] = useState(false);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [tasksResponse, clientsResponse] = await Promise.all([
          listOnboardingTasks(1, 200),
          getClientsOverview(200)
        ]);
        
        if (tasksResponse?.data) {
          setTasks(tasksResponse.data);
        }
        
        if (clientsResponse?.data) {
          setClients(clientsResponse.data);
        }
      } catch (error) {
        toast.error('Failed to load onboarding tasks');
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter and sort data
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const client = clients.find(c => c.client_id === task.client_id);
      const matchesSearch = !filters.search || 
        task.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        client?.client_name?.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = !filters.status || task.status === filters.status;
      const matchesClient = !filters.client || task.client_id.toString() === filters.client;
      
      const matchesDueSoon = !filters.dueSoon || (() => {
        if (filters.dueSoon === 'overdue') {
          return task.due_utc && new Date(task.due_utc) < new Date();
        }
        if (filters.dueSoon === 'due-this-week') {
          if (!task.due_utc) return false;
          const dueDate = new Date(task.due_utc);
          const now = new Date();
          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          return dueDate >= now && dueDate <= weekFromNow;
        }
        return true;
      })();

      return matchesSearch && matchesStatus && matchesClient && matchesDueSoon;
    });

    // Sort data
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key!];
        let bValue = b[sortConfig.key!];

        // Handle special sorting cases
        if (sortConfig.key === 'client_id') {
          const aClient = clients.find(c => c.client_id === a.client_id);
          const bClient = clients.find(c => c.client_id === b.client_id);
          aValue = aClient?.client_name || '';
          bValue = bClient?.client_name || '';
        }

        if (aValue != null && bValue != null) {
          if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [tasks, clients, filters, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTasks.length / pageSize);
  const paginatedTasks = filteredAndSortedTasks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handler functions
  const handleSort = (key: keyof OnboardingTask) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectTask = (taskId: number) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTasks.size === paginatedTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(paginatedTasks.map(t => t.task_id)));
    }
  };

  const handleTaskAction = async (action: 'complete' | 'reopen' | 'delete', taskId: number) => {
    try {
      setProcessingAction(true);
      
      switch (action) {
        case 'complete':
          await completeOnboardingTask(taskId);
          toast.success('Task marked as complete');
          break;
        case 'reopen':
          await reopenOnboardingTask(taskId);
          toast.success('Task reopened');
          break;
        case 'delete':
          await deleteOnboardingTask(taskId);
          toast.success('Task deleted');
          break;
      }
      
      // Reload data
      const tasksResponse = await listOnboardingTasks(1, 200);
      if (tasksResponse?.data) {
        setTasks(tasksResponse.data);
      }
    } catch (error) {
      toast.error(`Failed to ${action} task`);
      console.error(`Error ${action}ing task:`, error);
    } finally {
      setProcessingAction(false);
      setConfirmDialog({ open: false, taskId: null, taskName: '', action: 'delete' });
    }
  };

  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.client_id === clientId);
    return client?.client_name || `Client ${clientId}`;
  };

  const formatDueDate = (dueUtc?: string | null) => {
    if (!dueUtc) return 'No due date';
    const date = new Date(dueUtc);
    const now = new Date();
    const isOverdue = date < now;
    
    return {
      text: date.toLocaleDateString(),
      isOverdue
    };
  };

  const taskCounts = {
    total: tasks.length,
    pending: tasks.filter(t => t.status !== 'complete').length,
    complete: tasks.filter(t => t.status === 'complete').length,
    overdue: tasks.filter(t => t.due_utc && new Date(t.due_utc) < new Date() && t.status !== 'complete').length
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Tasks"
          value={taskCounts.total}
          icon={<ClipboardList className="w-5 h-5" />}
          tint="#3b82f6"
        />
        <KpiCard
          title="Pending Tasks"
          value={taskCounts.pending}
          icon={<Clock className="w-5 h-5" />}
          tint="#f59e0b"
        />
        <KpiCard
          title="Completed Tasks"
          value={taskCounts.complete}
          icon={<CheckCircle2 className="w-5 h-5" />}
          tint="#22c55e"
        />
        <KpiCard
          title="Overdue Tasks"
          value={taskCounts.overdue}
          icon={<AlertCircle className="w-5 h-5" />}
          tint="#ef4444"
        />
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500">
            {filteredAndSortedTasks.length} results
          </span>
        </div>
        <div />
      </div>

      {/* Filters and Search */}
      <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-lg p-4">
        <div className="grid grid-cols-5 gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 bg-zinc-800/70 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-[#4997D0]/50 focus:bg-zinc-800 transition-all"
            />
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 bg-zinc-800/70 border border-zinc-700/50 rounded-lg text-white focus:outline-none focus:border-[#4997D0]/50 focus:bg-zinc-800 transition-all"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="complete">Complete</option>
          </select>
          
          <select
            value={filters.client}
            onChange={(e) => setFilters(prev => ({ ...prev, client: e.target.value }))}
            className="px-3 py-2 bg-zinc-800/70 border border-zinc-700/50 rounded-lg text-white focus:outline-none focus:border-[#4997D0]/50 focus:bg-zinc-800 transition-all"
          >
            <option value="">All Clients</option>
            {clients.map(client => (
              <option key={client.client_id} value={client.client_id}>
                {client.client_name}
              </option>
            ))}
          </select>
          
          <select
            value={filters.dueSoon}
            onChange={(e) => setFilters(prev => ({ ...prev, dueSoon: e.target.value }))}
            className="px-3 py-2 bg-zinc-800/70 border border-zinc-700/50 rounded-lg text-white focus:outline-none focus:border-[#4997D0]/50 focus:bg-zinc-800 transition-all"
          >
            <option value="">All Due Dates</option>
            <option value="overdue">Overdue</option>
            <option value="due-this-week">Due This Week</option>
          </select>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">
              {selectedTasks.size > 0 && `${selectedTasks.size} selected`}
            </span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50 border-b border-zinc-700">
              <tr>
                <th className="w-12 p-4">
                  <input
                    type="checkbox"
                    checked={selectedTasks.size === paginatedTasks.length && paginatedTasks.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-zinc-700/50 bg-zinc-800/70 text-[#4997D0]"
                  />
                </th>
                {columnVisibility.task && (
                  <th className="text-left px-4 py-3">
                    <div 
                      className="text-xs font-bold text-zinc-300 uppercase tracking-wider cursor-pointer hover:text-[#4997D0] transition-colors flex items-center gap-2"
                      onClick={() => handleSort('name')}
                    >
                      <ClipboardList size={14} className="text-[#4997D0]" />
                      Task
                      {sortConfig.key === 'name' && (
                        <span className="text-[#4997D0]">
                          {sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </span>
                      )}
                    </div>
                  </th>
                )}
                {columnVisibility.client && (
                  <th 
                    className="text-left px-4 py-3 text-xs font-bold text-zinc-300 uppercase tracking-wider cursor-pointer hover:text-[#4997D0] transition-colors"
                    onClick={() => handleSort('client_id')}
                  >
                    <div className="flex items-center gap-2">
                      Client
                      {sortConfig.key === 'client_id' && (
                        <span className="text-[#4997D0]">
                          {sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </span>
                      )}
                    </div>
                  </th>
                )}
                {columnVisibility.status && (
                  <th 
                    className="text-left px-4 py-3 text-xs font-bold text-zinc-300 uppercase tracking-wider cursor-pointer hover:text-[#4997D0] transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      {sortConfig.key === 'status' && (
                        <span className="text-[#4997D0]">
                          {sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </span>
                      )}
                    </div>
                  </th>
                )}
                {columnVisibility.dueDate && (
                  <th 
                    className="text-left px-4 py-3 text-xs font-bold text-zinc-300 uppercase tracking-wider cursor-pointer hover:text-[#4997D0] transition-colors"
                    onClick={() => handleSort('due_utc')}
                  >
                    <div className="flex items-center gap-2">
                      Due Date
                      {sortConfig.key === 'due_utc' && (
                        <span className="text-[#4997D0]">
                          {sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </span>
                      )}
                    </div>
                  </th>
                )}
                {columnVisibility.description && (
                  <th className="text-left px-4 py-3 text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Description
                  </th>
                )}
                {columnVisibility.actions && (
                  <th className="text-center px-4 py-3 text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500">
                    Loading tasks...
                  </td>
                </tr>
              ) : paginatedTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500">
                    No onboarding tasks found
                  </td>
                </tr>
              ) : (
                paginatedTasks.map((task) => {
                  const isSelected = selectedTasks.has(task.task_id);
                  const isComplete = task.status === 'complete';
                  const dueDateInfo = formatDueDate(task.due_utc);
                  
                  return (
                    <tr
                      key={task.task_id}
                      className={`hover:bg-zinc-800/30 transition-colors group ${
                        isSelected ? 'bg-[#4997D0]/10' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectTask(task.task_id)}
                          className="rounded border-zinc-700/50 bg-zinc-800/70 text-[#4997D0]"
                        />
                      </td>
                      {columnVisibility.task && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => 
                                isComplete 
                                  ? setConfirmDialog({ open: true, taskId: task.task_id, taskName: task.name, action: 'reopen' })
                                  : setConfirmDialog({ open: true, taskId: task.task_id, taskName: task.name, action: 'complete' })
                              }
                              className="text-zinc-400 hover:text-[#4997D0] transition-colors"
                              disabled={processingAction}
                            >
                              {isComplete ? (
                                <CheckCircle2 size={18} className="text-green-500" />
                              ) : (
                                <Circle size={18} />
                              )}
                            </button>
                            <div>
                              <div className={`font-medium ${isComplete ? 'line-through opacity-60' : 'text-zinc-100'}`}>
                                {task.name}
                              </div>
                            </div>
                          </div>
                        </td>
                      )}
                      {columnVisibility.client && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-zinc-400" />
                            <span className="text-zinc-100">{getClientName(task.client_id)}</span>
                          </div>
                        </td>
                      )}
                      {columnVisibility.status && (
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            isComplete 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {isComplete ? 'Complete' : 'Pending'}
                          </span>
                        </td>
                      )}
                      {columnVisibility.dueDate && (
                        <td className="px-4 py-3">
                          {task.due_utc ? (
                            (() => {
                              const dueDateInfo = formatDueDate(task.due_utc);
                              if (typeof dueDateInfo === 'string') {
                                return <span className="text-zinc-400">{dueDateInfo}</span>;
                              }
                              return (
                                <div className={`flex items-center gap-2 ${dueDateInfo.isOverdue && !isComplete ? 'text-red-400' : 'text-zinc-400'}`}>
                                  <Calendar size={14} />
                                  {dueDateInfo.text}
                                  {dueDateInfo.isOverdue && !isComplete && (
                                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                                      Overdue
                                    </span>
                                  )}
                                </div>
                              );
                            })()
                          ) : (
                            <span className="text-zinc-400">No due date</span>
                          )}
                        </td>
                      )}
                      {columnVisibility.description && (
                        <td className="px-4 py-3">
                          <span className="text-zinc-400 text-sm">
                            {task.description || 'No description'}
                          </span>
                        </td>
                      )}
                      {columnVisibility.actions && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 justify-center">
                            <button
                              onClick={() => {/* Handle edit */}}
                              className="p-2 bg-zinc-800 hover:bg-[#4997D0]/20 rounded-lg transition-all hover:text-[#4997D0]"
                              title="Edit task"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => setConfirmDialog({ 
                                open: true, 
                                taskId: task.task_id, 
                                taskName: task.name, 
                                action: 'delete' 
                              })}
                              className="p-2 bg-zinc-800 hover:bg-red-500/20 rounded-lg transition-all hover:text-red-400"
                              title="Delete task"
                              disabled={processingAction}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800/50">
            <div className="text-sm text-zinc-400">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredAndSortedTasks.length)} of {filteredAndSortedTasks.length} tasks
            </div>
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
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredAndSortedTasks.length === 0 && !loading && (
        <div className="text-center py-12">
          <ClipboardList className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-300 mb-2">No tasks found</h3>
          <p className="text-zinc-500 mb-4">
            No onboarding tasks available. Create your first task to get started.
          </p>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onCancel={() => setConfirmDialog({ open: false, taskId: null, taskName: '', action: 'delete' })}
        onConfirm={() => confirmDialog.taskId && handleTaskAction(confirmDialog.action, confirmDialog.taskId)}
        title={
          confirmDialog.action === 'delete' ? 'Delete Task' :
          confirmDialog.action === 'complete' ? 'Complete Task' : 'Reopen Task'
        }
        description={
          confirmDialog.action === 'delete' 
            ? `Are you sure you want to delete "${confirmDialog.taskName}"? This action cannot be undone.`
            : confirmDialog.action === 'complete'
            ? `Mark "${confirmDialog.taskName}" as complete?`
            : `Reopen "${confirmDialog.taskName}" and mark as pending?`
        }
        confirmText={
          confirmDialog.action === 'delete' ? 'Delete' :
          confirmDialog.action === 'complete' ? 'Complete' : 'Reopen'
        }
        variant={confirmDialog.action === 'delete' ? 'danger' : undefined}
        confirming={processingAction}
      />
    </div>
  );
};

export default OnboardingTasksAdvancedTable;
