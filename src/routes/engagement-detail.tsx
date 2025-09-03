import React from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { Button } from '../ui/button.tsx';
import { Input } from '../ui/input.tsx';
import { Badge } from '../ui/badge.tsx';
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter } from '../ui/dialog.tsx';
import { getClientEngagement, updateClientEngagement, listClientTags, listClientTagMap, createClientTagMap, deleteClientTagMap, listAudits, getAudit } from '../services/api.ts';
import { listPathTemplates, listClientContacts, createAudit, putAuditPath, deleteAudit } from '../services/api.ts';
import { ArrowLeft, Tag, Edit, MoreHorizontal } from 'lucide-react';
import { Menu, MenuTrigger, MenuContent, MenuItem } from '../ui/popover.tsx';
import { formatUtc } from '../utils/date.ts';
import { toast } from '../lib/toast.ts';

export default function EngagementDetailRoute() {
  const { engagementId } = useParams();
  const id = Number(engagementId);
  const navigate = useNavigate();
  const [eng, setEng] = React.useState<any>(null);
  const [tags, setTags] = React.useState<{ tag_id: number; tag_name: string }[]>([]);
  const [map, setMap] = React.useState<{ engagement_id: number; tag_id: number }[]>([]);
  const [audits, setAudits] = React.useState<any[]>([]);
  const [allAuditsRaw, setAllAuditsRaw] = React.useState<any[]>([]);
  const [showAuditsDebug, setShowAuditsDebug] = React.useState(false);
  const [startAuditOpen, setStartAuditOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [start, setStart] = React.useState('');
  const [end, setEnd] = React.useState('');
  const [addingTag, setAddingTag] = React.useState<number | ''>('');
  const [confirmDelete, setConfirmDelete] = React.useState<{ id: number; title?: string } | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true); setErr(null);
  try {
  const [e, t, m, a] = await Promise.all([
        getClientEngagement(id),
        listClientTags(1, 200),
        listClientTagMap(1, 500, id),
  listAudits(1, 200),
      ]);
      const engagement: any = (e as any)?.data ?? (e as any);
      setEng(engagement);
      const allTags = (t && (t.data ?? t)) || [];
      setTags(Array.isArray(allTags) ? allTags : []);
      const mappings = (m && (m.data ?? m)) || [];
      setMap(Array.isArray(mappings) ? mappings.filter((x:any)=> Number(x.engagement_id) === id) : []);
  const allAudits = (a && (a.data ?? a)) || [];
  setAllAuditsRaw(Array.isArray(allAudits) ? allAudits : []);
  // Show only audits that are explicitly linked to this engagement.
  // Backends differ in naming (engagement_id, engagementId, client_engagement_id, nested objects),
  // so accept several variants and compare numerically. Also fall back to the route param `id`.
  const engId = Number(engagement?.engagement_id ?? engagement?.engagementId ?? engagement?.id ?? id);
  setAudits(Array.isArray(allAudits)
    ? allAudits.filter((au:any) => {
        const aVals = [au?.engagement_id, au?.engagementId, au?.client_engagement_id, au?.engagement?.engagement_id, au?.engagement?.id, au?.engagement?.engagementId];
        for (const v of aVals) {
          if (v == null) continue;
          if (Number(v) === engId) return true;
        }
        return false;
      })
    : []);
      setTitle(engagement.title || engagement.name || '');
      setStatus(engagement.status || 'Planned');
  // support both _date and _utc column naming from backend
  const sVal = engagement.start_date ?? engagement.start_utc ?? engagement.startDate ?? null;
  const eVal = engagement.end_date ?? engagement.end_utc ?? engagement.endDate ?? null;
  setStart(sVal ? String(sVal).slice(0,10) : '');
  setEnd(eVal ? String(eVal).slice(0,10) : '');
    } catch (e:any) { setErr(e?.message || 'Failed to load'); }
    finally { setLoading(false); }
  }, [id]);

  React.useEffect(()=>{ load(); }, [load]);

  const save = async () => {
    try {
      // Send the canonical names the backend expects; include both variants if uncertain
      const payload: any = { title, status };
      if (start) payload.start_date = start; else payload.start_date = undefined;
      if (end) payload.end_date = end; else payload.end_date = undefined;
      await updateClientEngagement(id, payload as any);
      toast.success('Saved');
      setEditOpen(false);
      await load();
    } catch (e:any) { toast.error(e?.message || 'Save failed'); }
  };

  const addTag = async () => {
    if (!addingTag) return;
    try {
      await createClientTagMap(Number(eng.client_id), Number(addingTag));
      toast.success('Tag added');
      setAddingTag('');
      await load();
    } catch (e:any) { toast.error(e?.message || 'Add failed'); }
  };

  const removeTag = async (tagId: number) => {
    try {
      await deleteClientTagMap(Number(eng.client_id), Number(tagId));
      await load();
    } catch (e:any) { toast.error(e?.message || 'Remove failed'); }
  };

  const statusCls = String(eng?.status || 'Planned').toLowerCase().includes('active') ? 'badge-emerald' : 'badge-soft';

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="minimal" onClick={()=>history.back()} title="Back"><ArrowLeft size={16} /></Button>
          <div>
            <h1 className="text-xl font-semibold">{eng?.title || eng?.name || 'Engagement'}</h1>
            <p className="text-sm text-[var(--text-2)]">Client <NavLink className="underline" to={`/clients/${eng?.client_id}`}>#{eng?.client_id}</NavLink></p>
          </div>
          <span className={`badge ${statusCls}`}>{eng?.status || 'Planned'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="minimal" onClick={()=>setEditOpen(true)}><Edit size={16} className="mr-2" /> Edit</Button>
        </div>
      </div>

      {loading && <div className="text-sm text-[var(--text-2)]">Loading…</div>}
      {!loading && err && <div className="text-sm text-red-500">{err}</div>}

      {!loading && !err && eng && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-4" style={{ background: '#181818' }}>
              <div className="text-xs uppercase tracking-wide text-[var(--text-2)] mb-2">Overview</div>
              <div className="space-y-2 text-sm">
                <div><span className="opacity-70 mr-2">Start:</span>{start || '-'}</div>
                <div><span className="opacity-70 mr-2">End:</span>{end || '-'}</div>
                <div><span className="opacity-70 mr-2">Updated:</span>{eng.updated_utc ? formatUtc(eng.updated_utc) : '-'}</div>
              </div>
            </div>

            <div className="card p-4" style={{ background: '#181818' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs uppercase tracking-wide text-[var(--text-2)]">Tags</div>
                <div className="flex items-center gap-2">
                  <select className="select" value={addingTag} onChange={e=>setAddingTag(e.target.value ? Number(e.target.value) : '')}>
                    <option value="">Add tag…</option>
                    {tags.map(t => <option key={t.tag_id} value={t.tag_id}>{t.tag_name}</option>)}
                  </select>
                  <Button variant="subtle" onClick={addTag} disabled={!addingTag}>Add</Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {map.length === 0 && <span className="text-sm text-[var(--text-2)]">No tags</span>}
                {map.map(m => {
                  const t = tags.find(x => x.tag_id === m.tag_id);
                  return (
                    <span key={m.tag_id} className="badge badge-soft inline-flex items-center gap-2">
                      <Tag size={12} /> {t?.tag_name || m.tag_id}
                      <button className="icon-btn-sm" onClick={()=>removeTag(m.tag_id)} title="Remove">×</button>
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="card p-4" style={{ background: '#181818' }}>
              <div className="text-xs uppercase tracking-wide text-[var(--text-2)] mb-2">Progress</div>
              <div className="text-sm text-[var(--text-2)]">Progress tracking TBD (depends on tasks/audits). Status: {eng.status || 'Planned'}</div>
            </div>
          </div>

          <div className="card p-4" style={{ background: '#181818' }}>
            <div className="text-xs uppercase tracking-wide text-[var(--text-2)] mb-2">Related Audits</div>
            <div className="flex items-center justify-end mb-2">
              <Button variant="primary" onClick={()=>setStartAuditOpen(true)}>+ Start Audit</Button>
            </div>
            <div className="text-xs text-[var(--text-2)] mb-2 flex items-center gap-2">
              <label className="flex items-center gap-2"><input type="checkbox" checked={showAuditsDebug} onChange={e=>setShowAuditsDebug(e.target.checked)} /> <span>Show audits debug</span></label>
            </div>
            <table className="table-modern text-sm rounded-xl overflow-hidden">
              <thead className="text-left border-b border-[var(--border-subtle)]">
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Updated</th>
                  <th className="text-right"></th>
                </tr>
              </thead>
              <tbody>
                {audits.length === 0 && (
                  <tr><td colSpan={5} className="p-3 text-[var(--text-2)]">No audits for this client</td></tr>
                )}
                {audits.map((a:any) => {
                  const auditId = a.audit_id ?? a.id ?? a.AuditId;
                  const canOpen = Number.isFinite(Number(auditId));
                  const to = canOpen ? `/audits/${auditId}` : undefined;
          return (
                    <tr
            key={String(auditId ?? a.audit_id ?? a.id ?? a.title ?? Math.random())}
                      className={`last:border-0 hover:bg-[rgba(255,255,255,0.02)] ${canOpen ? 'cursor-pointer' : ''}`}
                      onClick={() => { if (canOpen) navigate(to!); }}
                      onKeyDown={(e) => { if (canOpen && e.key === 'Enter') navigate(to!); }}
                      tabIndex={canOpen ? 0 : -1}
                    >
                      <td>
                        {canOpen ? (
                          <NavLink to={to!} onClick={(e)=> e.stopPropagation()} className="hover:underline">{a.title || `Audit #${auditId}`}</NavLink>
                        ) : (
                          a.title || '-'
                        )}
                      </td>
                      <td>{a.status || '-'}</td>
                      <td>{a.created_utc ? formatUtc(a.created_utc) : '-'}</td>
                      <td>{a.updated_utc ? formatUtc(a.updated_utc) : '-'}</td>
                      <td className="text-right" onClick={(e)=> e.stopPropagation()}>
                        <Menu>
                          <MenuTrigger asChild>
                            <button className="icon-btn" title="Actions"><MoreHorizontal size={16} /></button>
                          </MenuTrigger>
                          <MenuContent>
                            {canOpen && <MenuItem onSelect={() => navigate(to!)}>Open</MenuItem>}
                            <MenuItem className="text-red-300" onSelect={() => setConfirmDelete({ id: Number(auditId), title: a.title })}>Delete…</MenuItem>
                          </MenuContent>
                        </Menu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {confirmDelete && (
              <Dialog open onOpenChange={(o)=>{ if(!o && !deleting) setConfirmDelete(null); }}>
                <DialogContent>
                  <DialogHeader title="Delete Audit" />
                  <DialogBody>
                    <div className="text-sm">Are you sure you want to delete {confirmDelete.title ? `"${confirmDelete.title}"` : `Audit #${confirmDelete.id}`}? This cannot be undone.</div>
                  </DialogBody>
                  <DialogFooter>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" onClick={()=> setConfirmDelete(null)} disabled={deleting}>Cancel</Button>
                      <Button variant="outline" className="border-red-500/40 text-red-300 hover:bg-red-500/10" onClick={async ()=>{ if (!confirmDelete) return; try { setDeleting(true); await deleteAudit(confirmDelete.id); toast.success('Audit deleted'); setConfirmDelete(null); await load(); } catch(e:any){ toast.error(e?.message || 'Delete failed'); } finally { setDeleting(false); } }} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete'}</Button>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            {showAuditsDebug && (
              <div className="mt-3 text-xs">
                <div className="text-[var(--text-2)] mb-1">Computed engagement id: <strong>{String(eng?.engagement_id ?? eng?.engagementId ?? eng?.id ?? id)}</strong></div>
                <div className="text-[var(--text-2)] mb-1">Fetched audits (raw):</div>
                <pre className="bg-black/30 p-2 rounded max-h-56 overflow-auto">{JSON.stringify(allAuditsRaw, null, 2)}</pre>
                <div className="text-[var(--text-2)] mt-2">Filtered audits (what is displayed):</div>
                <pre className="bg-black/30 p-2 rounded max-h-56 overflow-auto">{JSON.stringify(audits, null, 2)}</pre>
              </div>
            )}
          </div>
        </>
      )}

      {startAuditOpen && (
        <Dialog open onOpenChange={(o)=>{ if(!o) setStartAuditOpen(false); }}>
              <DialogContent>
                <DialogHeader title="New Audit" />
                <DialogBody>
                  <StartAuditForm engagement={eng} onCreated={async (created?: any) => {
                    setStartAuditOpen(false);
                    // reload from server
                    await load();
                    // If server list doesn't include the created audit but creation returned it,
                    // optimistically prepend it so the user sees it in the related list.
                    if (created && created.audit_id) {
                      setAudits(prev => {
                        const exists = prev.some(p => String(p.audit_id) === String(created.audit_id));
                        if (exists) return prev;
                        return [created, ...prev];
                      });
                    }
                  }} onCancel={()=>setStartAuditOpen(false)} />
                </DialogBody>
              </DialogContent>
        </Dialog>
      )}

      {editOpen && (
        <Dialog open onOpenChange={(o)=>{ if(!o) setEditOpen(false); }}>
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
                <Button variant="ghost" onClick={()=>setEditOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={save} disabled={!title.trim()}>Save</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}

// StartAuditForm: embedded form for creating an audit linked to this engagement
function StartAuditForm({ engagement, onCreated, onCancel }: { engagement: any; onCreated: (created?: any) => void | Promise<void>; onCancel: () => void }) {
  const [templates, setTemplates] = React.useState<any[]>([]);
  const [owners, setOwners] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [domain, setDomain] = React.useState('AP');
  const [pathId, setPathId] = React.useState<number | null>(null);
  const [ownerId, setOwnerId] = React.useState<number | ''>('');
  const [startUtc, setStartUtc] = React.useState<string | ''>(new Date().toISOString().slice(0,10));
  const [notes, setNotes] = React.useState('');
  const [err, setErr] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string,string>>({});
  const [rawServerError, setRawServerError] = React.useState<any>(null);
  const [openAfterCreate, setOpenAfterCreate] = React.useState(false);
  const navigate = useNavigate();

  // Refs to fields so we can focus the first invalid one
  const titleRef = React.useRef<HTMLInputElement | null>(null);
  const domainRef = React.useRef<HTMLSelectElement | null>(null);
  const pathRef = React.useRef<HTMLSelectElement | null>(null);
  const ownerRef = React.useRef<HTMLSelectElement | null>(null);
  const startRef = React.useRef<HTMLInputElement | null>(null);
  const notesRef = React.useRef<HTMLTextAreaElement | null>(null);

  React.useEffect(()=>{
    let mounted = true;
    (async ()=>{
      try {
        const [pt, ct] = await Promise.all([
          listPathTemplates(1,200),
          listClientContacts(1,200, Number(engagement.client_id)),
        ]);
        if (!mounted) return;
        const tpl = (pt && (pt.data ?? pt)) || [];
        setTemplates(Array.isArray(tpl) ? tpl : []);
        const cs = (ct && (ct.data ?? ct)) || [];
        setOwners(Array.isArray(cs) ? cs : []);
        if (tpl.length > 0) setPathId(tpl[0].path_id);
        // seed title
        setTitle(`${domain} Audit`);
      } catch (e:any) {
        setErr(e?.message || 'Failed to load templates/contacts');
      }
    })();
    return ()=>{ mounted = false; };
  }, [engagement.client_id]);

  React.useEffect(()=>{ if (!title) setTitle(`${domain} Audit`); }, [domain]);

  const submit = async () => {
    setErr(null);
    if (!title || title.trim().length < 3) { setErr('Title is required (3-200 chars)'); return; }
    if (!pathId) { setErr('Select an audit type/path'); return; }
    setLoading(true);
      try {
      const payload: any = {
        engagement_id: Number(engagement.engagement_id),
        title: title.trim(),
        domain: domain ? String(domain).trim().slice(0,50) : null,
        audit_type: templates.find(t=>t.path_id===Number(pathId))?.name || null,
        owner_contact_id: ownerId ? Number(ownerId) : null,
        path_id: Number(pathId),
        start_utc: startUtc ? new Date(startUtc).toISOString() : null,
        notes: notes || null,
      };
      const created = await createAudit(payload);
      toast.success('Audit created');
        // extract created audit id from envelope or direct response
        let createdData = (created && (created.data ?? created)) || created;
        const auditId = createdData?.audit_id ?? createdData?.data?.audit_id ?? createdData?.id ?? null;
        // If we have an id, fetch the authoritative single-audit record which will include all expected fields
        if (auditId) {
          try {
            const single = await getAudit(Number(auditId));
            createdData = (single && (single.data ?? single)) || single || createdData;
            // Fallback seed: if created with a path but steps array is empty, call PUT /path to initialize
            const pid = Number(createdData?.path_id ?? payload?.path_id ?? 0);
            const stepsArr = Array.isArray(createdData?.steps) ? createdData.steps : [];
            if (pid && stepsArr.length === 0) {
              await putAuditPath(Number(auditId), { path_id: pid });
              const refreshed = await getAudit(Number(auditId));
              createdData = (refreshed && (refreshed.data ?? refreshed)) || refreshed || createdData;
            }
          } catch (_gerr) {
            // fallback to created response if single-get fails
          }
        }
        await onCreated(createdData);
        if (openAfterCreate && auditId) {
          // navigate to the newly created audit workspace
          navigate(`/audits/${auditId}`);
        }
  } catch (e:any) {
        // attempt to parse structured field errors
        setFieldErrors({});
    let parsed: any = null;
        try {
          if (e?.response?.data) parsed = e.response.data;
          else if (e?.data) parsed = e.data;
          else if (e && typeof e.message === 'string') parsed = JSON.parse(e.message);
        } catch (_parse) { parsed = null; }

    // Capture raw server response for debugging
    setRawServerError(parsed ?? e?.response?.data ?? e?.data ?? e?.message ?? e);

    const fieldMap: Record<string,string> = {};
        if (parsed) {
          // common shapes: { errors: { field: ['msg'] } } or { fieldErrors: { field: 'msg' } } or { error: { fields: { ... } } }
          const errs = parsed.errors ?? parsed.fieldErrors ?? parsed.error?.fields ?? parsed.error?.errors ?? null;
          if (errs && typeof errs === 'object') {
            for (const k of Object.keys(errs)) {
              const v = errs[k];
              fieldMap[k] = Array.isArray(v) ? String(v[0]) : String(v || 'Invalid');
            }
          }

          // Handle envelope where server returns a short message like: { error: { code: "BadRequest", message: "Required; Required" } }
          // Many backends return a generic "Required; Required" without field keys. Heuristic: split parts and map to likely required fields.
          if (Object.keys(fieldMap).length === 0) {
            const rawErrMsg = parsed.error?.message ?? parsed.message ?? null;
            if (typeof rawErrMsg === 'string' && /required/i.test(rawErrMsg)) {
              const parts = rawErrMsg.split(';').map((s: string) => s.trim()).filter(Boolean);
              const likely = ['title', 'path_id', 'owner_contact_id', 'domain'];
              for (let i = 0; i < parts.length; i++) {
                const fld = likely[i] ?? `field_${i}`;
                fieldMap[fld] = parts[i] || 'Required';
              }
            }
          }
        }

        if (Object.keys(fieldMap).length > 0) {
          setFieldErrors(fieldMap);
          setErr('Please fix the highlighted fields.');

          // Auto-focus the first invalid field (map common names to refs)
          const order = ['title', 'path_id', 'owner_contact_id', 'domain', 'start_utc', 'notes', 'field_0', 'field_1'];
          const firstKey = Object.keys(fieldMap).sort((a,b)=> {
            const ia = order.indexOf(a) === -1 ? order.length : order.indexOf(a);
            const ib = order.indexOf(b) === -1 ? order.length : order.indexOf(b);
            return ia - ib;
          })[0];

          // small timeout to ensure DOM updated
          setTimeout(()=>{
            if (!firstKey) return;
            if (firstKey === 'title' || firstKey === 'field_0') titleRef.current?.focus();
            else if (firstKey === 'path_id' || firstKey === 'field_1') pathRef.current?.focus();
            else if (firstKey === 'owner_contact_id') ownerRef.current?.focus();
            else if (firstKey === 'domain') domainRef.current?.focus();
            else if (firstKey === 'start_utc') startRef.current?.focus();
            else notesRef.current?.focus();
          }, 50);

        } else {
          setErr(e?.message || 'Create failed');
        }
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      {err && <div className="text-sm text-red-500">{String(err)}</div>}
  <div>
    <div className="text-xs text-[var(--text-2)] mb-1">Title</div>
    <Input ref={titleRef} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Audit title" />
    {fieldErrors['title'] && <div className="text-xs text-red-500 mt-1">{fieldErrors['title']}</div>}
  </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-[var(--text-2)] mb-1">Domain</div>
          <select ref={domainRef} className="select w-full" value={domain} onChange={e=>setDomain(e.target.value)}>
            <option>AP</option>
            <option>HR</option>
            <option>IT</option>
            <option>Safety</option>
            <option>Other</option>
          </select>
            {fieldErrors['domain'] && <div className="text-xs text-red-500 mt-1">{fieldErrors['domain']}</div>}
        </div>
        <div>
          <div className="text-xs text-[var(--text-2)] mb-1">Audit Type</div>
          <select ref={pathRef} className="select w-full" value={pathId ?? ''} onChange={e=>setPathId(e.target.value ? Number(e.target.value) : null)}>
            <option value="">Select…</option>
            {templates.map((t:any) => <option key={t.path_id} value={t.path_id}>{t.name}{t.version ? ` v${t.version}` : ''}</option>)}
          </select>
            {fieldErrors['path_id'] && <div className="text-xs text-red-500 mt-1">{fieldErrors['path_id']}</div>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-[var(--text-2)] mb-1">Owner</div>
          <select ref={ownerRef} className="select w-full" value={ownerId} onChange={e=>setOwnerId(e.target.value ? Number(e.target.value) : '')}>
            <option value="">(none)</option>
            {owners.map((c:any) => <option key={c.contact_id} value={c.contact_id}>{c.first_name} {c.last_name} {c.email ? `(${c.email})` : ''}</option>)}
          </select>
            {fieldErrors['owner_contact_id'] && <div className="text-xs text-red-500 mt-1">{fieldErrors['owner_contact_id']}</div>}
        </div>
        <div>
          <div className="text-xs text-[var(--text-2)] mb-1">Start date</div>
          <input ref={startRef} type="date" className="input w-full" value={startUtc ? String(startUtc).slice(0,10) : ''} onChange={e=>setStartUtc(e.target.value)} />
        </div>
      </div>
      <div>
        <div className="text-xs text-[var(--text-2)] mb-1">Notes</div>
  <textarea ref={notesRef} className="input w-full" rows={4} value={notes} onChange={e=>setNotes(e.target.value)} />
  {fieldErrors['notes'] && <div className="text-xs text-red-500 mt-1">{fieldErrors['notes']}</div>}
      </div>
      <div className="flex items-center gap-3">
        <input id="open-after" type="checkbox" checked={openAfterCreate} onChange={e=>setOpenAfterCreate(e.target.checked)} />
        <label htmlFor="open-after" className="text-sm">Open audit after create</label>
      </div>
      {rawServerError && (
        <pre className="text-xs bg-black/40 p-2 rounded mt-2 overflow-auto max-h-36">
          {JSON.stringify(rawServerError, null, 2)}
        </pre>
      )}
      <div className="flex items-center justify-end gap-3">
        <Button variant="ghost" onClick={()=>onCancel()} disabled={loading}>Cancel</Button>
        <Button variant="primary" onClick={submit} disabled={loading || !title.trim() || !pathId}>{loading ? 'Creating…' : 'Create Audit'}</Button>
      </div>
    </div>
  );
}
