import React from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { getAudit, putAuditPath, postAuditProgress, postAdvanceStep, postAdvanceToStep, postRecalcPercent, listPathTemplates } from '../services/api.ts';
import { Button } from '../ui/button.tsx';
import { Menu, MenuTrigger, MenuContent, MenuItem } from '../ui/popover.tsx';
import Dialog from '../ui/dialog.tsx';
import { toast } from '../lib/toast.ts';
import { formatRelativeTime, formatUtc } from '../utils/date.ts';
import { MoreHorizontal } from 'lucide-react';

const STATE_COLORS: Record<string,string> = {
  discovery: 'bg-blue-600',
  analysis: 'bg-amber-500',
  playback: 'bg-purple-600',
  roadmap: 'bg-emerald-600',
  closed: 'bg-gray-500',
};

const GATE_COLORS: Record<string,string> = {
  discovery: 'text-blue-300 bg-blue-500/10',
  analysis: 'text-amber-300 bg-amber-500/10',
  playback: 'text-purple-300 bg-purple-500/10',
  roadmap: 'text-emerald-300 bg-emerald-500/10',
};

function StatusIcon({ status, forceInProgress }: { status?: string; forceInProgress?: boolean }) {
  if (forceInProgress) return <span className="text-yellow-400">◐</span>;
  if (!status || status === 'not_started') return <span className="text-[var(--text-2)]">◻︎</span>;
  if (status === 'in_progress') return <span className="text-yellow-400">◐</span>;
  return <span className="text-green-400">✓</span>;
}

function StateBadge({ state }: { state?: string }){
  const s = (state || '').toLowerCase();
  const cls = STATE_COLORS[s] ?? 'bg-gray-600';
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${cls} text-white`}>{state || '-'}</span>;
}

export default function AuditDetail() {
  const { auditId } = useParams();
  const id = Number(auditId);
  const [audit, setAudit] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedStepId, setSelectedStepId] = React.useState<number | null>(null);
  const [notesDraft, setNotesDraft] = React.useState<string>('');
  const [pathPickerOpen, setPathPickerOpen] = React.useState(false);
  const [templates, setTemplates] = React.useState<any[]>([]);
  const [busy, setBusy] = React.useState<{ advance?: boolean; recalc?: boolean; setPath?: boolean; save?: boolean }>({});
  const liveRef = React.useRef<HTMLDivElement | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const rowRefs = React.useRef<Record<number, HTMLLIElement | null>>({});

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAudit(id);
      const data = (res && (res.data ?? res)) || res;
      let finalData = data;
      setAudit(data);
      // If audit has a path but no steps (backend didn't seed), self-heal by seeding now
      if (data?.path_id && Array.isArray(data?.steps) && data.steps.length === 0) {
        try {
          await putAuditPath(id, { path_id: Number(data.path_id) });
          const again = await getAudit(id);
          const seeded = (again && (again.data ?? again)) || again;
          setAudit(seeded);
          finalData = seeded;
        } catch {}
      }
      // auto-select current step using final data
      const steps = (finalData?.steps || []) as any[];
      const current = steps.find((s:any)=> s.is_current || s.status === 'in_progress');
      // prefer stepId from URL if present and valid
      const fromUrl = Number(searchParams.get('stepId'));
      const validFromUrl = Number.isFinite(fromUrl) && steps.some((s:any)=> s.step_id === fromUrl);
      setSelectedStepId(validFromUrl ? fromUrl : (current?.step_id ?? (steps?.[0]?.step_id ?? null)));
    } catch (e:any) { setAudit(null); }
    finally { setLoading(false); }
  }, [id, searchParams]);

  React.useEffect(()=>{ if (!Number.isFinite(id)) return; load(); }, [id, load]);

  // keep notesDraft in sync when selected step changes
  React.useEffect(()=>{
    const step = ((audit?.steps||[]) as any[]).find((s:any)=> s.step_id === selectedStepId) || null;
    setNotesDraft(step?.notes || '');
    // persist selection in URL for deep-linking (nice-to-have)
    if (selectedStepId) {
      const next = new URLSearchParams(searchParams);
      next.set('stepId', String(selectedStepId));
      setSearchParams(next, { replace: true });
    }
  }, [selectedStepId, audit]);

  // Auto-scroll currently selected (or current) step into view
  React.useEffect(()=>{
    if (!selectedStepId) return;
    const el = rowRefs.current[selectedStepId];
    if (el && typeof el.scrollIntoView === 'function') {
      try { el.scrollIntoView({ block: 'nearest' }); } catch { /* noop */ }
    }
  }, [selectedStepId]);

  const openPathPicker = async () => {
    try {
      const res = await listPathTemplates(1,200);
      const list = (res && (res.data ?? res)) || [];
      setTemplates(list);
      setPathPickerOpen(true);
    } catch (e:any) { toast.error('Failed to load templates'); }
  };

  const setPath = async (pathId:number) => {
    try {
      setBusy(b=>({ ...b, setPath: true }));
      await putAuditPath(id, { path_id: pathId });
      toast.success('Path set');
      setPathPickerOpen(false);
      await load();
    } catch (e:any) { /* error shown by withErrors */ }
    finally { setBusy(b=>({ ...b, setPath: false })); }
  };

  const recalc = async () => {
    try {
      setBusy(b=>({ ...b, recalc: true }));
      await postRecalcPercent(id);
      toast.success('Recalculated');
      await load();
    } catch (e:any) {}
    finally { setBusy(b=>({ ...b, recalc: false })); }
  };

  const advance = async () => {
    try {
      setBusy(b=>({ ...b, advance: true }));
      const stepId = selectedStepId ?? undefined;
      await postAdvanceStep(id, { step_id: stepId, advance: true });
      await load();
      // Announce new current step after reload
      const steps = ((audit?.steps)||[]) as any[];
      const nextCurrent = steps.find((s:any)=> s.is_current || s.status === 'in_progress');
      const msg = nextCurrent ? `Advanced to Step ${nextCurrent.seq}: ${nextCurrent.title}` : 'Advanced to next step';
      toast.success(msg);
      if (liveRef.current) liveRef.current.textContent = msg;
    } catch (e:any) {}
    finally { setBusy(b=>({ ...b, advance: false })); }
  };

  const handleAdvanceTo = async (stepId:number) => {
    try {
      await postAdvanceToStep(id, { step_id: stepId });
      // refetch and announce
      await load();
      const s = (audit?.steps || []).find((x:any)=> x.step_id === stepId) || null;
      toast.success(`Advanced to Step ${s?.seq ?? stepId}: ${s?.title ?? ''}`);
      if (liveRef.current) liveRef.current.textContent = `Advanced to Step ${s?.seq ?? stepId}: ${s?.title ?? ''}`;
    } catch (e:any) { }
  };

  const handleMarkDoneAdvance = async (stepId:number) => {
    try {
      await postAdvanceStep(id, { step_id: stepId, advance: true });
      await load();
  const s = (audit?.steps || []).find((x:any)=> x.step_id === stepId) || null;
  const msg = `Advanced to Step ${(s?.seq ?? stepId) + 1}`;
  toast.success(msg);
  if (liveRef.current) liveRef.current.textContent = msg;
    } catch (e:any) { }
  };

  const handleRecalc = async () => {
    try {
      setBusy(b=>({ ...b, recalc: true }));
      await postRecalcPercent(id);
      await load();
      toast.success('Percent recalculated');
      if (liveRef.current) liveRef.current.textContent = 'Percent recalculated';
    } catch (e:any) {}
    finally { setBusy(b=>({ ...b, recalc: false })); }
  };

  const saveProgress = async (stepId:number, status:string, notes?:string, output_json?:any) => {
    try {
      setBusy(b=>({ ...b, save: true }));
      await postAuditProgress(id, { step_id: stepId, status, notes, output_json });
      toast.success('Progress saved');
      await load();
    } catch (e:any) {}
    finally { setBusy(b=>({ ...b, save: false })); }
  };

  const advanceTo = async (stepId:number) => {
    if (!window.confirm('Advance to this step? This will move current progress.')) return;
    try {
      await postAdvanceToStep(id, { step_id: stepId });
      toast.success('Advanced');
      await load();
  if (liveRef.current) liveRef.current.textContent = `Advanced to step ${stepId}`;
    } catch (e:any) {}
  };

  if (!Number.isFinite(id)) return <div className="p-6 text-red-500">Missing auditId</div>;

  if (loading) return <div className="p-6">Loading…</div>;
  if (!audit) return <div className="p-6 text-red-500">Audit not found</div>;

  // Header
  const percent = audit.percent_complete ?? 0;
  const stepsList = (audit.steps||[]) as any[];
  // Prefer header.current_step_id; fallback to first in_progress; else null
  const currentIdFromHeader = Number(audit?.header?.current_step_id ?? audit?.current_step_id ?? NaN);
  const currentId = Number.isFinite(currentIdFromHeader)
    ? currentIdFromHeader
    : (stepsList.find((s:any)=> String(s.status).toLowerCase()==='in_progress')?.step_id ?? null);
  const serverCurrentStep = stepsList.find((s:any)=> s.step_id === currentId) || null;
  const currentStep = stepsList.find((s:any)=> s.step_id === selectedStepId) || null;

  return (
    <main className="p-6 space-y-4">
      <div aria-live="polite" className="sr-only" ref={liveRef} />
      <header className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-sm text-[var(--text-2)] mb-2">{audit.client_id ? (<><Link to={`/clients/${audit.client_id}`}>Client #{audit.client_id}</Link> &rsaquo; </>) : null} {audit.engagement_id ? (<><Link to={`/clients/engagements/${audit.engagement_id}`}>Engagement #{audit.engagement_id}</Link> &rsaquo; </>) : null} Audit</div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{audit.title || `Audit #${id}`}</h1>
            {audit.domain && <span className="px-2 py-0.5 rounded-full text-xs bg-white/10">{audit.domain}</span>}
            {audit.audit_type && <span className="px-2 py-0.5 rounded-full text-xs bg-white/10">{audit.audit_type}</span>}
            <div><StateBadge state={audit.state} /></div>
            {audit.owner_contact_name && <span className="px-2 py-0.5 rounded-full text-xs bg-white/10">{audit.owner_contact_name}</span>}
          </div>

          <div className="mt-3 w-full max-w-4xl">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="h-2 bg-white/5 rounded overflow-hidden">
                  <div style={{ width: `${percent}%`, background: 'var(--accent-active)' }} className="h-full" />
                </div>
              </div>
              <div className="text-sm font-medium">{Math.round(percent)}%</div>
            </div>
            {serverCurrentStep && <div className="text-xs text-[var(--text-2)] mt-1">Current: Step {serverCurrentStep.seq} — {serverCurrentStep.title}</div>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!audit.path_id && <Button variant="primary" onClick={openPathPicker} disabled={!!busy.setPath}>Set Path</Button>}
          <Button variant="ghost" onClick={recalc} disabled={!!busy.recalc}>Recalc %</Button>
          <div className="relative">
            <Button variant="primary" onClick={advance} disabled={!currentStep || !!busy.advance}>Mark done & advance</Button>
          </div>
          <div><button className="icon-btn" title="More" disabled><MoreHorizontal size={16} /></button></div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <aside className="md:col-span-1">
          {!audit.path_id ? (
            <div className="card p-6 text-center">
              <h3 className="text-lg font-semibold">Choose a path to start</h3>
              <p className="text-sm text-[var(--text-2)] mt-2">Pick a published template. We’ll set Step 1 in motion.</p>
              <div className="mt-4"><Button variant="primary" onClick={openPathPicker}>Select path</Button></div>
            </div>
          ) : (
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs uppercase tracking-wide text-[var(--text-2)]">STEPS</div>
                <div className="text-xs text-[var(--text-2)]">{(audit.steps||[]).filter((s:any)=> s.status==='done').length}/{(audit.steps||[]).length} done</div>
              </div>
              {audit.path_id && (audit.steps||[]).length === 0 && (
                <div className="mb-3 p-2 rounded bg-amber-500/10 text-amber-300 text-xs">This path has no steps yet.</div>
              )}
                <div className="overflow-y-auto max-h-[60vh]" tabIndex={0} onKeyDown={(e)=>{
                  // ignore shortcut keys when typing into inputs
                  const target = e.target as HTMLElement | null;
                  const tag = target?.tagName?.toLowerCase();
                  if (tag === 'input' || tag === 'textarea' || target?.getAttribute('contenteditable') === 'true') return;

                  const steps = (audit.steps || []) as any[];
                  if (!steps.length) return;
                  const idx = steps.findIndex((x:any)=> x.step_id === selectedStepId);
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const next = steps[Math.min(steps.length-1, Math.max(0, idx+1))];
                    if (next) setSelectedStepId(next.step_id);
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prev = steps[Math.max(0, (idx === -1 ? 0 : idx-1))];
                    if (prev) setSelectedStepId(prev.step_id);
                  } else if (e.key === 'Enter') {
                    // Enter opens/keeps selection; no mutation
                    e.preventDefault();
                  } else if (e.key.toLowerCase() === 'a') {
                    e.preventDefault();
                    (async ()=>{ if (!selectedStepId) return; try { await handleAdvanceTo(selectedStepId); } catch (err){} })();
                  } else if (e.key.toLowerCase() === 'd') {
                    e.preventDefault();
                    (async ()=>{ if (!selectedStepId) return; try { await handleMarkDoneAdvance(selectedStepId); } catch (err){} })();
                  } else if (e.key.toLowerCase() === 'r') {
                    e.preventDefault();
                    (async ()=>{ try { await handleRecalc(); } catch (err){} })();
                  }
                }} aria-label="Steps list">
                  <ol className="space-y-2" role="listbox" aria-label="Steps">
                    {((audit.steps||[]) as any[]).map((s:any, idx:number)=> (
                      <li
                        key={s.step_id}
                        role="option"
                        aria-selected={s.step_id===selectedStepId}
                        ref={(el)=>{ rowRefs.current[s.step_id] = el; }}
                        className={`p-2 rounded cursor-pointer flex items-center gap-2 border-l-2 ${s.step_id===currentId ? 'border-[var(--accent-active)]' : 'border-transparent'} ${s.step_id===selectedStepId? 'bg-white/5 ring-1 ring-white/20':''}`}
                        onClick={()=>setSelectedStepId(s.step_id)}
                        tabIndex={0}
                        onKeyDown={(ev)=>{ if (ev.key==='Enter' || ev.key===' ') { ev.preventDefault(); setSelectedStepId(s.step_id); } }}
                      >
                        <div className="w-6 text-center">{s.seq ?? (idx+1)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className={`truncate max-w-[20rem] ${s.step_id===currentId ? 'font-semibold' : ''} ${String(s.status).toLowerCase()==='done' ? 'text-[var(--text-2)]' : ''}`} title={s.title}>{s.title}</div>
                            {s.state_gate && (
                              <span className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded ${GATE_COLORS[String(s.state_gate).toLowerCase()] ?? 'text-[var(--text-2)] bg-white/5'}`}>{s.state_gate}</span>
                            )}
                          </div>
                          <div className="text-xs text-[var(--text-2)]">{s.definition_short || ''}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 text-center"><StatusIcon status={s.status} forceInProgress={s.step_id===currentId} /></div>
                          <div>
                            <Menu>
                              <MenuTrigger asChild>
                                <button className="icon-btn" onClick={(e)=>e.stopPropagation()} title="Actions">⋮</button>
                              </MenuTrigger>
                              <MenuContent>
                                <MenuItem onSelect={async ()=>{ await handleAdvanceTo(s.step_id); }} disabled={s.step_id===currentId}>Advance to this step</MenuItem>
                                <MenuItem onSelect={async ()=>{ await handleMarkDoneAdvance(s.step_id); }} disabled={s.status === 'done'}>Mark done & advance</MenuItem>
                                <MenuItem onSelect={async ()=>{ await handleRecalc(); }}>Recalc %</MenuItem>
                              </MenuContent>
                            </Menu>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
            </div>
          )}
        </aside>

        <section className="md:col-span-3">
          {currentStep ? (
            <div className="card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Step {currentStep.seq}: {currentStep.title}</h3>
                  <div className="text-xs text-[var(--text-2)]">Gate: {currentStep.state_gate || '—'} {currentStep.required && <span className="badge badge-amber ml-2">Required</span>}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm">Status: <strong>{currentStep.status}</strong></div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={()=>advanceTo(currentStep.step_id)} disabled={!!busy.advance || currentStep.step_id===currentId}>Advance to this step</Button>
                    <Menu>
                      <MenuTrigger asChild>
                        <button className="icon-btn" title="Actions">⋮</button>
                      </MenuTrigger>
                      <MenuContent>
                        <MenuItem onSelect={async ()=>{ await handleAdvanceTo(currentStep.step_id); }} disabled={currentStep.step_id===currentId}>Advance to this step</MenuItem>
                        <MenuItem onSelect={async ()=>{ await handleMarkDoneAdvance(currentStep.step_id); }} disabled={currentStep.status === 'done'}>Mark done & advance</MenuItem>
                        <MenuItem onSelect={async ()=>{ await handleRecalc(); }}>Recalc %</MenuItem>
                      </MenuContent>
                    </Menu>
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-[var(--text-2)] mb-2">Definition of Done</div>
                  {currentStep.definition && currentStep.definition.length > 0 ? (
                    <ul className="list-disc pl-4 text-sm">
                      {((currentStep.definition || []) as any[]).map((d:any, i:number)=> <li key={i}>{d}</li>)}
                    </ul>
                  ) : (
                    <div className="text-sm text-[var(--text-2)]">No DoD defined yet</div>
                  )}
                  <div className="mt-4 text-xs text-[var(--text-2)]">Inputs / Attachments</div>
                  <div className="p-3 bg-black/10 rounded mt-2 text-sm text-[var(--text-2)]">(No inputs yet)</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--text-2)] mb-1">Output</div>
                  <pre className="bg-black/20 p-3 rounded max-h-48 overflow-auto">{currentStep.output_json ? JSON.stringify(currentStep.output_json, null, 2) : '—'}</pre>
                  <div className="mt-3">
                    <div className="text-xs">Notes</div>
                    <textarea className="input w-full mt-1" rows={6} value={notesDraft} onChange={(e)=>{
                      const v = e.target.value; setNotesDraft(v);
                      if (currentStep && currentStep.status !== 'in_progress' && currentStep.status !== 'done') {
                        setAudit((a:any)=>{
                          if (!a) return a; const steps = (a.steps||[]).map((s:any)=> s.step_id===currentStep.step_id ? { ...s, status: 'in_progress' } : s); return { ...a, steps };
                        });
                      }
                    }} />
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <Button variant="ghost" onClick={async ()=>{ await saveProgress(currentStep.step_id, currentStep.status || 'in_progress', notesDraft); }} disabled={!!busy.save}>Save progress</Button>
                      <Button variant="primary" onClick={async ()=>{ setBusy(b=>({ ...b, advance: true })); await postAdvanceStep(id, { step_id: currentStep.step_id, advance: true }); const refreshed = await getAudit(id); const data = (refreshed && (refreshed.data ?? refreshed)) || refreshed; setAudit(data); const newCurrentId = Number(data?.header?.current_step_id ?? data?.current_step_id ?? NaN); const newCurrent = (data?.steps||[]).find((s:any)=> s.step_id === newCurrentId) || null; toast.success(newCurrent ? `Marked done & moved to Step ${newCurrent.seq}` : 'Marked done & advanced'); await load(); setBusy(b=>({ ...b, advance: false })); }} disabled={(String(currentStep.status).toLowerCase()==='done') || !currentId || !!busy.advance}>Mark done & advance</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-6">Select a step to view details</div>
          )}
        </section>
      </div>

      {pathPickerOpen && (
        <Dialog open onOpenChange={(o:any)=>{ if(!o) setPathPickerOpen(false); }}>
          <div className="p-4">
            <h3 className="text-lg font-semibold">Choose Path</h3>
            <div className="mt-3 space-y-2 max-h-80 overflow-auto">
              {(templates as any[]).map((t:any)=> (
                <div key={t.path_id} className="p-3 rounded hover:bg-white/5 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-xs text-[var(--text-2)]">{t.description}</div>
                  </div>
                  <div>
                    <Button variant="primary" onClick={()=>setPath(t.path_id)} disabled={!!busy.setPath}>Select</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Dialog>
      )}
    </main>
  );
}
