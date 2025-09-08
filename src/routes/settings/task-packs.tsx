import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button.tsx';
import { Input } from '../../ui/input.tsx';
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter } from '../../ui/dialog.tsx';
import { Badge } from '../../ui/badge.tsx';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Package, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  EyeOff,
  Copy,
  Download,
  Upload,
  Settings,
  ArrowUpDown,
  Calendar,
  User,
  Tag,
  FileText,
  Archive,
  Activity
} from 'lucide-react';
import { api } from '../../api/generated/client.ts';
import { toast } from '../../lib/toast.ts';

interface TaskPack {
  pack_id: number;
  pack_code: string;
  pack_name: string;
  description?: string | null;
  status_scope?: 'active' | 'prospect' | null;
  is_active?: boolean;
  effective_from_utc?: string | null;
  effective_to_utc?: string | null;
}

interface PackTask {
  task_id: number;
  pack_id: number;
  name: string;
  sort_order: number;
  due_days: number;
  status_scope?: 'active' | 'prospect' | null;
  is_active?: boolean;
}

export default function TaskPackSettings() {
  const [taskPacks, setTaskPacks] = useState<TaskPack[]>([]);
  const [selectedPack, setSelectedPack] = useState<TaskPack | null>(null);
  const [packTasks, setPackTasks] = useState<PackTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [createPackOpen, setCreatePackOpen] = useState(false);
  const [editPackOpen, setEditPackOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<PackTask | null>(null);

  // Load task packs
  const loadTaskPacks = async () => {
    try {
      setLoading(true);
      const response = await api.listTaskPacks({ page: 1, page_size: 200, include_inactive: 1 });
      setTaskPacks(response.data || []);
    } catch (error: any) {
      toast.error?.(error?.message || 'Failed to load task packs');
    } finally {
      setLoading(false);
    }
  };

  // Load tasks for selected pack
  const loadPackTasks = async (packId: number) => {
    try {
      const response = await api.listPackTasks(packId, { page: 1, page_size: 200 });
      setPackTasks(response.data || []);
    } catch (error: any) {
      toast.error?.(error?.message || 'Failed to load pack tasks');
    }
  };

  useEffect(() => {
    loadTaskPacks();
  }, []);

  useEffect(() => {
    if (selectedPack) {
      loadPackTasks(selectedPack.pack_id);
    } else {
      setPackTasks([]);
    }
  }, [selectedPack]);

  // Filter task packs
  const filteredPacks = taskPacks.filter(pack => {
    const matchesSearch = pack.pack_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pack.pack_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (pack.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && pack.is_active) ||
                         (statusFilter === 'inactive' && !pack.is_active);
    
    return matchesSearch && matchesStatus;
  });

  const handleDeletePack = async (pack: TaskPack) => {
    if (!window.confirm(`Are you sure you want to delete "${pack.pack_name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.deleteTaskPack(pack.pack_id);
      toast.success?.('Task pack deleted successfully');
      await loadTaskPacks();
      if (selectedPack?.pack_id === pack.pack_id) {
        setSelectedPack(null);
      }
    } catch (error: any) {
      toast.error?.(error?.message || 'Failed to delete task pack');
    }
  };

  const handleTogglePackActive = async (pack: TaskPack) => {
    try {
      await api.toggleTaskPackActive(pack.pack_id, !pack.is_active);
      toast.success?.(`Task pack ${!pack.is_active ? 'activated' : 'deactivated'} successfully`);
      await loadTaskPacks();
    } catch (error: any) {
      toast.error?.(error?.message || 'Failed to update task pack status');
    }
  };

  const handleDeleteTask = async (task: PackTask) => {
    if (!window.confirm(`Are you sure you want to delete "${task.name}"?`)) {
      return;
    }

    try {
      await api.deletePackTask(task.pack_id, task.task_id);
      toast.success?.('Task deleted successfully');
      if (selectedPack) {
        await loadPackTasks(selectedPack.pack_id);
      }
    } catch (error: any) {
      toast.error?.(error?.message || 'Failed to delete task');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-zinc-400">Loading task packs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Task Pack Management</h2>
          <p className="text-zinc-400">Create and manage onboarding task templates for different client types</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download size={16} />
            Export
          </Button>
          <Button variant="primary" onClick={() => setCreatePackOpen(true)} className="gap-2">
            <Plus size={16} />
            New Task Pack
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Packs List */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl overflow-hidden">
            {/* Filters */}
            <div className="p-4 border-b border-zinc-800">
              <div className="space-y-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <Input
                    placeholder="Search task packs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                    className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Task Packs List */}
            <div className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-track-zinc-900 scrollbar-thumb-zinc-700">
              {filteredPacks.length === 0 ? (
                <div className="p-8 text-center">
                  <Package className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-zinc-400 mb-2">No task packs found</h3>
                  <p className="text-zinc-500 text-sm">Create your first task pack to get started</p>
                </div>
              ) : (
                filteredPacks.map((pack) => (
                  <div
                    key={pack.pack_id}
                    className={`p-4 border-b border-zinc-800 cursor-pointer transition-all duration-200 hover:bg-zinc-800/30 ${
                      selectedPack?.pack_id === pack.pack_id ? 'bg-cyan-500/10 border-l-4 border-l-cyan-500' : ''
                    }`}
                    onClick={() => setSelectedPack(pack)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-white truncate">{pack.pack_name}</h4>
                        <p className="text-xs text-zinc-500 truncate">{pack.pack_code}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={pack.is_active ? 'success' : 'muted'} className="text-xs">
                          {pack.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPack(pack);
                              setEditPackOpen(true);
                            }}
                            className="p-1 hover:bg-zinc-700 rounded transition-colors text-zinc-400 hover:text-white"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePack(pack);
                            }}
                            className="p-1 hover:bg-zinc-700 rounded transition-colors text-zinc-400 hover:text-red-400"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                    {pack.description && (
                      <p className="text-xs text-zinc-400 line-clamp-2">{pack.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                      {pack.status_scope && (
                        <span className="flex items-center gap-1">
                          <Tag size={10} />
                          {pack.status_scope}
                        </span>
                      )}
                      {pack.effective_from_utc && (
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(pack.effective_from_utc).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Pack Details & Tasks */}
        <div className="lg:col-span-2">
          {selectedPack ? (
            <div className="space-y-6">
              {/* Pack Details */}
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-cyan-500/20">
                      <Package className="text-cyan-400" size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{selectedPack.pack_name}</h3>
                      <p className="text-zinc-400 text-sm">{selectedPack.pack_code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePackActive(selectedPack)}
                      className={`p-2 rounded-lg transition-colors ${
                        selectedPack.is_active
                          ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                          : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50'
                      }`}
                      title={selectedPack.is_active ? 'Deactivate pack' : 'Activate pack'}
                    >
                      {selectedPack.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      onClick={() => setEditPackOpen(true)}
                      className="p-2 hover:bg-zinc-800/50 rounded-lg transition-colors text-zinc-400 hover:text-white"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeletePack(selectedPack)}
                      className="p-2 hover:bg-zinc-800/50 rounded-lg transition-colors text-zinc-400 hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {selectedPack.description && (
                  <p className="text-zinc-300 mb-4">{selectedPack.description}</p>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-zinc-800/30 rounded-lg p-3">
                    <div className="text-xs text-zinc-500 mb-1">Status</div>
                    <Badge variant={selectedPack.is_active ? 'success' : 'muted'}>
                      {selectedPack.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="bg-zinc-800/30 rounded-lg p-3">
                    <div className="text-xs text-zinc-500 mb-1">Scope</div>
                    <div className="text-white text-sm">{selectedPack.status_scope || 'All'}</div>
                  </div>
                  <div className="bg-zinc-800/30 rounded-lg p-3">
                    <div className="text-xs text-zinc-500 mb-1">Tasks</div>
                    <div className="text-white text-sm font-medium">{packTasks.length}</div>
                  </div>
                </div>
              </div>

              {/* Pack Tasks */}
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                    <FileText size={18} />
                    Tasks ({packTasks.length})
                  </h4>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setCreateTaskOpen(true)}
                    className="gap-2"
                  >
                    <Plus size={14} />
                    Add Task
                  </Button>
                </div>

                <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-track-zinc-900 scrollbar-thumb-zinc-700">
                  {packTasks.length === 0 ? (
                    <div className="p-8 text-center">
                      <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                      <h5 className="text-lg font-medium text-zinc-400 mb-2">No tasks yet</h5>
                      <p className="text-zinc-500 text-sm mb-4">Add tasks to this pack to create a complete workflow</p>
                      <Button variant="primary" size="sm" onClick={() => setCreateTaskOpen(true)}>
                        <Plus size={14} className="mr-2" />
                        Add First Task
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-800">
                      {packTasks
                        .sort((a, b) => a.sort_order - b.sort_order)
                        .map((task, index) => (
                          <div key={task.task_id} className="p-4 hover:bg-zinc-800/30 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="w-6 h-6 bg-zinc-800 rounded-lg flex items-center justify-center text-xs font-medium text-zinc-400 mt-0.5">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <h6 className="font-medium text-white">{task.name}</h6>
                                  <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                                    <span className="flex items-center gap-1">
                                      <Clock size={10} />
                                      Due in {task.due_days} days
                                    </span>
                                    {task.status_scope && (
                                      <span className="flex items-center gap-1">
                                        <Tag size={10} />
                                        {task.status_scope}
                                      </span>
                                    )}
                                    <Badge variant={task.is_active ? 'success' : 'muted'} className="text-xs">
                                      {task.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    setSelectedTask(task);
                                    setEditTaskOpen(true);
                                  }}
                                  className="p-1 hover:bg-zinc-700 rounded transition-colors text-zinc-400 hover:text-white"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task)}
                                  className="p-1 hover:bg-zinc-700 rounded transition-colors text-zinc-400 hover:text-red-400"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8">
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-zinc-400 mb-2">Select a Task Pack</h3>
                <p className="text-zinc-500">Choose a task pack from the left to view and manage its tasks</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {createPackOpen && (
        <CreatePackModal
          open={createPackOpen}
          onClose={() => setCreatePackOpen(false)}
          onSuccess={() => {
            setCreatePackOpen(false);
            loadTaskPacks();
          }}
        />
      )}

      {editPackOpen && selectedPack && (
        <EditPackModal
          open={editPackOpen}
          pack={selectedPack}
          onClose={() => setEditPackOpen(false)}
          onSuccess={() => {
            setEditPackOpen(false);
            loadTaskPacks();
          }}
        />
      )}

      {createTaskOpen && selectedPack && (
        <CreateTaskModal
          open={createTaskOpen}
          packId={selectedPack.pack_id}
          onClose={() => setCreateTaskOpen(false)}
          onSuccess={() => {
            setCreateTaskOpen(false);
            if (selectedPack) {
              loadPackTasks(selectedPack.pack_id);
            }
          }}
        />
      )}

      {editTaskOpen && selectedTask && (
        <EditTaskModal
          open={editTaskOpen}
          task={selectedTask}
          onClose={() => {
            setEditTaskOpen(false);
            setSelectedTask(null);
          }}
          onSuccess={() => {
            setEditTaskOpen(false);
            setSelectedTask(null);
            if (selectedPack) {
              loadPackTasks(selectedPack.pack_id);
            }
          }}
        />
      )}
    </div>
  );
}

// Create Pack Modal
function CreatePackModal({
  open,
  onClose,
  onSuccess
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    pack_code: '',
    pack_name: '',
    description: '',
    status_scope: '' as '' | 'active' | 'prospect',
    is_active: true,
    effective_from_utc: '',
    effective_to_utc: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pack_code.trim() || !formData.pack_name.trim()) return;

    try {
      setSaving(true);
      const payload: any = {
        pack_code: formData.pack_code.trim(),
        pack_name: formData.pack_name.trim(),
        is_active: formData.is_active
      };

      if (formData.description.trim()) payload.description = formData.description.trim();
      if (formData.status_scope) payload.status_scope = formData.status_scope;
      if (formData.effective_from_utc) payload.effective_from_utc = new Date(formData.effective_from_utc).toISOString();
      if (formData.effective_to_utc) payload.effective_to_utc = new Date(formData.effective_to_utc).toISOString();

      await api.createTaskPack(payload);
      toast.success?.('Task pack created successfully');
      onSuccess();
    } catch (error: any) {
      toast.error?.(error?.message || 'Failed to create task pack');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader title="Create New Task Pack" />
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Pack Code *
                  </label>
                  <Input
                    value={formData.pack_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, pack_code: e.target.value }))}
                    placeholder="e.g., ONBOARD-STD"
                    required
                  />
                  <p className="text-xs text-zinc-500 mt-1">Unique identifier for this pack</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Pack Name *
                  </label>
                  <Input
                    value={formData.pack_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, pack_name: e.target.value }))}
                    placeholder="e.g., Standard Onboarding"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this task pack is for..."
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Status Scope
                  </label>
                  <select
                    value={formData.status_scope}
                    onChange={(e) => setFormData(prev => ({ ...prev, status_scope: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">All Client Types</option>
                    <option value="active">Active Clients Only</option>
                    <option value="prospect">Prospects Only</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="w-4 h-4 text-cyan-600 bg-zinc-800 border-zinc-600 rounded focus:ring-cyan-500"
                    />
                    <span className="text-sm text-zinc-300">Active</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Effective From
                  </label>
                  <input
                    type="date"
                    value={formData.effective_from_utc}
                    onChange={(e) => setFormData(prev => ({ ...prev, effective_from_utc: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Effective To
                  </label>
                  <input
                    type="date"
                    value={formData.effective_to_utc}
                    onChange={(e) => setFormData(prev => ({ ...prev, effective_to_utc: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={saving || !formData.pack_code.trim() || !formData.pack_name.trim()}>
                {saving ? 'Creating...' : 'Create Task Pack'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Edit Pack Modal
function EditPackModal({
  open,
  pack,
  onClose,
  onSuccess
}: {
  open: boolean;
  pack: TaskPack;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    pack_code: pack.pack_code || '',
    pack_name: pack.pack_name || '',
    description: pack.description || '',
    status_scope: pack.status_scope || '' as '' | 'active' | 'prospect',
    is_active: pack.is_active ?? true,
    effective_from_utc: pack.effective_from_utc ? pack.effective_from_utc.split('T')[0] : '',
    effective_to_utc: pack.effective_to_utc ? pack.effective_to_utc.split('T')[0] : ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pack_code.trim() || !formData.pack_name.trim()) return;

    try {
      setSaving(true);
      const payload: any = {
        pack_code: formData.pack_code.trim(),
        pack_name: formData.pack_name.trim(),
        is_active: formData.is_active
      };

      if (formData.description.trim()) payload.description = formData.description.trim();
      if (formData.status_scope) payload.status_scope = formData.status_scope;
      if (formData.effective_from_utc) payload.effective_from_utc = new Date(formData.effective_from_utc).toISOString();
      if (formData.effective_to_utc) payload.effective_to_utc = new Date(formData.effective_to_utc).toISOString();

      await api.updateTaskPack(pack.pack_id, payload);
      toast.success?.('Task pack updated successfully');
      onSuccess();
    } catch (error: any) {
      toast.error?.(error?.message || 'Failed to update task pack');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader title="Edit Task Pack" />
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Pack Code *
                  </label>
                  <Input
                    value={formData.pack_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, pack_code: e.target.value }))}
                    placeholder="e.g., ONBOARD-STD"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Pack Name *
                  </label>
                  <Input
                    value={formData.pack_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, pack_name: e.target.value }))}
                    placeholder="e.g., Standard Onboarding"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this task pack is for..."
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Status Scope
                  </label>
                  <select
                    value={formData.status_scope}
                    onChange={(e) => setFormData(prev => ({ ...prev, status_scope: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">All Client Types</option>
                    <option value="active">Active Clients Only</option>
                    <option value="prospect">Prospects Only</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="w-4 h-4 text-cyan-600 bg-zinc-800 border-zinc-600 rounded focus:ring-cyan-500"
                    />
                    <span className="text-sm text-zinc-300">Active</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Effective From
                  </label>
                  <input
                    type="date"
                    value={formData.effective_from_utc}
                    onChange={(e) => setFormData(prev => ({ ...prev, effective_from_utc: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Effective To
                  </label>
                  <input
                    type="date"
                    value={formData.effective_to_utc}
                    onChange={(e) => setFormData(prev => ({ ...prev, effective_to_utc: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={saving || !formData.pack_code.trim() || !formData.pack_name.trim()}>
                {saving ? 'Updating...' : 'Update Task Pack'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Create Task Modal
function CreateTaskModal({
  open,
  packId,
  onClose,
  onSuccess
}: {
  open: boolean;
  packId: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    sort_order: 1,
    due_days: 7,
    status_scope: '' as '' | 'active' | 'prospect',
    is_active: true
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setSaving(true);
      const payload: any = {
        name: formData.name.trim(),
        sort_order: formData.sort_order,
        due_days: formData.due_days,
        is_active: formData.is_active
      };

      if (formData.status_scope) payload.status_scope = formData.status_scope;

      await api.createPackTask(packId, payload);
      toast.success?.('Task created successfully');
      onSuccess();
    } catch (error: any) {
      toast.error?.(error?.message || 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader title="Create New Task" />
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Task Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Schedule kickoff call"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Sort Order
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.sort_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 1 }))}
                  />
                  <p className="text-xs text-zinc-500 mt-1">Order in which this task appears</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Due Days
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.due_days}
                    onChange={(e) => setFormData(prev => ({ ...prev, due_days: parseInt(e.target.value) || 0 }))}
                  />
                  <p className="text-xs text-zinc-500 mt-1">Days after onboarding starts</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Status Scope
                  </label>
                  <select
                    value={formData.status_scope}
                    onChange={(e) => setFormData(prev => ({ ...prev, status_scope: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">All Client Types</option>
                    <option value="active">Active Clients Only</option>
                    <option value="prospect">Prospects Only</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="w-4 h-4 text-cyan-600 bg-zinc-800 border-zinc-600 rounded focus:ring-cyan-500"
                    />
                    <span className="text-sm text-zinc-300">Active</span>
                  </label>
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={saving || !formData.name.trim()}>
                {saving ? 'Creating...' : 'Create Task'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Edit Task Modal
function EditTaskModal({
  open,
  task,
  onClose,
  onSuccess
}: {
  open: boolean;
  task: PackTask;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: task.name || '',
    sort_order: task.sort_order || 1,
    due_days: task.due_days || 7,
    status_scope: task.status_scope || '' as '' | 'active' | 'prospect',
    is_active: task.is_active ?? true
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setSaving(true);
      const payload: any = {
        name: formData.name.trim(),
        sort_order: formData.sort_order,
        due_days: formData.due_days,
        is_active: formData.is_active
      };

      if (formData.status_scope) payload.status_scope = formData.status_scope;

      await api.updatePackTask(task.pack_id, task.task_id, payload);
      toast.success?.('Task updated successfully');
      onSuccess();
    } catch (error: any) {
      toast.error?.(error?.message || 'Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader title="Edit Task" />
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Task Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Schedule kickoff call"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Sort Order
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.sort_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Due Days
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.due_days}
                    onChange={(e) => setFormData(prev => ({ ...prev, due_days: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Status Scope
                  </label>
                  <select
                    value={formData.status_scope}
                    onChange={(e) => setFormData(prev => ({ ...prev, status_scope: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">All Client Types</option>
                    <option value="active">Active Clients Only</option>
                    <option value="prospect">Prospects Only</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="w-4 h-4 text-cyan-600 bg-zinc-800 border-zinc-600 rounded focus:ring-cyan-500"
                    />
                    <span className="text-sm text-zinc-300">Active</span>
                  </label>
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={saving || !formData.name.trim()}>
                {saving ? 'Updating...' : 'Update Task'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
