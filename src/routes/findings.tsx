import React, { useEffect, useState } from 'react';
import { getFindings, putFindings } from '@services/api.ts';
import type { Finding as ApiFinding } from '../services/models.ts';
// Extend API Finding with UI-managed collections (backend spec uses different field names)
interface Finding extends ApiFinding {
  findings_json: string[];
  recommendations_json: string[];
  priority_json: Record<string, 'Low'|'Medium'|'High'>;
}
import { toast } from '../lib/toast.ts';
import { useUnsavedGuard } from '../hooks/useUnsavedGuard.ts';
import { PageTitleEditorial } from '../components/PageTitles.tsx';
import { savedToast } from '../lib/saveNotifier.ts';

export default function FindingsRoute() {
  const auditId = Number(new URLSearchParams(location.search).get('auditId') ?? 1);
  const [doc, setDoc] = useState<Finding | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useUnsavedGuard(dirty);

  // initial load
  useEffect(() => {
    (async () => {
      try {
  const d = await getFindings(auditId) as any as Finding; // cast until spec updated
  d.findings_json ||= [];
  d.recommendations_json ||= [];
  d.priority_json ||= {};
  setDoc(d as Finding);
      } catch (e: any) {
        setError(e.message || 'Failed to load findings');
      }
    })();
  }, [auditId]);

  // autosave
  useEffect(() => {
    if (!dirty || !doc) return;
    const t = setTimeout(async () => {
      try {
        setSaving(true);
  const saved = await putFindings(auditId, doc as any as ApiFinding) as any as Finding;
  setDoc(saved as Finding);
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

  const onFindingChange = (i: number, value: string) => {
    setDoc(prev => {
      if (!prev) return prev;
      const arr = [...prev.findings_json];
      const old = arr[i] ?? '';
      arr[i] = value;
      const next: Finding = { ...prev, findings_json: arr };
      // migrate priority key if changed
      if (old && old !== value && prev.priority_json && prev.priority_json[old]) {
        const p = prev.priority_json[old];
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [old]: _omit, ...rest } = prev.priority_json;
  next.priority_json = value.trim() ? { ...rest, [value]: p } : { ...rest };
      }
      return next;
    });
    setDirty(true);
  };

  const onAddFinding = () => {
    setDoc(prev => prev ? ({ ...prev, findings_json: [...prev.findings_json, ''] }) : prev);
    setDirty(true);
  };
  const onRemoveFinding = (i: number) => {
    setDoc(prev => {
      if (!prev) return prev;
      const key = prev.findings_json[i];
      const arr = prev.findings_json.filter((_, idx) => idx !== i);
      const next: Finding = { ...prev, findings_json: arr };
      if (key && next.priority_json && key in next.priority_json) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [key]: _drop, ...rest } = next.priority_json;
        next.priority_json = rest;
      }
      return next;
    });
    setDirty(true);
  };

  const onRecommendationChange = (i: number, value: string) => {
    setDoc(prev => {
      if (!prev) return prev;
      const arr = [...prev.recommendations_json];
      arr[i] = value;
      return { ...prev, recommendations_json: arr };
    });
    setDirty(true);
  };
  const onAddRecommendation = () => {
    setDoc(prev => prev ? ({ ...prev, recommendations_json: [...prev.recommendations_json, ''] }) : prev);
    setDirty(true);
  };
  const onRemoveRecommendation = (i: number) => {
    setDoc(prev => prev ? ({ ...prev, recommendations_json: prev.recommendations_json.filter((_, idx) => idx !== i) }) : prev);
    setDirty(true);
  };

  const setPriority = (findingText: string, level: 'Low'|'Medium'|'High') => {
    if (!findingText.trim()) return;
    setDoc(prev => prev ? ({ ...prev, priority_json: { ...(prev.priority_json||{}), [findingText]: level } }) : prev);
    setDirty(true);
  };

  const exportJson = () => {
    if (!doc) return;
    const file = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url; a.download = `findings_audit_${auditId}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const printPage = () => window.print();

  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <main className="p-6 print:p-0 print:bg-white print:text-black">
      <PageTitleEditorial
        eyebrow="Audit Results"
        title={`Findings & Recommendations — Audit #${auditId}`}
        subtitle="Comprehensive analysis of audit discoveries and recommended remediation actions"
      />
      
      <div className="flex justify-end mb-4 print:mb-2">
        <div className="text-sm opacity-70">
          {saving ? 'Saving…' : dirty ? 'Unsaved changes' : doc?.updated_utc ? `Updated ${new Date(doc.updated_utc).toLocaleString()}` : ''}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 print:hidden">
        <button className="rounded-xl border px-3 py-2" onClick={exportJson}>Export JSON</button>
        <button className="rounded-xl border px-3 py-2" onClick={printPage}>Print</button>
      </div>

      {!doc ? (
        <div className="space-y-4">
          <div className="h-40 rounded-2xl border animate-pulse bg-white/5"/>
          <div className="h-40 rounded-2xl border animate-pulse bg-white/5"/>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="rounded-2xl border p-4 print:shadow-none print:border-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Findings</h3>
              <button className="text-sm underline print:hidden" onClick={onAddFinding}>Add Finding</button>
            </div>
            <ul className="space-y-3">
              {doc.findings_json.map((f, i) => (
                <li key={i} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <select
                      className="border rounded-lg px-2 py-1 text-sm w-[120px]"
                      value={doc.priority_json?.[f] ?? 'Medium'}
                      onChange={e => setPriority(f, e.target.value as 'Low'|'Medium'|'High')}
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                    <button className="text-xs text-red-600 print:hidden" onClick={() => onRemoveFinding(i)}>✕</button>
                  </div>
                  <textarea
                    className="w-full min-h-[72px] border rounded-lg px-2 py-1"
                    value={f}
                    onChange={e => onFindingChange(i, e.target.value)}
                    placeholder="Describe the finding"
                  />
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border p-4 print:shadow-none print:border-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Recommendations</h3>
              <button className="text-sm underline print:hidden" onClick={onAddRecommendation}>Add Recommendation</button>
            </div>
            <ul className="space-y-3">
              {doc.recommendations_json.map((r, i) => (
                <li key={i} className="space-y-2">
                  <div className="flex items-center justify-end">
                    <button className="text-xs text-red-600 print:hidden" onClick={() => onRemoveRecommendation(i)}>✕</button>
                  </div>
                  <textarea
                    className="w-full min-h-[72px] border rounded-lg px-2 py-1"
                    value={r}
                    onChange={e => onRecommendationChange(i, e.target.value)}
                    placeholder="Enter recommendation"
                  />
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </main>
  );
}
