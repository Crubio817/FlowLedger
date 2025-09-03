import React from 'react';
import Dialog, { DialogContent, DialogHeader, DialogBody, DialogFooter } from '../../ui/dialog.tsx';
import { useParams, Link, Outlet, NavLink } from 'react-router-dom';
import { Button } from '../../ui/button.tsx';
import { listPathTemplates, publishPathTemplate, clonePathTemplate, getPathTemplateUsage } from '../../services/api.ts';
import { toast } from '../../lib/toast.ts';

export default function TemplateDetail() {
  const { pathId } = useParams();
  const id = Number(pathId);
  const [tpl, setTpl] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [publishTarget, setPublishTarget] = React.useState<number|null>(null);
  const [publishVersion, setPublishVersion] = React.useState('');
  const doPublish = async () => {
    if (!publishTarget || !publishVersion) return;
    try {
      await publishPathTemplate(publishTarget, publishVersion);
      toast.success('Published');
  setTpl((t:any)=> ({...(t as any), published: true}));
    } catch (e:any) { toast.error(e?.message || 'Publish failed'); }
    setPublishTarget(null); setPublishVersion('');
  };

  React.useEffect(()=>{ let mounted = true; (async ()=>{
    setLoading(true);
    try {
      const res = await listPathTemplates(1,200);
      const list = (res && (res.data ?? res)) || [];
      const found = Array.isArray(list) ? list.find((x:any)=> Number(x.path_id) === id) : null;
      if (!mounted) return;
      setTpl(found);
    } catch (e:any) { toast.error('Failed to load template'); }
    finally { setLoading(false); }
  })(); return ()=>{ mounted = false; } }, [id]);

  if (!tpl) return <div className="text-sm text-[var(--text-2)]">Template not found</div>;

  return (
    <>
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">{tpl.name} <span className="ml-2 text-xs badge">{tpl.version || 'draft'}</span></h2>
          <div className="text-sm text-[var(--text-2)]">Status: {tpl.published ? 'Published' : 'Draft'}</div>
        </div>
        <div className="flex items-center gap-2">
          {!tpl.published && <Button variant="subtle" onClick={async ()=>{ setPublishTarget(id); }}>Publish</Button>}
          <Button variant="ghost" onClick={async ()=>{ try { const created: any = await clonePathTemplate(id); const tpl2 = (created && (created.data ?? created)) || created; if (tpl2 && tpl2.path_id) { toast.success('Cloned'); window.location.href = `/templates/${tpl2.path_id}`; } } catch(e:any){ toast.error(e?.message||'Clone failed'); } }}>Clone</Button>
        </div>
      </div>

      <div className="tabs">
        <NavLink to="steps" className={({isActive})=> isActive? 'tab tab-active':'tab'}>Steps</NavLink>
        <NavLink to="usage" className={({isActive})=> isActive? 'tab tab-active':'tab'}>Usage</NavLink>
      </div>

      <div className="card p-4">
        <Outlet />
      </div>
    </div>
    {publishTarget && (
      <Dialog open onOpenChange={(o)=>{ if(!o) setPublishTarget(null); }}>
        <DialogContent>
          <DialogHeader title="Publish template" />
          <DialogBody>
            <div className="space-y-3">
              <div className="text-sm">Enter new version (e.g. v1.0)</div>
              <input className="input w-full" value={publishVersion} onChange={e=>setPublishVersion(e.target.value)} />
            </div>
          </DialogBody>
          <DialogFooter>
            <div className="flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={()=>setPublishTarget(null)}>Cancel</Button>
              <Button variant="primary" onClick={doPublish} disabled={!publishVersion}>Publish</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )}
    </>
  );
}
