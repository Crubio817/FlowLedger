import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../ui/button.tsx';
import { listPathTemplates, clonePathTemplate, publishPathTemplate } from '../../services/api.ts';
import { toast } from '../../lib/toast.ts';
import Dialog, { DialogContent, DialogHeader, DialogBody, DialogFooter } from '../../ui/dialog.tsx';
import { PlusCircle, Eye } from 'lucide-react';
import { PageTitleEditorial } from '../../components/PageTitles.tsx';

export default function TemplatesList() {
  const [templates, setTemplates] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const [compact, setCompact] = React.useState(false);

  React.useEffect(()=>{ let mounted = true; (async ()=>{
    setLoading(true);
    try {
      const res = await listPathTemplates(1,200);
      const data = (res && (res.data ?? res)) || [];
      if (!mounted) return;
      setTemplates(Array.isArray(data) ? data : []);
    } catch (e:any) {
      toast.error(e?.message || 'Failed to load templates');
    } finally { setLoading(false); }
  })(); return ()=>{ mounted = false; } }, []);

  const onPublish = async (id:number) => {
    // open modal
    setPublishTarget(id);
  };

  const [publishTarget, setPublishTarget] = React.useState<number | null>(null);
  const [publishVersion, setPublishVersion] = React.useState('');

  const doPublish = async () => {
    if (!publishTarget || !publishVersion) return;
    try {
      await publishPathTemplate(publishTarget, publishVersion);
      toast.success('Published');
      const res = await listPathTemplates(1,200);
      setTemplates((res && (res.data ?? res)) || []);
    } catch (e:any) { toast.error(e?.message || 'Publish failed'); }
    setPublishTarget(null); setPublishVersion('');
  };

  const onClone = async (id:number) => {
    try {
  const created: any = await clonePathTemplate(id);
  const tpl = (created && (created.data ?? created)) || created;
      toast.success('Cloned');
      if (tpl && tpl.path_id) navigate(`/templates/${tpl.path_id}`);
    } catch (e:any) { toast.error(e?.message || 'Clone failed'); }
  };

  return (
    <div className="space-y-4">
      <PageTitleEditorial
        eyebrow="Template Management"
        title="Path Templates"
        subtitle="Reusable audit workflows and process templates for consistent engagements"
      />
      
      <div className="flex items-center justify-end gap-2 mt-6">
        <button className="icon-btn-sm" title={compact ? 'Normal view' : 'Compact view'} aria-label="Toggle view" onClick={()=>setCompact(v=>!v)}><Eye size={16} /></button>
        <button className="icon-btn-sm" title="New template" aria-label="New template" onClick={()=>navigate('/templates/new')}><PlusCircle size={16} /></button>
      </div>

      <div className="card p-4">
        <table className={`table-modern w-full ${compact ? 'text-xs' : 'text-sm'}`}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Version</th>
              <th>Status</th>
              <th>Steps</th>
              <th>Last updated</th>
              <th>Audits</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
      {templates.length === 0 && <tr><td colSpan={7} className="p-3 text-[var(--text-2)]">No templates</td></tr>}
            {templates.map((t:any) => (
              <tr key={t.path_id}>
                <td><Link to={`/templates/${t.path_id}`}>{t.name}</Link></td>
                <td>{t.version || '-'}</td>
                <td>{t.status || (t.published ? 'Published' : 'Draft')}</td>
                <td className="text-center">{t.steps_count ?? '-'}</td>
                <td>{t.updated_utc ? new Date(t.updated_utc).toLocaleString() : '-'}</td>
                <td>{t.audit_count ?? '-'}</td>
                <td className="text-right">
                  <Button variant="subtle" onClick={()=>navigate(`/templates/${t.path_id}`)}>Open</Button>
                  {(!t.published && t.status !== 'Published') && (
                    <Button variant="subtle" onClick={()=>onPublish(t.path_id)}>Publish</Button>
                  )}
                  <Button variant="ghost" onClick={()=>onClone(t.path_id)}>Clone</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    </div>
  );
}
