import { useEffect, useState } from 'react';
import { listProcessMaps, requestUploadUrl, createProcessMap, deleteProcessMap } from '@services/api.ts';
import type { ProcessMap } from '@store/types.ts';
import { toast } from '../lib/toast.ts';
import { API_BASE_URL } from '../services/client.ts';

export default function ProcessMapsRoute() {
  const params = new URLSearchParams(location.search);
  const auditId = Number(params.get('auditId') ?? 1);

  const [rows, setRows] = useState<ProcessMap[]>([]);
  const page = 1;
  const limit = 20;
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string|null>(null);
  const [preview, setPreview] = useState<ProcessMap|null>(null);
  const [busyId, setBusyId] = useState<number|undefined>();

  async function load() {
    setLoading(true); setErr(null);
    try {
      const { data } = await listProcessMaps(page, limit, auditId);
      setRows(data || []);
    } catch(e:any) {
      setErr(e.message || 'Failed to load process maps');
    } finally { setLoading(false); }
  }
  useEffect(()=>{ load(); }, [auditId]);

  async function onUploadFile(file: File, title?: string) {
    try {
      const { uploadUrl, blob_path } =
        await requestUploadUrl(auditId, file.name, file.type || 'application/octet-stream');

      const putRes = await fetch(uploadUrl, {
        method:'PUT',
        headers: { 'x-ms-blob-type': 'BlockBlob', 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      });
      if (!putRes.ok) throw new Error(`Upload failed: HTTP ${putRes.status}`);

      const fileType = inferFileType(file.name);
      await createProcessMap({ audit_id: auditId, title: title || file.name, blob_path, file_type: fileType });

  toast.success('Uploaded');
      load();
    } catch (e:any) {
  toast.error(e.message || 'Upload failed');
    }
  }

  return (
    <main className="p-6 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Process Maps — Audit #{auditId}</h1>
        <UploadButton onUpload={onUploadFile} />
      </header>

      {loading ? <SkeletonGrid /> :
       err ? <div className="text-red-600">{err}</div> :
       <Grid rows={rows} onPreview={setPreview} onDelete={async (id)=> {
          if (!confirm('Delete this map?')) return;
          setBusyId(id);
          try { await deleteProcessMap(id); toast.success('Deleted'); load(); }
          catch { toast.error('Delete failed'); }
          finally { setBusyId(undefined); }
       }} busyId={busyId} />}

      {preview && <PreviewModal item={preview} onClose={()=>setPreview(null)} />}
    </main>
  );
}

function Grid({ rows, onPreview, onDelete, busyId }:{
  rows: ProcessMap[]; onPreview:(pm:ProcessMap)=>void; onDelete:(id:number)=>void; busyId?:number;
}) {
  if (!rows.length) return <div className="rounded-2xl border p-8 text-sm opacity-70">No process maps yet.</div>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {rows.map(r => (
        <div key={r.process_map_id} className="rounded-2xl border p-4 space-y-2">
          <div className="font-medium">{r.title || r.blob_path.split('/').pop()}</div>
          <div className="text-xs opacity-70">{(r.file_type||'').toString().toUpperCase()} · {r.uploaded_utc ? new Date(r.uploaded_utc).toLocaleString() : ''}</div>
          <div className="flex gap-2">
            <button className="border rounded px-3 py-1 text-sm" onClick={()=>onPreview(r)}>Preview</button>
            <button className="border rounded px-3 py-1 text-sm text-red-600" disabled={busyId===r.process_map_id}
              onClick={()=>onDelete(r.process_map_id)}>{busyId===r.process_map_id ? 'Deleting…' : 'Delete'}</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function UploadButton({ onUpload }:{ onUpload:(f:File, title?:string)=>void }) {
  return (
    <label className="cursor-pointer border rounded-xl px-3 py-2 text-sm">
      Upload Map
      <input type="file" className="hidden" accept=".bpmn,.svg,.png,.jpg,.jpeg,.pdf"
        onChange={e=>{
          const f = e.target.files?.[0];
          if (f) onUpload(f, f.name.replace(/\.[^.]+$/, ''));
        }} />
    </label>
  );
}

function PreviewModal({ item, onClose }:{ item: ProcessMap; onClose:()=>void }) {
  const previewSrc = toPublicUrl(item.blob_path);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-4 w-full max-w-4xl space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{item.title || item.blob_path}</h2>
          <button onClick={onClose}>✕</button>
        </div>
        {renderPreview(item.file_type || '', previewSrc)}
        <div className="text-xs opacity-70 break-all">{item.blob_path}</div>
      </div>
    </div>
  );
}

function renderPreview(fileType: string, src: string) {
  const ft = (fileType || '').toLowerCase();
  if (ft === 'png' || ft === 'jpg' || ft === 'jpeg' || ft === 'svg') {
    return <img src={src} alt="" className="max-h-[70vh] w-auto mx-auto" />;
  }
  if (ft === 'pdf') {
    return <iframe src={src} className="w-full h-[70vh] rounded-lg border" />;
  }
  if (ft === 'bpmn') {
    return <a className="underline text-sm" href={src} target="_blank" rel="noreferrer">Open BPMN file</a>;
  }
  return <div className="text-sm opacity-70">Preview not available for this file type.</div>;
}

function inferFileType(name: string): ProcessMap['file_type'] {
  const ext = (name.split('.').pop() || '').toLowerCase();
  if (['png','jpg','jpeg','svg','pdf','bpmn'].includes(ext)) return ext as any;
  return (ext || 'bin') as any;
}

function toPublicUrl(blobPath: string): string {
  // If API provides a proxy endpoint; adjust if needed to a CDN/Blob SAS
  return `${API_BASE_URL}/files?path=${encodeURIComponent(blobPath)}`;
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(6)].map((_,i)=>(
        <div key={i} className="rounded-2xl border p-4 space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}
