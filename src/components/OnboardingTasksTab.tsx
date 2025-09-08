import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button.tsx';
import { Input } from '../ui/input.tsx';
import { Badge } from '../ui/badge.tsx';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Calendar,
  Edit3,
  Trash2,
  RotateCcw,
  Package,
  RefreshCw
} from 'lucide-react';
import {
  listOnboardingTasks,
  createOnboardingTask,
  updateOnboardingTask,
  deleteOnboardingTask,
  completeOnboardingTask,
  reopenOnboardingTask,
  type OnboardingTask
} from '../services/api.ts';
import { toast } from '../lib/toast.ts';
import { CreateTaskModal } from './CreateTaskModal.js';
import { EditTaskModal } from './EditTaskModal.js';
import { SeedTaskPackModal } from './SeedTaskPackModal.js';

interface OnboardingTasksTabProps {
  clientId: number;
}

export function OnboardingTasksTab({ clientId }: OnboardingTasksTabProps) {
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSeedModalOpen, setIsSeedModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<OnboardingTask | null>(null);
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<number, Partial<OnboardingTask>>>(new Map());

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await listOnboardingTasks(1, 100, clientId, statusFilter || undefined, searchQuery || undefined);
      setTasks(response.data || []);
    } catch (error) {
      console.error('Failed to load onboarding tasks:', error);
      toast.error('Failed to load onboarding tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const handleStatusToggle = async (task: OnboardingTask) => {
    const newStatus = task.status === 'done' ? 'open' : 'done';
    const optimisticUpdate = { status: newStatus };
    
    // Optimistic update
    setOptimisticUpdates(prev => new Map(prev.set(task.task_id, optimisticUpdate)));
    
    try {
      if (newStatus === 'done') {
        await completeOnboardingTask(task.task_id);
      } else {
        await reopenOnboardingTask(task.task_id);
      }
      // Success - refresh to get actual data
      await loadTasks();
      toast.success(`Task ${newStatus === 'done' ? 'completed' : 'reopened'}`);
    } catch (error) {
      // Rollback optimistic update
      setOptimisticUpdates(prev => {
        const newMap = new Map(prev);
        newMap.delete(task.task_id);
        return newMap;
      });
      console.error('Failed to update task status:', error);
      toast.error('Failed to update task status');
    }
  };

  const handleDeleteTask = async (task: OnboardingTask) => {
    if (!confirm(`Are you sure you want to delete "${task.name}"?`)) return;
    
    try {
      await deleteOnboardingTask(task.task_id);
      await loadTasks();
      toast.success('Task deleted');
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleEditTask = (task: OnboardingTask) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleTaskCreated = () => {
    setIsCreateModalOpen(false);
    loadTasks();
  };

  const handleTaskUpdated = () => {
    setIsEditModalOpen(false);
    setEditingTask(null);
    loadTasks();
  };

  const handleTasksSeeded = (insertedCount: number) => {
    setIsSeedModalOpen(false);
    loadTasks();
    toast.success(`Seeded ${insertedCount} tasks successfully`);
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadTasks();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    loadTasks();
  }, [clientId]);

  // Merge optimistic updates with actual data
  const displayTasks = tasks.map(task => ({
    ...task,
    ...optimisticUpdates.get(task.task_id)
  }));

  // Sort tasks: overdue first, then by due date, then by task_id
  const sortedTasks = displayTasks.sort((a, b) => {
    const now = new Date();
    const aDue = a.due_utc ? new Date(a.due_utc) : null;
    const bDue = b.due_utc ? new Date(b.due_utc) : null;
    
    // Check if overdue
    const aOverdue = aDue && aDue < now;
    const bOverdue = bDue && bDue < now;
    
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    
    // Then by due date (nulls last)
    if (aDue && bDue) return aDue.getTime() - bDue.getTime();
    if (aDue && !bDue) return -1;
    if (!aDue && bDue) return 1;
    
    // Finally by task_id
    return a.task_id - b.task_id;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-zinc-400">Loading onboarding tasks...</span>
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
            <CheckCircle2 className="text-emerald-400" size={28} />
            Onboarding Tasks
          </h2>
          <p className="text-zinc-400 mt-1">
            Manage client onboarding checklist and track progress
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
            variant="outline" 
            onClick={() => setIsSeedModalOpen(true)}
            className="gap-2"
          >
            <Package size={16} />
            Seed from Pack
          </Button>
          <Button 
            variant="primary" 
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-2"
          >
            <Plus size={16} />
            New Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={16} />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="text-zinc-400" size={16} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 text-white px-3 py-2 rounded-lg focus:border-cyan-500 focus:outline-none"
          >
            <option value="">All Tasks</option>
            <option value="open">Open</option>
            <option value="done">Completed</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl overflow-hidden">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle2 className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-zinc-400 mb-2">
              {searchQuery || statusFilter ? 'No tasks found' : 'No onboarding tasks'}
            </h3>
            <p className="text-zinc-500 mb-6">
              {searchQuery || statusFilter 
                ? 'Try adjusting your filters' 
                : 'Create tasks or seed from a task pack to get started'
              }
            </p>
            <div className="flex gap-3 justify-center">
              <Button 
                variant="outline" 
                onClick={() => setIsSeedModalOpen(true)}
                className="gap-2"
              >
                <Package size={16} />
                Seed from Pack
              </Button>
              <Button 
                variant="primary" 
                onClick={() => setIsCreateModalOpen(true)}
                className="gap-2"
              >
                <Plus size={16} />
                Create Task
              </Button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {sortedTasks.map((task) => {
              const dueDate = task.due_utc ? new Date(task.due_utc) : null;
              const isOverdue = dueDate && dueDate < new Date();
              const isDone = task.status === 'done';

              return (
                <div
                  key={task.task_id}
                  className={`p-6 hover:bg-zinc-800/30 transition-colors ${isDone ? 'opacity-75' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Status Toggle */}
                    <button
                      onClick={() => handleStatusToggle(task)}
                      className="mt-1 hover:scale-110 transition-transform"
                    >
                      {isDone ? (
                        <CheckCircle2 className="text-emerald-400" size={20} />
                      ) : (
                        <Circle className="text-zinc-400 hover:text-cyan-400" size={20} />
                      )}
                    </button>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className={`font-medium ${isDone ? 'text-zinc-400 line-through' : 'text-white'}`}>
                          {task.name}
                        </h4>
                        
                        {/* Status & Due Date */}
                        <div className="flex items-center gap-2 ml-4">
                          {dueDate && (
                            <div className={`flex items-center gap-1 text-sm ${
                              isOverdue && !isDone 
                                ? 'text-red-400' 
                                : isDone 
                                ? 'text-zinc-500' 
                                : 'text-zinc-400'
                            }`}>
                              {isOverdue && !isDone && <AlertTriangle size={14} />}
                              <Calendar size={14} />
                              <span>{dueDate.toLocaleDateString()}</span>
                            </div>
                          )}
                          
                          <Badge variant={isDone ? 'success' : 'muted'} className="text-xs">
                            {task.status || 'open'}
                          </Badge>
                        </div>
                      </div>

                      {task.description && (
                        <p className={`text-sm mb-3 ${isDone ? 'text-zinc-500' : 'text-zinc-400'}`}>
                          {task.description}
                        </p>
                      )}

                      {/* Overdue Warning */}
                      {isOverdue && !isDone && (
                        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">
                          <AlertTriangle size={14} />
                          <span>Overdue by {Math.ceil((new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))} days</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {isDone && (
                        <button
                          onClick={() => handleStatusToggle(task)}
                          className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-white"
                          title="Reopen task"
                        >
                          <RotateCcw size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleEditTask(task)}
                        className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-white"
                        title="Edit task"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task)}
                        className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-red-400"
                        title="Delete task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateTaskModal
          open={isCreateModalOpen}
          clientId={clientId}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleTaskCreated}
        />
      )}

      {isEditModalOpen && editingTask && (
        <EditTaskModal
          open={isEditModalOpen}
          task={editingTask}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingTask(null);
          }}
          onSuccess={handleTaskUpdated}
        />
      )}

      {isSeedModalOpen && (
        <SeedTaskPackModal
          open={isSeedModalOpen}
          clientId={clientId}
          onClose={() => setIsSeedModalOpen(false)}
          onSuccess={handleTasksSeeded}
        />
      )}
    </div>
  );
}
