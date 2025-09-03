import React from 'react';
import { listAudits, createAudit, getAudit, listPathTemplates, putAuditPath } from '../../services/api.ts';
import { Link } from 'react-router-dom';
import { Button } from '../../ui/button.tsx';
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter } from '../../ui/dialog.tsx';
import { formatRelativeTime, formatUtc } from '../../utils/date.ts';
import { PlusCircle, Clipboard, MoreHorizontal, Eye } from 'lucide-react';
import { PageTitleEditorial } from '../../components/PageTitles.tsx';

const STATE_COLORS: Record<string,string> = {
  discovery: 'bg-blue-600',
  analysis: 'bg-yellow-500',
  playback: 'bg-purple-600',
  roadmap: 'bg-emerald-600',
  closed: 'bg-gray-500',
};

function StateBadge({ state }: { state?: string }){
  const s = (state || '').toLowerCase();
  const cls = STATE_COLORS[s] ?? 'bg-gray-600';
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${cls} text-white`}>{state || '-'}</span>;
}

function ProgressBar({ value }: { value?: number | null }){
  const v = typeof value === 'number' ? Math.max(0, Math.min(100, Math.round(value))) : 0;
  return (
    <div className="w-28 h-2 bg-black/20 rounded">
      <div className="h-2 rounded" style={{ width: `${v}%`, background: 'var(--accent-active)' }} />
    </div>
  );
}

function EmptyState({ onStart }: { onStart: ()=>void }){
  return (
    <div className="p-8 text-center">
      <div className="mx-auto w-12 h-12 bg-black/20 rounded-full flex items-center justify-center mb-4"><Clipboard size={20} /></div>
      <div className="text-lg font-semibold mb-1">No audits yet for this client</div>
      <div className="text-sm text-[var(--text-2)] mb-4">Start tracking audit work for this client.</div>
      <div><Button variant="primary" onClick={onStart}>Start your first audit</Button></div>
    </div>
  );
}

export default function AuditsList(){
  const [rows, setRows] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [openNew, setOpenNew] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [domainFilter, setDomainFilter] = React.useState('');
  const [stateFilter, setStateFilter] = React.useState('');
  const [compact, setCompact] = React.useState(false);

  const load = async ()=>{
    setLoading(true);
    try{
      const res = await listAudits(1,200);
      const data = (res && (res.data ?? res)) || res;
      setRows(Array.isArray(data) ? data : []);
    }catch(e:any){}
    finally{ setLoading(false); }
  };

  React.useEffect(()=>{ let m=true; (async()=>{ await load(); if(!m) return; })(); return ()=>{ m=false }; }, []);

  const filtered = rows.filter(r=>{
    if (search && !(String(r.title||'').toLowerCase().includes(search.toLowerCase()))) return false;
    if (domainFilter && String(r.domain || '').toLowerCase() !== domainFilter.toLowerCase()) return false;
    if (stateFilter && String(r.state || '').toLowerCase() !== stateFilter.toLowerCase()) return false;
    return true;
  });

  // New audit modal
  async function handleCreate(payload: any){
    try{
      const created = await createAudit(payload);
      let createdData = (created && (created.data ?? created)) || created;
      const auditId = createdData?.audit_id ?? createdData?.id ?? null;
      if (auditId) {
        try {
          const single = await getAudit(Number(auditId));
          createdData = (single && (single.data ?? single)) || single || createdData;
        } catch {}
        try {
          // Fallback: if audit was created with a path but steps weren't seeded by POST /audits,
          // explicitly seed by calling PUT /audits/{id}/path then refetch.
          const pid = Number(createdData?.path_id ?? payload?.path_id ?? 0);
          const stepsArr = Array.isArray(createdData?.steps) ? createdData.steps : [];
          if (pid && stepsArr.length === 0) {
            await putAuditPath(Number(auditId), { path_id: pid });
            const refreshed = await getAudit(Number(auditId));
            createdData = (refreshed && (refreshed.data ?? refreshed)) || refreshed || createdData;
          }
        } catch {}
      }
      // prepend
      setRows(prev => [createdData, ...prev]);
      setOpenNew(false);
    }catch(e:any){ console.error(e); }
  }

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <main className="p-6">
      <PageTitleEditorial
        eyebrow="Audit Management"
        title="Audits"
        subtitle={`Showing ${filtered.length} of ${rows.length} audit engagements across all clients`}
      />
      
      <div className="flex items-center justify-between mb-6 mt-6">
        <div className="flex items-center gap-3">
          <button className="icon-btn-sm" title={compact ? 'Normal view' : 'Compact view'} aria-label="Toggle view" onClick={()=>setCompact(v=>!v)}><Eye size={16} /></button>
          <button className="icon-btn-sm" title="Start Audit" aria-label="Start Audit" onClick={()=>setOpenNew(true)}><PlusCircle size={16} /></button>
        </div>
        <div className="flex items-center gap-3">
          <input className="input" placeholder="Search title…" value={search} onChange={e=>setSearch(e.target.value)} />
          <select className="select" value={domainFilter} onChange={e=>setDomainFilter(e.target.value)}>
            <option value="">All domains</option>
            <option>AP</option>
            <option>HR</option>
            <option>IT</option>
          </select>
          <select className="select" value={stateFilter} onChange={e=>setStateFilter(e.target.value)}>
            <option value="">All states</option>
            <option>Discovery</option>
            <option>Analysis</option>
            <option>Playback</option>
            <option>Roadmap</option>
            <option>Closed</option>
          </select>
        </div>
      </div>

      <div className="card p-4">
        {filtered.length === 0 ? (
          <EmptyState onStart={()=>setOpenNew(true)} />
        ) : (
          <table className={`table-modern w-full ${compact ? 'text-xs' : 'text-sm'}`}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Domain</th>
                <th>State</th>
                <th>%</th>
                <th>Current Step</th>
                <th>Owner</th>
                <th>Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={String(r.audit_id)} className="last:border-0 hover:bg-[rgba(255,255,255,0.02)]">
                  <td><Link to={`/audits/${r.audit_id}`} className="hover:underline">{r.title || `Audit ${r.audit_id}`}</Link></td>
                  <td>{r.domain || '-'}</td>
                  <td><StateBadge state={r.state} /></td>
                  <td><div className="flex items-center gap-2"><ProgressBar value={typeof r.percent_complete === 'number' ? r.percent_complete : null} /><div className="text-xs text-[var(--text-2)]">{typeof r.percent_complete === 'number' ? `${Math.round(r.percent_complete)}%` : '-'}</div></div></td>
                  <td>{r.current_step_title || r.current_step_name || (r.current_step_id ? `Step ${r.current_step_id}` : '-')}</td>
                  <td>{r.owner_contact_name || r.owner_name || '-'}</td>
                  <td title={r.updated_utc ? formatUtc(r.updated_utc) : ''}>{r.updated_utc ? formatRelativeTime(r.updated_utc) : '-'}</td>
                  <td className="text-right"><button className="icon-btn" title="Actions"><MoreHorizontal size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {openNew && (
        <Dialog open onOpenChange={(o)=>{ if(!o) setOpenNew(false); }}>
          <DialogContent>
            <DialogHeader title="New Audit" />
            <DialogBody>
              <NewAuditForm onCancel={()=>setOpenNew(false)} onCreated={handleCreate} templatesPromise={listPathTemplates} />
            </DialogBody>
          </DialogContent>
        </Dialog>
      )}
    </main>
  );
}

function NewAuditForm({ onCancel, onCreated, templatesPromise }: any){
  const [title, setTitle] = React.useState('');
  const [engagementId, setEngagementId] = React.useState<number | ''>('');
  const [pathId, setPathId] = React.useState<number | ''>('');
  const [templates, setTemplates] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(()=>{ let m=true; (async()=>{ try{ const res = await templatesPromise(1,200); const data = (res && (res.data ?? res)) || res; if(!m) return; setTemplates(Array.isArray(data)?data:[]); if(data && data.length>0) setPathId(data[0].path_id); }catch{} })(); return ()=>{ m=false } }, [templatesPromise]);

  const submit = async ()=>{
    if (!title.trim()) return;
    setLoading(true);
    try{
      const payload: any = { title: title.trim(), engagement_id: engagementId ? Number(engagementId) : undefined, path_id: pathId ? Number(pathId) : undefined };
      await onCreated(payload);
    }catch(e:any){}
    finally{ setLoading(false); }
  };

  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs text-[var(--text-2)] mb-1">Title</div>
        <input className="input w-full" value={title} onChange={e=>setTitle(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-[var(--text-2)] mb-1">Engagement ID (optional)</div>
          <input className="input w-full" value={engagementId} onChange={e=>setEngagementId(e.target.value ? Number(e.target.value) : '')} />
        </div>
        <div>
          <div className="text-xs text-[var(--text-2)] mb-1">Audit Type</div>
          <select className="select w-full" value={pathId} onChange={e=>setPathId(e.target.value ? Number(e.target.value) : '')}>
            <option value="">(none)</option>
            {templates.map(t=> <option key={t.path_id} value={t.path_id}>{t.name}</option>)}
          </select>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={submit} disabled={loading || !title.trim()}>{loading ? 'Creating…' : 'Create Audit'}</Button>
      </div>
    </div>
  );
}
