import React from 'react';
import { Button } from '../ui/button.tsx';
import { Input } from '../ui/input.tsx';
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter } from '../ui/dialog.tsx';
import { getClientsOverview, createEngagement, listClientEngagements, updateClientEngagement, deleteClientEngagement } from '../services/api.ts';
import type { ClientsOverviewItem } from '../services/models.ts';
import { formatUtc } from '../utils/date.ts';
import { Briefcase, Search, PlusCircle, Eye, Pencil, Trash2 } from 'lucide-react';
import { toast } from '../lib/toast.ts';

export default function ClientsEngagementsRoute() {
  const [search, setSearch] = React.useState('');
  const [createOpen, setCreateOpen] = React.useState(false);
  const [clients, setClients] = React.useState<ClientsOverviewItem[]>([]);
  const [engagements, setEngagements] = React.useState<any[]>([]);
  const [clientFilter, setClientFilter] = React.useState<number | ''>('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(20);
  const [total, setTotal] = React.useState<number | undefined>(undefined);
  const [compact, setCompact] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [ovr, eng] = await Promise.all([
          getClientsOverview(200),
          listClientEngagements(page, limit),
        ]);
        if (!cancelled) {
          setClients(ovr.data || []);
          const list = (eng && (eng.data ?? eng)) || [];
          setEngagements(Array.isArray(list) ? list : []);
          const meta = (eng && (eng.meta ?? (eng as any).meta)) || undefined;
          if (meta) setTotal(meta.total);
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load');
      } finally { setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [page, limit]);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Engagements</h1>
          <p className="text-sm text-[var(--text-2)]">Create and track client projects.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" size="sm" onClick={()=>setCreateOpen(true)} title="Add Project" aria-label="Add Project">
            <PlusCircle size={16} />
          </Button>
          <Button variant="minimal" size="sm" onClick={()=>setCompact(v=>!v)} title={compact ? 'Normal view' : 'Compact view'} aria-label="Toggle view">
            <Eye size={16} />
          </Button>
          <div className="relative ml-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70" />
            <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search projects… (coming soon)" className="pl-9 input-search w-72" />
          </div>
        </div>
      </div>

      <div className="content-container p-6">
        {loading && <div className="text-sm text-[var(--text-2)]">Loading…</div>}
        {!loading && error && <div className="text-sm text-red-400">{error}</div>}
        {!loading && !error && (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div>
                <div className="text-xs text-[var(--text-2)] mb-1">Filter by client</div>
                <select className="select" value={clientFilter} onChange={e=>setClientFilter(e.target.value ? Number(e.target.value) : '')}>
                  <option value="">All clients</option>
                  {clients.map(c => (<option key={c.client_id} value={Number(c.client_id)}>{c.client_name}</option>))}
                </select>
              </div>
              <div>
                <div className="text-xs text-[var(--text-2)] mb-1">Page size</div>
                <select className="select" value={limit} onChange={e=>{ setPage(1); setLimit(Number(e.target.value)); }}>
                  {[10,20,50,100].map(n => (<option key={n} value={n}>{n}</option>))}
                </select>
              </div>
            </div>
            <table className={`table-modern ${compact ? 'text-xs' : 'text-sm'} rounded-xl overflow-hidden`}>
              <thead className="text-left border-b border-[var(--border-subtle)]">
                <tr>
                  <th>Title</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Start</th>
                  <th>End</th>
                  <th className="cell-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {engagements
                  .filter(e => !clientFilter || Number(e.client_id) === Number(clientFilter))
                  .filter(e => !search.trim() || String(e.title || '').toLowerCase().includes(search.trim().toLowerCase()))
                  .map(e => {
                    const client = clients.find(c => Number(c.client_id) === Number(e.client_id));
                    const status = String(e.status || 'Planned');
                    const statusCls = status.toLowerCase().includes('active') ? 'badge-emerald' : status.toLowerCase().includes('hold') ? 'badge-muted' : 'badge-soft';
                    return (
                      <tr key={e.engagement_id} className="last:border-0">
                        <td className="font-medium"><a className="hover:underline" href={`/clients/engagements/${e.engagement_id}`}>{e.title || e.name || '-'}</a></td>
                        <td>{client ? client.client_name : e.client_id}</td>
                        <td><span className={`badge ${statusCls}`}>{status}</span></td>
              <td>{(e.start_date ?? e.start_utc ?? e.startDate) ? new Date(e.start_date ?? e.start_utc ?? e.startDate).toLocaleDateString() : '-'}</td>
                <td>{(e.end_date ?? e.end_utc ?? e.endDate) ? new Date(e.end_date ?? e.end_utc ?? e.endDate).toLocaleDateString() : '-'}</td>
                        <td className="cell-actions">
                          <RowActions engagement={e} onUpdated={()=>{ setPage(p=>p); }} />
                        </td>
                      </tr>
                    );
                  })}
                {engagements.length === 0 && (
                  <tr><td colSpan={5} className="p-3 text-[var(--text-2)]">No engagements found</td></tr>
                )}
              </tbody>
            </table>
            <div className="flex items-center justify-between mt-3 text-xs text-[var(--text-2)]">
              <div>{typeof total === 'number' ? `Total: ${total}` : ''}</div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}>Prev</Button>
                <span>Page {page}</span>
                <Button size="sm" variant="ghost" onClick={()=>setPage(p=>p+1)} disabled={typeof total==='number' ? page*limit >= total : false}>Next</Button>
              </div>
            </div>
          </>
        )}
      </div>

      {createOpen && (
        <CreateEngagementSimple clients={clients} onClose={()=>setCreateOpen(false)} onCreated={()=>setCreateOpen(false)} />
      )}
    </div>
  );
}

function RowActions({ engagement, onUpdated }:{ engagement:any; onUpdated:()=>void }) {
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState(engagement.title || engagement.name || '');
  const [status, setStatus] = React.useState(engagement.status || 'Planned');
  const [start, setStart] = React.useState<string>(engagement.start_date ?? engagement.start_utc ?? engagement.startDate ? String(engagement.start_date ?? engagement.start_utc ?? engagement.startDate).slice(0,10) : '');
  const [end, setEnd] = React.useState<string>(engagement.end_date ?? engagement.end_utc ?? engagement.endDate ? String(engagement.end_date ?? engagement.end_utc ?? engagement.endDate).slice(0,10) : '');
  const [saving, setSaving] = React.useState(false);

  const save = async () => {
  try {
  setSaving(true);
  const payload: any = { title: title || undefined, status };
  if (start) payload.start_date = start; else payload.start_date = undefined;
  if (end) payload.end_date = end; else payload.end_date = undefined;
  await updateClientEngagement(Number(engagement.engagement_id), payload as any);
      setOpen(false);
      onUpdated();
    } catch (e:any) {
      // eslint-disable-next-line no-alert
      alert(e?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const del = async () => {
    if (!window.confirm('Delete this engagement?')) return;
    try {
      await deleteClientEngagement(Number(engagement.engagement_id));
      onUpdated();
    } catch (e:any) {
      // eslint-disable-next-line no-alert
      alert(e?.message || 'Delete failed');
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button className="icon-btn-sm" title="Edit" aria-label="Edit" onClick={()=>setOpen(true)}><Pencil size={14} /></button>
      <button className="icon-btn-sm" title="Delete" aria-label="Delete" onClick={del}><Trash2 size={14} /></button>
      {open && (
        <Dialog open onOpenChange={(o)=>{ if(!o) setOpen(false); }}>
          <DialogContent>
            <DialogHeader title="Edit Engagement" />
            <DialogBody>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-[var(--text-2)] mb-1">Title</div>
                  <Input value={title} onChange={e=>setTitle(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-[var(--text-2)] mb-1">Status</div>
                    <select className="select w-full" value={status} onChange={e=>setStatus(e.target.value)}>
                      <option>Planned</option>
                      <option>Active</option>
                      <option>On Hold</option>
                      <option>Complete</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-[var(--text-2)] mb-1">Start</div>
                    <input type="date" className="input w-full" value={start} onChange={e=>setStart(e.target.value)} />
                  </div>
                  <div>
                    <div className="text-xs text-[var(--text-2)] mb-1">End</div>
                    <input type="date" className="input w-full" value={end} onChange={e=>setEnd(e.target.value)} />
                  </div>
                </div>
              </div>
            </DialogBody>
            <DialogFooter>
              <div className="flex items-center justify-between gap-3">
                <Button variant="ghost" onClick={()=>setOpen(false)} disabled={saving}>Cancel</Button>
                <Button variant="primary" onClick={save} disabled={saving || !title.trim()}>{saving ? 'Saving…' : 'Save'}</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function CreateEngagementSimple({ clients, onClose, onCreated }:{ clients: ClientsOverviewItem[]; onClose:()=>void; onCreated:()=>void }) {
  const [clientId, setClientId] = React.useState<number | ''>('');
  const [name, setName] = React.useState('');
  const [status, setStatus] = React.useState('Planned');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    if (!clientId) { setErr('Choose a client'); return; }
    if (!name.trim()) { setErr('Name required'); return; }
    try {
      setSaving(true);
      const payload: any = {
        client_id: Number(clientId),
        name: name.trim(),
        status,
        start_utc: startDate ? new Date(startDate + 'T00:00:00Z').toISOString() : null,
        end_utc: endDate ? new Date(endDate + 'T00:00:00Z').toISOString() : null,
      };
      await createEngagement(payload);
      toast.success('Engagement created');
      onCreated();
    } catch (e: any) { setErr(e?.message || 'Create failed'); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open onOpenChange={(o)=>{ if(!o) onClose(); }}>
      <DialogContent>
        <DialogHeader title="New Project" />
        {err && <div className="text-sm text-red-500 px-6 pt-3">{err}</div>}
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
              <div>
                <div className="text-xs text-[var(--text-2)] mb-1">Status</div>
                <select className="select w-full" value={status} onChange={e=>setStatus(e.target.value)}>
                  <option>Planned</option>
                  <option>Active</option>
                  <option>On Hold</option>
                  <option>Complete</option>
                </select>
              </div>
            </div>
            <div>
              <div className="text-xs text-[var(--text-2)] mb-1">Name</div>
              <Input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g., Q4 Efficiency Audit" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-[var(--text-2)] mb-1">Start</div>
                <input type="date" className="input w-full" value={startDate} onChange={e=>setStartDate(e.target.value)} />
              </div>
              <div>
                <div className="text-xs text-[var(--text-2)] mb-1">End</div>
                <input type="date" className="input w-full" value={endDate} onChange={e=>setEndDate(e.target.value)} />
              </div>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button variant="primary" onClick={submit} disabled={saving || !clientId || !name.trim()}>{saving ? 'Saving…' : 'Create'}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
