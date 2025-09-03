import React from 'react';
import { Button } from '../ui/button.tsx';
import { Input } from '../ui/input.tsx';
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter } from '../ui/dialog.tsx';
import { ClipboardList, Search, PlusCircle, Eye, Pencil, Trash2 } from 'lucide-react';
import { listOnboardingTasks, createOnboardingTask, updateOnboardingTask, deleteOnboardingTask, getClientsOverview } from '../services/api.ts';
import type { ClientsOverviewItem } from '../services/models.ts';
import { PageTitleEditorial } from '../components/PageTitles.tsx';

export default function ClientsOnboardingTasksRoute() {
  const [search, setSearch] = React.useState('');
  const [createOpen, setCreateOpen] = React.useState(false);
  const [tasks, setTasks] = React.useState<any[]>([]);
  const [clients, setClients] = React.useState<ClientsOverviewItem[]>([]);
  const [clientFilter, setClientFilter] = React.useState<number | ''>('');
  const [loading, setLoading] = React.useState(false);
  const [compact, setCompact] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const load = React.useCallback(async ()=>{
    setLoading(true); setErr(null);
    try {
      const [t, c] = await Promise.all([
        listOnboardingTasks(1, 200, clientFilter ? Number(clientFilter) : undefined),
        getClientsOverview(200),
      ]);
      setTasks((t && (t.data ?? t)) || []);
      setClients(c.data || []);
    } catch (e:any) { setErr(e?.message || 'Failed to load'); }
    finally { setLoading(false); }
  }, [clientFilter]);

  React.useEffect(()=>{ load(); }, [load]);

  return (
    <div className="space-y-5">
      <PageTitleEditorial
        eyebrow="Client Management"
        title="Onboarding Tasks"
        subtitle="Plan and track onboarding tasks for clients across all projects"
      />
      
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" size="sm" onClick={()=>setCreateOpen(true)} title="Add Task" aria-label="Add Task">
            <PlusCircle size={16} />
          </Button>
          <Button variant="minimal" size="sm" onClick={()=>setCompact(v=>!v)} title={compact ? 'Normal view' : 'Compact view'} aria-label="Toggle view">
            <Eye size={16} />
          </Button>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70" />
          <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tasks… (coming soon)" className="pl-9 input-search w-72" />
        </div>
      </div>

      <div className="card p-6" style={{ background: '#181818' }}>
        <div className="flex items-center gap-3 mb-3">
          <div>
            <div className="text-xs text-[var(--text-2)] mb-1">Filter by client</div>
            <select className="select" value={clientFilter} onChange={e=>setClientFilter(e.target.value ? Number(e.target.value) : '')}>
              <option value="">All clients</option>
              {clients.map(c => (<option key={c.client_id} value={Number(c.client_id)}>{c.client_name}</option>))}
            </select>
          </div>
        </div>
        {loading && <div className="text-sm text-[var(--text-2)]">Loading…</div>}
        {!loading && err && <div className="text-sm text-red-500">{err}</div>}
        {!loading && !err && (
          <table className={`table-modern ${compact ? 'text-xs' : 'text-sm'} rounded-xl overflow-hidden`}>
            <thead className="text-left border-b border-[var(--border-subtle)]">
              <tr>
                <th>Title</th>
                <th>Client</th>
                <th>Status</th>
                <th>Due</th>
                <th className="cell-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks
                .filter(r => !search.trim() || String(r.title || '').toLowerCase().includes(search.trim().toLowerCase()))
                .map(t => {
                  const client = clients.find(c => Number(c.client_id) === Number(t.client_id));
                  const status = String(t.status || 'Planned');
                  const statusCls = status.toLowerCase().includes('done') ? 'badge-emerald' : status.toLowerCase().includes('progress') ? 'badge-soft' : 'badge-muted';
                  return (
                    <tr key={t.task_id} className="last:border-0">
                      <td className="font-medium">{t.title}</td>
                      <td>{client ? client.client_name : t.client_id}</td>
                      <td><span className={`badge ${statusCls}`}>{status}</span></td>
                      <td>{t.due_date ? new Date(t.due_date).toLocaleDateString() : '-'}</td>
                      <td className="cell-actions"><TaskActions task={t} onChanged={load} clients={clients} /></td>
                    </tr>
                  );
                })}
              {tasks.length === 0 && (<tr><td colSpan={5} className="p-3 text-[var(--text-2)]">No tasks</td></tr>)}
            </tbody>
          </table>
        )}
      </div>

      {createOpen && (
        <NewTask onClose={()=>{ setCreateOpen(false); load(); }} clients={clients} />
      )}
    </div>
  );
}

function NewTask({ onClose, clients }:{ onClose:()=>void; clients: ClientsOverviewItem[] }) {
  const [clientId, setClientId] = React.useState<number | ''>('');
  const [title, setTitle] = React.useState('');
  const [dueDate, setDueDate] = React.useState('');
  const [status, setStatus] = React.useState('Planned');
  const [saving, setSaving] = React.useState(false);

  const submit = async () => {
    if (!clientId || !title.trim()) return;
    try {
      setSaving(true);
      const due = dueDate ? new Date(dueDate + 'T00:00:00Z').toISOString() : undefined;
      await createOnboardingTask({ client_id: Number(clientId), title: title.trim(), due_date: due, status });
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <Dialog open onOpenChange={(o)=>{ if(!o) onClose(); }}>
      <DialogContent>
        <DialogHeader title="New Onboarding Task" />
        <DialogBody>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-[var(--text-2)] mb-1">Client</div>
                <select className="select w-full" value={clientId} onChange={e=>setClientId(e.target.value ? Number(e.target.value) : '')}>
                  <option value="">Select client…</option>
                  {clients.map(c => (<option key={c.client_id} value={Number(c.client_id)}>{c.client_name}</option>))}
                </select>
              </div>
              <div />
            </div>
            <div>
              <div className="text-xs text-[var(--text-2)] mb-1">Title</div>
              <Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g., Kickoff call" />
            </div>
            <div>
              <div className="text-xs text-[var(--text-2)] mb-1">Due</div>
              <input type="date" className="input w-full" value={dueDate} onChange={e=>setDueDate(e.target.value)} />
            </div>
            <div>
              <div className="text-xs text-[var(--text-2)] mb-1">Status</div>
              <select className="select w-full" value={status} onChange={e=>setStatus(e.target.value)}>
                <option>Planned</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button variant="primary" onClick={submit} disabled={saving || !clientId || !title.trim()}>{saving ? 'Saving…' : 'Create'}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TaskActions({ task, onChanged, clients }:{ task:any; onChanged:()=>void; clients: ClientsOverviewItem[] }) {
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState(task.title || '');
  const [due, setDue] = React.useState(task.due_date ? String(task.due_date).slice(0,10) : '');
  const [status, setStatus] = React.useState(task.status || 'Planned');
  const [saving, setSaving] = React.useState(false);

  const save = async () => {
    try {
      setSaving(true);
      await updateOnboardingTask(Number(task.task_id), { title, due_date: due ? new Date(due + 'T00:00:00Z').toISOString() : undefined, status });
      setOpen(false);
      onChanged();
    } finally { setSaving(false); }
  };
  const del = async () => {
    if (!window.confirm('Delete task?')) return;
    await deleteOnboardingTask(Number(task.task_id));
    onChanged();
  };
  return (
    <div className="flex items-center gap-1">
      <button className="icon-btn-sm" title="Edit" aria-label="Edit" onClick={()=>setOpen(true)}><Pencil size={14} /></button>
      <button className="icon-btn-sm" title="Delete" aria-label="Delete" onClick={del}><Trash2 size={14} /></button>
      {open && (
        <Dialog open onOpenChange={(o)=>{ if(!o) setOpen(false); }}>
          <DialogContent>
            <DialogHeader title="Edit Task" />
            <DialogBody>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-[var(--text-2)] mb-1">Title</div>
                  <Input value={title} onChange={e=>setTitle(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-[var(--text-2)] mb-1">Due</div>
                    <input type="date" className="input w-full" value={due} onChange={e=>setDue(e.target.value)} />
                  </div>
                  <div>
                    <div className="text-xs text-[var(--text-2)] mb-1">Status</div>
                    <select className="select w-full" value={status} onChange={e=>setStatus(e.target.value)}>
                      <option>Planned</option>
                      <option>In Progress</option>
                      <option>Done</option>
                    </select>
                  </div>
                </div>
              </div>
            </DialogBody>
            <DialogFooter>
              <div className="flex items-center justify-between gap-3">
                <Button variant="ghost" onClick={()=>setOpen(false)} disabled={saving}>Cancel</Button>
                <Button variant="primary" onClick={save} disabled={saving || !title.trim()}>Save</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
