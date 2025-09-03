import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button.tsx';
import { Upload, ArrowLeft, Download, Trash2 } from 'lucide-react';
import { listAudits, listProcessMaps, requestUploadUrl, createProcessMap, deleteProcessMap } from '../services/api.ts';
import { toast } from '../lib/toast.ts';

export default function ClientDocumentsRoute() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [audits, setAudits] = React.useState<any[]>([]);
  const [maps, setMaps] = React.useState<any[]>([]);
  const [selected, setSelected] = React.useState<Record<number, boolean>>({});
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [selectedAudit, setSelectedAudit] = React.useState<number | ''>('');
  const fileRef = React.useRef<HTMLInputElement | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true); setErr(null);
    try {
      const aus = await listAudits(1, 200);
      const list = (aus && (aus.data ?? aus)) || [];
      const myAudits = Array.isArray(list) ? list.filter((a:any) => Number(a.client_id) === Number(clientId)) : [];
      setAudits(myAudits);
      // fetch all process maps (server may support audit_id filter; attempt and fallback)
      const mapsRes = await listProcessMaps(1, 200, undefined);
      const allMaps = (mapsRes && (mapsRes.data ?? mapsRes)) || [];
      const auditIds = new Set(myAudits.map((a:any)=>Number(a.audit_id)));
      setMaps(Array.isArray(allMaps) ? allMaps.filter((m:any)=> auditIds.has(Number(m.audit_id))) : []);
    } catch (e:any) { setErr(e?.message || 'Failed to load'); }
    finally { setLoading(false); }
  }, [clientId]);

  React.useEffect(()=>{ load(); }, [load]);

  const onUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) { toast.error('Choose a file'); return; }
    if (!selectedAudit) { toast.error('Select an audit'); return; }
    try {
      const up = await requestUploadUrl(Number(selectedAudit), file.name, file.type || 'application/octet-stream');
      const putRes = await fetch((up as any).uploadUrl || (up as any).upload_url || (up as any).url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      });
      if (!putRes.ok) throw new Error(`Upload failed (${putRes.status})`);
      try {
        await createProcessMap({ audit_id: Number(selectedAudit), blob_path: (up as any).blob_path || (up as any).path, title: file.name, file_type: file.type });
      } catch {}
      toast.success('Uploaded');
      await load();
      if (fileRef.current) fileRef.current.value = '';
    } catch (e:any) {
      toast.error(e?.message || 'Upload failed');
    }
  };

  const onDelete = async (id:number) => {
    if (!window.confirm('Delete this document?')) return;
    try { await deleteProcessMap(Number(id)); await load(); } catch (e:any) { toast.error(e?.message || 'Delete failed'); }
  };

  const deleteSelected = async () => {
    const ids = Object.keys(selected).filter(k => selected[Number(k)]).map(k => Number(k));
    if (ids.length === 0) return;
    if (!window.confirm(`Delete ${ids.length} selected?`)) return;
    for (const id of ids) { try { await deleteProcessMap(id); } catch {} }
    await load();
    setSelected({});
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = async (e) => {
    e.preventDefault();
    if (!selectedAudit) { toast.error('Select an audit first'); return; }
    const files = Array.from(e.dataTransfer.files || []);
    for (const f of files) {
      try {
        const up = await requestUploadUrl(Number(selectedAudit), f.name, f.type || 'application/octet-stream');
        const putRes = await fetch((up as any).uploadUrl || (up as any).upload_url || (up as any).url, {
          method: 'PUT', headers: { 'Content-Type': f.type || 'application/octet-stream' }, body: f,
        });
        if (!putRes.ok) throw new Error(`Upload failed (${putRes.status})`);
        try { await createProcessMap({ audit_id: Number(selectedAudit), blob_path: (up as any).blob_path || (up as any).path, title: f.name, file_type: f.type }); } catch {}
      } catch (e:any) { toast.error(e?.message || 'Upload failed'); }
    }
    toast.success('Uploaded');
    await load();
  };

  const FileType = ({ name, type }:{ name?: string; type?: string }) => {
    const ext = String(name || '').split('.').pop()?.toLowerCase();
    const t = String(type || '').toLowerCase();
    if (t.includes('pdf') || ext === 'pdf') return <span className="badge">PDF</span>;
    if (t.includes('image') || ['png','jpg','jpeg','gif','bmp','webp'].includes(ext||'')) return <span className="badge">IMG</span>;
    if (['doc','docx'].includes(ext||'')) return <span className="badge">DOC</span>;
    if (['xls','xlsx','csv'].includes(ext||'')) return <span className="badge">XLS</span>;
    return <span className="badge badge-soft">FILE</span>;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="minimal" onClick={()=>navigate(`/clients/${clientId}`)} title="Back to Profile"><ArrowLeft size={16} /></Button>
          <div>
            <h1 className="text-xl font-semibold">Client Documents</h1>
            <p className="text-sm text-[var(--text-2)]">Upload and manage documents for this client.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select className="select" value={selectedAudit} onChange={e=>setSelectedAudit(e.target.value ? Number(e.target.value) : '')}>
            <option value="">Select audit…</option>
            {audits.map(a => (<option key={a.audit_id} value={Number(a.audit_id)}>{a.title || `Audit ${a.audit_id}`}</option>))}
          </select>
          <input ref={fileRef} type="file" className="hidden" id="doc-file" />
          <label htmlFor="doc-file" className="btn-pill btn-outline cursor-pointer">Choose file</label>
          <Button variant="primary" onClick={onUpload}><Upload size={16} className="mr-2" /> Upload</Button>
        </div>
      </div>

      <div className="card p-6" style={{ background: '#181818' }}>
        <div className="mb-3 flex items-center justify-between">
          <div onDragOver={(e)=>{ e.preventDefault(); }} onDrop={onDrop} className="rounded-xl border border-dashed border-white/15 p-3 text-xs text-[var(--text-2)]">
            Drag & drop files here to upload to the selected audit.
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={deleteSelected} disabled={Object.values(selected).filter(Boolean).length===0}>Delete Selected</Button>
          </div>
        </div>
        {loading && <div className="text-sm text-[var(--text-2)]">Loading…</div>}
        {!loading && err && <div className="text-sm text-red-500">{err}</div>}
        {!loading && !err && (
          <div className="mt-2 grid gap-2">
            {maps.length === 0 && <div className="rounded-xl border border-white/10 p-4 text-sm text-[var(--text-2)]">No documents yet.</div>}
            {maps.map((m:any)=> (
              <div key={m.process_map_id} className="rounded-xl border border-white/10 p-3 text-sm flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={!!selected[m.process_map_id]} onChange={e=>setSelected(s=>({ ...s, [m.process_map_id]: e.target.checked }))} />
                  <div>
                    <div className="font-medium flex items-center gap-2">{m.title || m.blob_path} <FileType name={m.title || m.blob_path} type={m.file_type} /></div>
                    <div className="text-xs opacity-70">Audit {m.audit_id} • {m.file_type || 'file'}</div>
                  </div>
                </label>
                <div className="flex items-center gap-2">
                  {m.blob_path && <a className="icon-btn-sm" href={m.blob_path} target="_blank" rel="noreferrer" title="Download"><Download size={16} /></a>}
                  <button className="icon-btn-sm" onClick={()=>onDelete(m.process_map_id)} title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
