import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../../ui/button.tsx';
import { listPathSteps, reorderPathSteps, createPathStep, updatePathStep, deletePathStep } from '../../services/api.ts';
import { toast } from '../../lib/toast.ts';

function StepEditor({ open, onClose, step, pathId, onSaved, onDeleted }: any) {
  const [title, setTitle] = useState(step?.title ?? '');
  const [stateGate, setStateGate] = useState(step?.state_gate ?? 'discovery');
  const [required, setRequired] = useState(!!step?.required);
  const [agentKey, setAgentKey] = useState(step?.agent_key ?? '');
  const [inputContract, setInputContract] = useState(JSON.stringify(step?.input_contract ?? {}, null, 2));
  const [outputContract, setOutputContract] = useState(JSON.stringify(step?.output_contract ?? {}, null, 2));

  const rootRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(()=>{
    if (!open) return;
    const el = rootRef.current;
    if (!el) return;
    const focusable = Array.from(el.querySelectorAll<HTMLElement>('a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'));
    const first = focusable[0];
    const last = focusable[focusable.length-1];
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose && onClose(); }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); save(); }
      if (e.key === 'Tab') {
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    setTimeout(()=>{ const f = el.querySelector<HTMLInputElement>('input,textarea,select'); f?.focus(); }, 0);
    return ()=>{ document.removeEventListener('keydown', onKey); };
  }, [open]);

  if (!open) return null;

  const save = async () => {
    try {
      const payload: any = { title, state_gate: stateGate, required, agent_key: agentKey };
      try { payload.input_contract = JSON.parse(inputContract); } catch { payload.input_contract = null; }
      try { payload.output_contract = JSON.parse(outputContract); } catch { payload.output_contract = null; }
      if (step && step.step_id) {
        await updatePathStep(step.step_id, payload);
        toast.success('Step updated');
      } else {
        await createPathStep(pathId, payload);
        toast.success('Step created');
      }
      onSaved && onSaved();
    } catch (e:any) { toast.error(e?.message || 'Save failed'); }
  };

  const remove = async () => {
    if (!step || !step.step_id) return;
    if (!window.confirm('Delete step?')) return;
    try { await deletePathStep(step.step_id); toast.success('Deleted'); onDeleted && onDeleted(); } catch (e:any) { toast.error(e?.message || 'Delete failed'); }
  };

  return (
    <div className="drawer fixed inset-0 z-60 flex" ref={rootRef}>
      <div className="drawer-backdrop flex-1" onClick={onClose} />
      <div className="drawer-panel w-2/5 bg-[var(--surface-1)] p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{step ? 'Edit step' : 'Add step'}</h3>
          <button className="icon-btn" onClick={onClose}>×</button>
        </div>
        <div className="space-y-3">
          <div>
            <div className="text-xs text-[var(--text-2)] mb-1">Title</div>
            <input className="input w-full" value={title} onChange={e=>setTitle(e.target.value)} />
          </div>
          <div>
            <div className="text-xs text-[var(--text-2)] mb-1">State gate</div>
            <select className="select w-full" value={stateGate} onChange={e=>setStateGate(e.target.value)}>
              <option value="discovery">discovery</option>
              <option value="analysis">analysis</option>
              <option value="playback">playback</option>
              <option value="roadmap">roadmap</option>
              <option value="closed">closed</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" checked={required} onChange={e=>setRequired(e.target.checked)} id="req" />
            <label htmlFor="req">Required</label>
          </div>
          <div>
            <div className="text-xs text-[var(--text-2)] mb-1">Agent key</div>
            <input className="input w-full" value={agentKey} onChange={e=>setAgentKey(e.target.value)} />
          </div>
          <div>
            <div className="text-xs text-[var(--text-2)] mb-1">Input contract (JSON)</div>
            <textarea className="input w-full" rows={6} value={inputContract} onChange={e=>setInputContract(e.target.value)} />
          </div>
          <div>
            <div className="text-xs text-[var(--text-2)] mb-1">Output contract (JSON)</div>
            <textarea className="input w-full" rows={6} value={outputContract} onChange={e=>setOutputContract(e.target.value)} />
          </div>
          <div className="flex items-center justify-end gap-2">
            {step && <Button variant="ghost" onClick={remove}>Delete</Button>}
            <Button variant="primary" onClick={save}>Save</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TemplateSteps() {
  const { pathId } = useParams();
  const [steps, setSteps] = useState<any[]>([]);
  const [dragged, setDragged] = useState<number | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<any | null>(null);

  useEffect(() => {
    listPathSteps(Number(pathId)).then(res => setSteps(res.data ?? res));
  }, [pathId]);

  // Simple drag-drop reorder
  const onDragStart = (idx: number) => setDragged(idx);
  const onDrop = (idx: number) => {
    if (dragged == null || dragged === idx) return;
    const newSteps = [...steps];
    const [moved] = newSteps.splice(dragged, 1);
    newSteps.splice(idx, 0, moved);
    setSteps(newSteps);
    reorderPathSteps(Number(pathId), newSteps.map(s => s.step_id)).then(() => { /* Optionally show toast */ });
    setDragged(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Steps</h2>
        <Button variant="primary" onClick={()=>{ setEditingStep(null); setEditorOpen(true); }}>+ Add step</Button>
      </div>
      <ul className="step-list">
        {steps.map((s, idx) => (
          <li key={s.step_id}
              draggable
              onDragStart={() => onDragStart(idx)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => onDrop(idx)}
              className="step-row flex items-center gap-4 p-2 border rounded mb-2 bg-[#181818]">
            <span className="drag-handle">☰</span>
            <span className="seq">{idx + 1}</span>
            <span className="title font-semibold">{s.title}</span>
            <span className="state-gate badge badge-soft">{s.state_gate}</span>
            {s.required && <span className="badge badge-emerald">Required</span>}
            <span className="agent-key text-xs">{s.agent_key}</span>
            <div className="ml-auto">
              <Button variant="ghost" onClick={()=>{ setEditingStep(s); setEditorOpen(true); }}>Edit</Button>
            </div>
          </li>
        ))}
      </ul>
      <StepEditor
        open={editorOpen}
        onClose={()=>setEditorOpen(false)}
        step={editingStep}
        pathId={Number(pathId)}
        onSaved={async ()=>{
          setEditorOpen(false);
          const res = await listPathSteps(Number(pathId));
          setSteps((res && (res.data ?? res)) || []);
        }}
        onDeleted={async ()=>{
          setEditorOpen(false);
          const res = await listPathSteps(Number(pathId));
          setSteps((res && (res.data ?? res)) || []);
        }}
      />
    </div>
  );
}
