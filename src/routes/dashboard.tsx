import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader.tsx';
import { Tile } from '../components/Tile.tsx';
import { Rocket, FileText, Users, Map, ListChecks } from 'lucide-react';
import { getDashboardStats, getAuditRecentTouch } from '@services/api.ts';
import type { DashboardStats, RecentAudit } from '@store/types.ts';

const DashboardRoute: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<RecentAudit[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [errStats, setErrStats] = useState<string | null>(null);
  const [errRecent, setErrRecent] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [sPromise, rPromise] = [getDashboardStats(), getAuditRecentTouch(1, 7)];
        const [s, r] = await Promise.allSettled([sPromise, rPromise]);
        if (cancelled) return;

        if (s.status === 'fulfilled') setStats(s.value);
        else setErrStats(s.reason?.message || 'Failed to load stats');

        if (r.status === 'fulfilled') setRecent(r.value);
        else setErrRecent(r.reason?.message || 'Failed to load recent activity');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const last = recent?.[0];

  return (
    <div>
      <PageHeader title="Audit Operations Dashboard" subtitle="Overview of your current audit engagement and progress across discovery assets." actions={<button className="px-4 py-2 bg-brand-mint text-brand-blue-900 rounded-full text-sm font-medium">Start New Audit</button>} />

      {/* Stat cards */}
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Active Clients" value={stats?.active_clients} loading={loading} error={!!errStats} />
        <StatCard label="Audits In Progress" value={stats?.audits_in_progress} loading={loading} error={!!errStats} />
        <StatCard label="SIPOCs Completed" value={stats?.sipocs_completed} loading={loading} error={!!errStats} />
        <StatCard label="Pending Interviews" value={stats?.pending_interviews} loading={loading} error={!!errStats} />
      </section>

      {/* Work at a Glance */}
      <section className="mt-10">
        <h2 className="text-sm font-medium uppercase tracking-wide text-slate-400 mb-3">Work at a Glance</h2>
        <div className="grid gap-4 md:grid-cols-5">
          <Tile title="Resume Last Audit" description="Jump back into the most recent audit context." icon={<Rocket size={16} className="text-brand-mint"/>} />
          <Tile title="SIPOC Builder" description="Structure suppliers, inputs, process, outputs, and customers." icon={<FileText size={16} className="text-brand-mint"/>} />
          <Tile title="Interview Manager" description="Schedule, conduct, and capture stakeholder interviews." icon={<Users size={16} className="text-brand-mint"/>} />
          <Tile title="Process Map" description="Upload or draw process flows and BPMN diagrams." icon={<Map size={16} className="text-brand-mint"/>} />
          <Tile title="Findings & Recs" description="Curate pain points and actionable recommendations." icon={<ListChecks size={16} className="text-brand-mint"/>} />
        </div>
      </section>

      {/* Resume last audit */}
      <section className="mt-10 rounded-2xl border border-brand-blue-700/50 p-4 bg-brand-blue-900/30">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Resume Last Audit</h2>
          {errRecent && <span className="text-xs text-red-400">Couldn’t load recent audits</span>}
        </div>
        {loading && !recent && <SkeletonLine />}
        {!loading && !last && !errRecent && (
          <div className="text-sm opacity-70">No recent audits yet.</div>
        )}
        {last && (
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <div className="font-medium">{last.title} · {last.status}</div>
              <div className="opacity-70">{formatLocal(last.last_touched_utc)}</div>
            </div>
            <a className="text-sm underline" href={`/audits/${last.audit_id}`}>
              Open
            </a>
          </div>
        )}
      </section>

      {/* Recent activity list */}
      <section className="mt-10 rounded-2xl border border-brand-blue-700/50 p-4 bg-brand-blue-900/30">
        <h2 className="font-semibold mb-3">Recent Activity</h2>
        {loading && !recent && <SkeletonList />}
        {!loading && recent && recent.length === 0 && (
          <div className="text-sm opacity-70">No activity yet.</div>
        )}
        {!loading && recent && recent.length > 0 && (
          <ul className="space-y-2">
            {recent.map((a) => (
              <li key={`${a.audit_id}-${a.last_touched_utc}`} className="text-sm flex justify-between">
                <span>{a.title} · {a.status}</span>
                <span className="opacity-70">{formatLocal(a.last_touched_utc)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
export default DashboardRoute;

function StatCard({ label, value, loading, error }: { label: string; value?: number; loading: boolean; error: boolean }) {
  return (
    <div className="rounded-2xl bg-brand-blue-800 px-5 py-4 text-left shadow-soft animate-slideUp">
      <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-brand-mint h-8 flex items-end">
        {loading ? <div className="w-20 h-6 rounded bg-brand-blue-700 animate-pulse" /> :
         error ? <span className="text-red-400">—</span> :
         (value ?? 0)}
      </div>
    </div>
  );
}

function SkeletonLine() {
  return <div className="w-full h-6 rounded bg-brand-blue-700 animate-pulse" />;
}
function SkeletonList() {
  return (
    <div className="space-y-2">
      <div className="w-full h-4 rounded bg-brand-blue-700 animate-pulse" />
      <div className="w-5/6 h-4 rounded bg-brand-blue-700 animate-pulse" />
      <div className="w-2/3 h-4 rounded bg-brand-blue-700 animate-pulse" />
    </div>
  );
}
function formatLocal(iso: string) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}
