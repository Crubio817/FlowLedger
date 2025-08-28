import { useEffect, useState } from 'react';
import { listInterviews, createInterview, updateInterview, deleteInterview } from '@services/api.ts';
import type { Interview as ApiInterview } from '../services/models.ts';
// Adapt Interview to include UI enums (backend currently leaves mode/status unconstrained strings)
type Interview = ApiInterview & { status?: string; mode?: string };
import { toast } from '../lib/toast.ts';
import Modal from '../components/Modal.tsx';

export default function InterviewsRoute() {
  const [rows, setRows] = useState<Interview[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState<'scheduled_utc'|'created_utc'>('scheduled_utc');
  const [order, setOrder] = useState<'asc'|'desc'>('desc');
  const [total, setTotal] = useState<number|undefined>();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string|null>(null);
  const [showCreate, setShowCreate] = useState(false);

  async function load() {
    setLoading(true); setErr(null);
    try {
      const { data, meta } = await listInterviews(page, limit, sort, order);
      setRows(data || []);
      setTotal(meta?.total);
    } catch(e:any) {
      setErr(e.message || 'Failed to load interviews');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [page, limit, sort, order]);

  return (
    <main className="p-6 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Interviews</h1>
        <button className="rounded-xl border px-3 py-2" onClick={()=>setShowCreate(true)}>New Interview</button>
      </header>

      <div className="flex gap-3 text-sm">
        <label>Sort
          <select className="ml-2 border rounded px-2 py-1" value={sort} onChange={e=>setSort(e.target.value as any)}>
            <option value="scheduled_utc">Scheduled</option>
            <option value="created_utc">Created</option>
          </select>
        </label>
        <label>Order
          <select className="ml-2 border rounded px-2 py-1" value={order} onChange={e=>setOrder(e.target.value as any)}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </label>
      </div>

      {loading ? <SkeletonTable/> :
       err ? <div className="text-red-600">{err}</div> :
       <Table rows={rows} onRefresh={load} />}

      <Pager page={page} limit={limit} total={total} setPage={setPage} setLimit={setLimit} />

      {showCreate && <CreateModal onClose={()=>setShowCreate(false)} onCreated={()=>{ setShowCreate(false); load(); }} />}
    </main>
  );
}

function Table({ rows, onRefresh }:{ rows: Interview[]; onRefresh:()=>void }) {
  return (
    <div className="overflow-x-auto rounded-2xl border">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
            <th>ID</th><th>Audit</th><th>Persona</th><th>Mode</th><th>Scheduled</th><th>Status</th><th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r=>(
            <tr key={r.interview_id} className="[&>td]:px-3 [&>td]:py-2 border-t">
              <td>{r.interview_id}</td>
              <td>{r.audit_id}</td>
              <td>{r.persona}</td>
              <td>{r.mode ?? '—'}</td>
              <td>{r.scheduled_utc ? new Date(r.scheduled_utc).toLocaleString() : '—'}</td>
              <td>{r.status}</td>
              <td className="text-right">
                <div className="flex gap-3 justify-end">
                  <a className="text-sm underline" href={`/interview-qa?interviewId=${r.interview_id}`}>Open Q&A</a>
                  <RowActions row={r} onRefresh={onRefresh} />
                </div>
              </td>
            </tr>
          ))}
          {rows.length===0 && <tr><td colSpan={7} className="text-center py-8 opacity-70">No interviews yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function RowActions({ row, onRefresh }:{ row: Interview; onRefresh:()=>void }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex gap-2 justify-end">
      <button className="text-sm underline" disabled={busy}
  onClick={async()=>{ setBusy(true); try{ await updateInterview(row.interview_id, { status: row.status==='Planned'?'Completed':'Planned' }); onRefresh(); toast.success('Updated'); } catch{ toast.error('Update failed'); } finally{ setBusy(false);} }}>
        Toggle Status
      </button>
      <button className="text-sm text-red-600 underline" disabled={busy}
  onClick={async()=>{ if(!confirm('Delete interview?')) return; setBusy(true); try{ await deleteInterview(row.interview_id); onRefresh(); toast.success('Deleted'); } catch{ toast.error('Delete failed'); } finally{ setBusy(false);} }}>
        Delete
      </button>
    </div>
  );
}

function CreateModal({ onClose, onCreated }:{ onClose:()=>void; onCreated:()=>void }) {
  const [form, setForm] = useState<Partial<Interview>>({ audit_id: 1, status: 'Planned', mode: 'Video' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string|null>(null);

  const save = async () => {
    setErr(null);
    // validation: audit_id, persona required; status in enum
    if (!form.audit_id || !form.persona) { setErr('Audit and Persona are required'); return; }
    if (!['Planned','Completed','Canceled'].includes(form.status as any)) { setErr('Invalid status'); return; }
    try {
      setSaving(true);
      await createInterview(form as any);
      onCreated();
    } catch(e:any) {
      setErr(e.message || 'Create failed');
    } finally { setSaving(false); }
  };

  return (
    <Modal title="New Interview" onClose={onClose} className="w-full max-w-lg p-4" footer={(
      <div className="flex gap-2 justify-end">
        <button className="btn-cancel border rounded px-3 py-2" onClick={onClose}>Cancel</button>
        <button className="btn-create" disabled={saving} onClick={save}>{saving?'Saving…':'Create'}</button>
      </div>
    )}>
      {err && <div className="text-sm text-red-600">{err}</div>}
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">Audit ID
          <input className="w-full border rounded px-2 py-1" type="number" value={form.audit_id ?? ''} onChange={e=>setForm(f=>({...f, audit_id: Number(e.target.value)}))}/>
        </label>
        <label className="text-sm">Persona
          <input className="w-full border rounded px-2 py-1" value={form.persona ?? ''} onChange={e=>setForm(f=>({...f, persona: e.target.value}))}/>
        </label>
        <label className="text-sm">Mode
          <select className="w-full border rounded px-2 py-1" value={form.mode ?? ''} onChange={e=>setForm(f=>({...f, mode: e.target.value as any}))}>
            <option value="Video">Video</option>
            <option value="InPerson">InPerson</option>
            <option value="Phone">Phone</option>
          </select>
        </label>
        <label className="text-sm">Status
          <select className="w-full border rounded px-2 py-1" value={form.status ?? 'Planned'} onChange={e=>setForm(f=>({...f, status: e.target.value as any}))}>
            <option>Planned</option>
            <option>Completed</option>
            <option>Canceled</option>
          </select>
        </label>
        <label className="col-span-2 text-sm">Scheduled (UTC ISO)
          <input className="w-full border rounded px-2 py-1" placeholder="2025-08-15T17:00:00Z" value={form.scheduled_utc ?? ''} onChange={e=>setForm(f=>({...f, scheduled_utc: e.target.value}))}/>
        </label>
        <label className="col-span-2 text-sm">Notes
          <textarea className="w-full border rounded px-2 py-1" rows={3} value={form.notes ?? ''} onChange={e=>setForm(f=>({...f, notes: e.target.value}))}/>
        </label>
      </div>
    </Modal>
  );
}

function Pager({ page, limit, total, setPage, setLimit }:{
  page:number; limit:number; total?:number; setPage:(n:number)=>void; setLimit:(n:number)=>void;
}) {
  const totalPages = total ? Math.max(1, Math.ceil(total/limit)) : undefined;
  return (
    <div className="flex items-center gap-3">
      <button className="border rounded px-2 py-1" onClick={()=>setPage(Math.max(1, page-1))} disabled={page<=1}>Prev</button>
      <span className="text-sm">Page {page}{totalPages?` / ${totalPages}`:''}</span>
      <button className="border rounded px-2 py-1" onClick={()=>setPage(totalPages?Math.min(totalPages, page+1):page+1)} disabled={!!totalPages && page>=totalPages}>Next</button>
      <select className="ml-4 border rounded px-2 py-1" value={limit} onChange={e=>setLimit(Number(e.target.value))}>
        <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
      </select>
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="rounded-2xl border p-4 space-y-2">
      <div className="h-4 bg-gray-200 rounded animate-pulse" />
      <div className="h-4 bg-gray-200 rounded animate-pulse" />
      <div className="h-4 bg-gray-200 rounded animate-pulse" />
    </div>
  );
}
