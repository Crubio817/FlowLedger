import React, { useState } from 'react';
import { Button } from '../ui/button.tsx';
import { Input } from '../ui/input.tsx';
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter } from '../ui/dialog.tsx';
import { updateOnboardingTask, type OnboardingTask } from '../services/api.ts';
import { toast } from '../lib/toast.ts';

interface EditTaskModalProps {
  open: boolean;
  task: OnboardingTask;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditTaskModal({ open, task, onClose, onSuccess }: EditTaskModalProps) {
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState(task.description || '');
  const [dueDate, setDueDate] = useState(
    task.due_utc ? new Date(task.due_utc).toISOString().split('T')[0] : ''
  );
  const [status, setStatus] = useState(task.status || 'open');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      await updateOnboardingTask(task.task_id, {
        name: name.trim(),
        description: description.trim() || undefined,
        status,
        due_utc: dueDate ? new Date(dueDate).toISOString() : undefined
      });
      
      toast.success('Task updated successfully');
      onSuccess();
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader title="Edit Task" />
        
        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4 px-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Task Name *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter task name..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional task description..."
                rows={3}
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 rounded-lg focus:border-cyan-500 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Due Date
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 rounded-lg focus:border-cyan-500 focus:outline-none"
              >
                <option value="open">Open</option>
                <option value="done">Done</option>
              </select>
            </div>
          </DialogBody>

          <DialogFooter className="flex gap-3 justify-end px-6 py-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading} disabled={!name.trim()}>
              Update Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
