import React from 'react';
import { PageTitleEditorial } from '../components/PageTitles.tsx';
import OnboardingTasksAdvancedTable from '../components/OnboardingTasksAdvancedTable.tsx';
import { Button } from '../ui/button.tsx';
import { Input } from '../ui/input.tsx';
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter } from '../ui/dialog.tsx';
import { createOnboardingTask, getClientsOverview } from '../services/api.ts';
import type { ClientsOverviewItem } from '../services/models.ts';
import { toast } from '../lib/toast.ts';

export default function ClientsOnboardingTasksRoute() {
  const [createOpen, setCreateOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#101010] text-white">
      <div className="p-6 space-y-6">
        <PageTitleEditorial
          eyebrow="Client Management"
          title="Global Onboarding Tasks"
          subtitle="Plan and track onboarding tasks for clients across all projects"
        />
        
        <OnboardingTasksAdvancedTable onCreateTask={() => setCreateOpen(true)} />
        
        {createOpen && (
          <GlobalCreateTaskModal 
            open={createOpen}
            onClose={() => setCreateOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

function GlobalCreateTaskModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [clients, setClients] = React.useState<ClientsOverviewItem[]>([]);
  const [clientId, setClientId] = React.useState<number | ''>('');
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [dueDate, setDueDate] = React.useState('');
  const [status, setStatus] = React.useState<'pending' | 'complete'>('pending');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      getClientsOverview(200).then(response => {
        if (response?.data) {
          setClients(response.data);
        }
      });
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!clientId || !name.trim()) return;
    
    try {
      setLoading(true);
      await createOnboardingTask({
        client_id: Number(clientId),
        name: name.trim(),
        description: description.trim() || undefined,
        due_utc: dueDate ? new Date(dueDate + 'T00:00:00Z').toISOString() : undefined,
        status
      });
      
      toast.success('Task created successfully');
      onClose();
      
      // Reset form
      setClientId('');
      setName('');
      setDescription('');
      setDueDate('');
      setStatus('pending');
    } catch (error) {
      toast.error('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader title="Create New Onboarding Task" />
        <DialogBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-1)] mb-2">
                Client
              </label>
              <select 
                value={clientId} 
                onChange={(e) => setClientId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-lg text-white focus:outline-none focus:border-[var(--accent)]"
              >
                <option value="">Select a client...</option>
                {clients.map(client => (
                  <option key={client.client_id} value={client.client_id}>
                    {client.client_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--text-1)] mb-2">
                Task Name
              </label>
              <Input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Initial kickoff call"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--text-1)] mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Additional details about this task..."
                className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-lg text-white placeholder-[var(--text-2)] focus:outline-none focus:border-[var(--accent)] h-20 resize-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-1)] mb-2">
                  Due Date (Optional)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-lg text-white focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--text-1)] mb-2">
                  Status
                </label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value as 'pending' | 'complete')}
                  className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-lg text-white focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="pending">Pending</option>
                  <option value="complete">Complete</option>
                </select>
              </div>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSubmit}
              disabled={loading || !clientId || !name.trim()}
            >
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}