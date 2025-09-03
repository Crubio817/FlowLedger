import React from 'react';
import { getPathTemplateUsage } from '../../services/api.ts';
import { toast } from '../../lib/toast.ts';

export default function UsageTab() {
  const [usage, setUsage] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(()=>{ let mounted = true; (async ()=>{
    setLoading(true);
    try {
      const parts = window.location.pathname.split('/');
      const pid = Number(parts[2]);
      const res = await getPathTemplateUsage(pid);
      if (!mounted) return;
      setUsage(res || null);
    } catch (e:any) { toast.error('Failed to load usage'); }
    finally { setLoading(false); }
  })(); return ()=>{ mounted = false; } }, []);

  if (!usage) return <div className="text-sm text-[var(--text-2)]">No usage data</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Usage</h3>
        <div className="text-sm text-[var(--text-2)]">Audits: {usage.audit_count ?? 0}</div>
      </div>

      <table className="table-modern w-full text-sm">
        <thead>
          <tr><th>Title</th><th>State</th><th>%</th><th>Created</th><th>Updated</th></tr>
        </thead>
        <tbody>
          {(usage.audits||[]).map((a:any)=> (
            <tr key={a.audit_id}>
              <td><a href={`/audits/${a.audit_id}`}>{a.title}</a></td>
              <td>{a.state}</td>
              <td>{a.percent_complete ?? '-'}</td>
              <td>{a.created_utc ? new Date(a.created_utc).toLocaleString() : '-'}</td>
              <td>{a.updated_utc ? new Date(a.updated_utc).toLocaleString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
