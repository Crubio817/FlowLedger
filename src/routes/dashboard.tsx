import React, { useEffect, useState } from 'react';
import { getClientsOverview } from '../services/api.ts';
import type { ClientsOverviewItem } from '../services/models.ts';
import { formatUtc } from '../utils/date.ts';

const DashboardRoute: React.FC = () => {
  const [rows, setRows] = useState<ClientsOverviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|undefined>();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getClientsOverview(10); // grab first 10
        setRows(res.data || []);
      } catch (e:any) {
        setError(e?.message || 'Failed to load overview');
      } finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="space-y-8" data-testid="dashboard-new">
      <header>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-[var(--text-2)]">Operational snapshot from clients overview.</p>
      </header>
<<<<<<< Updated upstream
      {!loading && !error && rows.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Stat title="Total Clients" value={rows.length} />
          <Stat title="Active %" value={(() => { const active = rows.filter(r=>r.is_active).length; return rows.length? ((active/rows.length*100)|0)+'%':''; })()} />
          <Stat title="Total Engagements" value={rows.reduce((a,r)=>a+(r.engagement_count||0),0)} />
          <Stat title="Pending Tasks" value={rows.reduce((a,r)=>a+(r.pending_onboarding_tasks||0),0)} />
        </div>
      )}
=======
      {/* KPIs moved to Clients page */}
      <div className="card p-6">
        <div className="text-sm opacity-80">KPIs have been moved to the Clients page for context-aware metrics.</div>
      </div>
>>>>>>> Stashed changes
      <section className="card overflow-auto">
        {loading && <div className="p-6 text-sm text-[var(--text-2)]">Loading clients…</div>}
        {!loading && error && <div className="p-6 text-sm text-red-400">{error}</div>}
        {!loading && !error && rows.length === 0 && <div className="p-6 text-sm opacity-70">No client data.</div>}
        {!loading && !error && rows.length>0 && (
          <table className="w-full text-sm">
            <thead className="text-left text-[var(--text-2)] border-b border-[var(--border-subtle)]">
              <tr>
                <th className="py-2 px-3 font-medium">Client</th>
                <th className="py-2 px-3 font-medium">Active</th>
                <th className="py-2 px-3 font-medium">Engagements</th>
                <th className="py-2 px-3 font-medium">Onboarding Tasks</th>
                <th className="py-2 px-3 font-medium">Last Activity</th>
                <th className="py-2 px-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.client_id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--surface-3)] transition-colors">
                  <td className="py-2 px-3 font-medium">{r.client_name}</td>
                  <td className="py-2 px-3">
                    <span className={'inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium ' + (r.is_active ? 'bg-emerald-400/90 text-black' : 'bg-[var(--surface-4)] text-[var(--text-2)]')}>{r.is_active? 'Yes':'No'}</span>
                  </td>
                  <td className="py-2 px-3">{r.engagement_count ?? 0}</td>
                  <td className="py-2 px-3">{r.pending_onboarding_tasks ?? 0}</td>
                  <td className="py-2 px-3">{r.last_activity_utc ? formatUtc(r.last_activity_utc) : '—'}</td>
                  <td className="py-2 px-3">{r.created_utc ? formatUtc(r.created_utc, { year: 'numeric', month: 'short', day: '2-digit' }) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default DashboardRoute;

const Stat: React.FC<{ title: string; value: string | number | undefined }> = ({ title, value }) => (
  <div className="rounded-xl border border-[var(--border-subtle)] p-4 bg-[var(--surface-2)] flex flex-col gap-1">
    <div className="text-[11px] uppercase tracking-wide text-[var(--text-2)]">{title}</div>
    <div className="text-lg font-semibold">{value ?? '—'}</div>
  </div>
);
