import React, { useEffect, useMemo, useState } from 'react';
import { getSipoc, putSipoc } from '@services/api.ts';
import type { SipocDoc as ApiSipocDoc } from '../services/models.ts';
// Extend to include required audit_id locally (backend schema omits it in spec for now)
interface SipocDoc extends ApiSipocDoc { audit_id?: number }
import { toast } from '../lib/toast.ts';
import { useUnsavedGuard } from '../hooks/useUnsavedGuard.ts';
import { savedToast } from '../lib/saveNotifier.ts';
import { PageTitleEditorial } from '../components/PageTitles.tsx';

function ensureStrings(arr?: unknown[]): string[] {
  if (!Array.isArray(arr)) return [];
  return arr.map(x => (typeof x === 'string' ? x : String(x))).filter(s => s.trim().length > 0);
}

export default function SipocRoute() {
  const qs = new URLSearchParams(location.search);
  const auditIdParam = qs.get('auditId');
  const auditId = auditIdParam ? Number(auditIdParam) : NaN;

  const [doc, setDoc] = useState<SipocDoc | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useUnsavedGuard(dirty);

  useEffect(() => {
    if (!Number.isFinite(auditId)) { setError('Missing auditId'); return; }
    (async () => {
      try {
        const d = await getSipoc(auditId);
        d.suppliers_json = ensureStrings(d.suppliers_json);
        d.inputs_json = ensureStrings(d.inputs_json);
        d.process_json = ensureStrings(d.process_json);
        d.outputs_json = ensureStrings(d.outputs_json);
        d.customers_json = ensureStrings(d.customers_json);
        setDoc(d);
      } catch (e: any) {
        setError(e.message || 'Failed to load SIPOC');
      }
    })();
  }, [auditId]);

  useEffect(() => {
    if (!dirty || !doc) return;
    const t = setTimeout(async () => {
      try {
        setSaving(true);
        const updated = await putSipoc(auditId, doc);
        setDoc(updated);
        setDirty(false);
        savedToast(toast.success);
      } catch (e:any) {
        toast.error(e.message || 'Autosave failed');
      } finally {
        setSaving(false);
      }
    }, 1500);
    return () => clearTimeout(t);
  }, [dirty, doc, auditId]);

  const processHint = useMemo(() => {
    const n = doc?.process_json?.length ?? 0;
    return n < 5 ? `Add ${5-n} more steps for clarity` : n > 7 ? `Consider collapsing to ~5–7 steps` : '';
  }, [doc?.process_json]);

  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!doc) return <div className="p-6">Loading…</div>;

  const onArrayChange = (key: keyof SipocDoc, i: number, value: string) => {
    setDoc(prev => {
      if (!prev) return prev;
      const arr = [...(prev[key] as string[])];
      arr[i] = value;
      return { ...prev, [key]: arr };
    });
    setDirty(true);
  };

  const onAddRow = (key: keyof SipocDoc) => {
    setDoc(prev => prev ? ({ ...prev, [key]: [ ...(prev[key] as string[]), '' ] }) : prev);
    setDirty(true);
  };

  const onDeleteRow = (key: keyof SipocDoc, i: number) => {
    setDoc(prev => {
      if (!prev) return prev;
      const next = [...(prev[key] as string[])];
      next.splice(i,1);
      return { ...prev, [key]: next };
    });
    setDirty(true);
  };

  const exportJson = () => {
    const file = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(file);
    const a = document.createElement('a'); a.href = url; a.download = `sipoc_audit_${auditId}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (file: File) => {
    file.text().then(txt => {
      const incoming = JSON.parse(txt);
      setDoc(d => ({ ...(d as SipocDoc), ...incoming }));
      setDirty(true);
  }).catch(() => toast.error('Invalid JSON file'));
  };

  return (
    <main className="p-6 space-y-6">
      <PageTitleEditorial
        eyebrow="Process Analysis"
        title={`SIPOC — Audit #${auditId}`}
        subtitle="Suppliers, Inputs, Process, Outputs, and Customers analysis framework"
      />
      
      <div className="flex justify-end">
        <div className="text-sm opacity-70">
          {saving ? 'Saving…' : dirty ? 'Unsaved changes' : ''}
        </div>
      </div>

      <Toolbar onExport={exportJson} onImport={importJson} onSave={async () => {
        try {
          setSaving(true);
          const updated = await putSipoc(auditId, doc);
          setDoc(updated);
          setDirty(false);
          toast.success('SIPOC saved');
        } catch (e:any) {
          toast.error(e.message || 'Save failed');
        } finally {
          setSaving(false);
        }
      }}/>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
  <SipocColumn title="Suppliers" items={doc.suppliers_json || []} onChange={(i,v)=>onArrayChange('suppliers_json', i, v)} onAdd={()=>onAddRow('suppliers_json')} onDelete={(i)=>onDeleteRow('suppliers_json', i)} />
  <SipocColumn title="Inputs" items={doc.inputs_json || []} onChange={(i,v)=>onArrayChange('inputs_json', i, v)} onAdd={()=>onAddRow('inputs_json')} onDelete={(i)=>onDeleteRow('inputs_json', i)} />
  <SipocColumn title="Process" items={doc.process_json || []} hint={processHint} onChange={(i,v)=>onArrayChange('process_json', i, v)} onAdd={()=>onAddRow('process_json')} onDelete={(i)=>onDeleteRow('process_json', i)} />
  <SipocColumn title="Outputs" items={doc.outputs_json || []} onChange={(i,v)=>onArrayChange('outputs_json', i, v)} onAdd={()=>onAddRow('outputs_json')} onDelete={(i)=>onDeleteRow('outputs_json', i)} />
  <SipocColumn title="Customers" items={doc.customers_json || []} onChange={(i,v)=>onArrayChange('customers_json', i, v)} onAdd={()=>onAddRow('customers_json')} onDelete={(i)=>onDeleteRow('customers_json', i)} />
      </div>

  <MetricsEditor value={doc.metrics_json as any as Record<string,string|number|boolean> ?? {}} onChange={(m)=>{ setDoc(prev => prev ? ({...prev, metrics_json: m}) : prev); setDirty(true); }} />
    </main>
  );
}

function SipocColumn({ title, items, hint, onChange, onAdd, onDelete }:{
  title:string; items:string[]; hint?:string;
  onChange:(i:number,v:string)=>void; onAdd:()=>void; onDelete:(i:number)=>void;
}) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">{title}</h3>
        <button className="text-sm underline" onClick={onAdd}>Add</button>
      </div>
      {hint && <div className="text-xs opacity-70 mb-2">{hint}</div>}
      <ul className="space-y-2">
        {items?.map((val, i) => (
          <li key={i} className="flex gap-2">
            <input
              className="w-full border rounded-lg px-2 py-1"
              value={val}
              onChange={(e)=>onChange(i, e.target.value)}
              placeholder={`Add ${title.slice(0,-1)}`}
            />
            <button className="text-xs text-red-600" onClick={()=>onDelete(i)}>✕</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Toolbar({ onExport, onImport, onSave }:{ onExport:()=>void; onImport:(f:File)=>void; onSave:()=>void }) {
  return (
    <div className="flex items-center gap-2">
      <button className="rounded-xl border px-3 py-2" onClick={onSave}>Save</button>
      <button className="rounded-xl border px-3 py-2" onClick={onExport}>Export JSON</button>
      <label className="rounded-xl border px-3 py-2 cursor-pointer">
        Import JSON
        <input type="file" accept="application/json" className="hidden" onChange={e=>{ const f=e.target.files?.[0]; if (f) onImport(f); }} />
      </label>
    </div>
  );
}

function MetricsEditor({ value, onChange }:{ value: Record<string, string|number|boolean>, onChange:(v:Record<string, string|number|boolean>)=>void }) {
  const entries = Object.entries(value ?? {});
  const setKV = (k:string, v:string) => {
    const parsed = v === 'true' ? true : v === 'false' ? false : (isFinite(Number(v)) && v.trim() !== '' ? Number(v) : v);
    onChange({ ...(value||{}), [k]: parsed });
  };
  return (
    <div className="rounded-2xl border p-4">
      <h3 className="font-semibold mb-2">Metrics</h3>
      <ul className="space-y-2">
        {entries.map(([k,v]) => (
          <li key={k} className="flex gap-2">
            <input className="w-1/3 border rounded-lg px-2 py-1" value={k} readOnly />
            <input className="w-2/3 border rounded-lg px-2 py-1" defaultValue={String(v)} onChange={(e)=>setKV(k, e.target.value)} />
          </li>
        ))}
      </ul>
      <button
        className="mt-2 text-sm underline"
        onClick={() => onChange({ ...(value||{}), new_metric: 0 })}
      >
        Add metric
      </button>
    </div>
  );
}
