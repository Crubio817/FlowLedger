import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { updatePathTemplate } from '../../services/api.ts';
import { toast } from '../../lib/toast.ts';
import { Button } from '../../ui/button.tsx';

export default function MetaTab() {
  const { pathId } = useParams();
  const [meta, setMeta] = useState<any>({ name: '', description: '', domain_tags: [], notes: '' });
  const [loading, setLoading] = useState(false);

  useEffect(()=>{ let mounted = true; (async ()=>{
    setLoading(true);
    try {
      // Load via path templates list for now
      const res = await (await import('../../services/api.ts')).listPathTemplates(1,200);
      const list = (res && (res.data ?? res)) || [];
      const found = Array.isArray(list) ? list.find((x:any)=> Number(x.path_id) === Number(pathId)) : null;
      if (!mounted) return;
  if (found) setMeta({ name: found.name || '', description: (found as any).description || '', domain_tags: (found as any).domain_tags || [], notes: (found as any).notes || '' });
    } catch (e:any) { toast.error('Failed to load template meta'); }
    finally { setLoading(false); }
  })(); return ()=>{ mounted = false; } }, [pathId]);

  const save = async () => {
    try {
      await updatePathTemplate(Number(pathId), meta);
      toast.success('Saved');
    } catch (e:any) { toast.error(e?.message || 'Save failed'); }
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs text-[var(--text-2)] mb-1">Name</div>
        <input className="input w-full" value={meta.name} onChange={e=>setMeta({...meta, name: e.target.value})} />
      </div>
      <div>
        <div className="text-xs text-[var(--text-2)] mb-1">Description</div>
        <textarea className="input w-full" rows={4} value={meta.description} onChange={e=>setMeta({...meta, description: e.target.value})} />
      </div>
      <div>
        <div className="text-xs text-[var(--text-2)] mb-1">Notes (internal)</div>
        <textarea className="input w-full" rows={3} value={meta.notes} onChange={e=>setMeta({...meta, notes: e.target.value})} />
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost">Cancel</Button>
        <Button variant="primary" onClick={save}>Save</Button>
      </div>
    </div>
  );
}
