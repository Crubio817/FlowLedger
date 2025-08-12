import { useEffect, useMemo, useRef, useState } from 'react';
import { listInterviewResponses, createInterviewResponse, updateInterviewResponse, updateInterview } from '@services/api.ts';
import type { QAItem, InterviewResponse } from '@store/types.ts';
import { toast } from '../lib/toast.ts';
import { useUnsavedGuard } from '../hooks/useUnsavedGuard.ts';
import { savedToast } from '../lib/saveNotifier.ts';

const DEFAULT_QUESTIONS: QAItem[] = [
  { question_id: 'q01', prompt: 'Walk me through the process step-by-step.' },
  { question_id: 'q02', prompt: 'Where do delays/bottlenecks usually happen?' },
  { question_id: 'q03', prompt: 'What inputs are often missing or incorrect?' },
  { question_id: 'q04', prompt: 'Who approves what, and when?' },
  { question_id: 'q05', prompt: 'What exceptions happen most, and why?' },
  { question_id: 'q06', prompt: 'What systems/tools are involved in each step?' },
  { question_id: 'q07', prompt: 'If you could change one thing tomorrow, what is it?' },
  { question_id: 'q08', prompt: 'What metrics matter most here?' },
  { question_id: 'q09', prompt: 'Where are handoffs unclear or error-prone?' },
  { question_id: 'q10', prompt: 'Anything else we didn’t cover?' },
];

type RespMap = Record<string, InterviewResponse>; // keyed by question_id

export default function InterviewQA() {
  const params = new URLSearchParams(location.search);
  const interviewId = Number(params.get('interviewId') ?? 1);

  const [rows, setRows] = useState<RespMap>({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string|null>(null);
  const [dirty, setDirty] = useState(false);

  useUnsavedGuard(dirty);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await listInterviewResponses(interviewId, 1, 200);
        const map: RespMap = {};
        (data || []).forEach(r => { map[r.question_id] = r; });
        setRows(map);
      } catch (e:any) {
        setErr(e.message || 'Failed to load responses');
      } finally {
        setLoading(false);
      }
    })();
  }, [interviewId]);

  const answeredCount = useMemo(
    () => DEFAULT_QUESTIONS.filter(q => !!rows[q.question_id]?.answer?.trim()).length,
    [rows]
  );
  const progress = Math.round((answeredCount / DEFAULT_QUESTIONS.length) * 100);

  useEffect(() => {
    if (DEFAULT_QUESTIONS.length > 0 && answeredCount === DEFAULT_QUESTIONS.length) {
      updateInterview(interviewId, { status: 'Completed' }).catch(()=>{});
    }
  }, [answeredCount, interviewId]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Interview Q&A — #{interviewId}</h1>
        <div className="text-sm">{progress}% complete</div>
      </header>

      <div className="grid gap-4">
        {DEFAULT_QUESTIONS.map(q => (
          <QAEditor
            key={q.question_id}
            interviewId={interviewId}
            item={q}
            existing={rows[q.question_id]}
    onDirty={() => setDirty(true)}
    onSaved={(resp) => { setRows(prev => ({ ...prev, [q.question_id]: resp })); setDirty(false); savedToast(toast.success); }}
          />
        ))}
      </div>
    </main>
  );
}

function QAEditor({
  interviewId, item, existing, onSaved, onDirty
}:{
  interviewId:number; item:QAItem; existing?:InterviewResponse; onSaved:(r:InterviewResponse)=>void; onDirty:()=>void;
}) {
  const [val, setVal] = useState(existing?.answer ?? '');
  const [tags, setTags] = useState<string>((item.tags || []).join(', '));
  const [truth, setTruth] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);
  const timer = useRef<number|undefined>(undefined);

  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(async () => {
      try {
        setSaving(true);
        const stamped = withClientFlags(val, { tags, truth_gap: truth });
        let saved: InterviewResponse;
        if (existing?.response_id) {
          saved = await updateInterviewResponse(existing.response_id, { answer: stamped });
        } else {
          saved = await createInterviewResponse({ interview_id: interviewId, question_id: item.question_id, answer: stamped });
        }
    onSaved(saved);
      } catch {
    toast.error('Autosave failed');
      } finally {
        setSaving(false);
      }
    }, 1000);
    return () => { if (timer.current) window.clearTimeout(timer.current); };
  }, [val, tags, truth]);

  return (
    <div className="rounded-2xl border p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{item.prompt}</h3>
        <div className="text-xs opacity-70">{saving ? 'Saving…' : existing?.created_utc ? new Date(existing.created_utc).toLocaleString() : ''}</div>
      </div>
      <textarea
        className="w-full border rounded-lg px-3 py-2 min-h-[120px]"
        placeholder="Type the stakeholder’s answer…"
        value={val}
        onChange={(e)=>{ setVal(e.target.value); onDirty(); }}
      />
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          <span className="opacity-70">Tags</span>
     <input className="border rounded px-2 py-1" placeholder="e.g., #bottleneck, #handoff"
       value={tags} onChange={(e)=>{ setTags(e.target.value); onDirty(); }} />
        </label>
        <label className="flex items-center gap-2">
     <input type="checkbox" checked={truth} onChange={e=>{ setTruth(e.target.checked); onDirty(); }} />
          <span className="opacity-70">Truth gap</span>
        </label>
      </div>
    </div>
  );
}

function withClientFlags(answer: string, opts: { tags?: string; truth_gap?: boolean }) {
  const tags = (opts.tags || '').trim();
  const truth = !!opts.truth_gap;
  const meta = [
    tags ? `tags: ${tags}` : '',
    truth ? `truth_gap: true` : ''
  ].filter(Boolean).join(' | ');
  if (!meta) return answer;
  return `[[meta: ${meta}]]\n${answer}`;
}
