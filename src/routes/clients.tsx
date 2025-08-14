import React, { useEffect, useState } from 'react';
import { getClientsOverview } from '../services/api.ts';
import type { ClientsOverviewItem } from '../services/models.ts';
import { formatUtc } from '../utils/date.ts';
import StatCard from '../components/StatCard.tsx';

const badgeBase = 'inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium';

// Route showing a table of client engagement and onboarding stats
export const ClientsRoute: React.FC = () => {
  const [rows, setRows] = useState<ClientsOverviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getClientsOverview(50);
        if (!cancelled) {
          setRows(res.data || []);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // KPI metrics
  const totalClients = rows.length;
  const activeClients = rows.filter(r => r.is_active).length;
  const onboardingTasks = rows.reduce((sum, r) => sum + (r.pending_onboarding_tasks ?? 0), 0);
  const totalEngagements = rows.reduce((sum, r) => sum + (r.engagement_count ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <div className="flex items-center justify-between mb-0">
          <h1 className="text-xl font-semibold">Clients Overview</h1>
          <button
            className="flex items-center justify-center font-semibold transition border-none"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(180deg, #232323 0%, #181818 100%)',
              color: '#fff',
              boxShadow: '8px 8px 24px #111, -8px -8px 24px #222, inset 2px 2px 8px #333, inset -2px -2px 8px #000',
              fontSize: '1.2rem',
              outline: '2px solid #fff2',
            }}
            onClick={() => alert('Add new client (not yet implemented)')}
            title="Add New Client"
          >
            <span style={{fontWeight:600, fontSize:'1.5rem'}}>+</span>
          </button>
        </div>
        <p className="text-sm text-[var(--text-2)]">Snapshot of client engagement & onboarding signals.</p>
      </div>
      {/* KPI Cards */}
  {!loading && !error && Array.isArray(rows) && rows.length > 0 && (
        <div className="flex gap-6 mb-4 mt-2">
          <StatCard label="Total Clients" value={totalClients} color="#6366f1" />
          <StatCard label="Active Clients" value={activeClients} color="#4ade80" />
          <StatCard label="Onboarding Tasks" value={onboardingTasks} color="#60a5fa" />
          <StatCard label="Engagements" value={totalEngagements} color="#fbbf24" />
        </div>
      )}
      <div className="card overflow-auto" style={{ background: '#181818' }}>
        {loading && <div className="p-6 text-sm text-[var(--text-2)]">Loading…</div>}
        {!loading && error && <div className="p-6 text-sm text-red-400">{error}</div>}
        {!loading && !error && Array.isArray(rows) && rows.length === 0 && <div className="p-6 text-sm text-[var(--text-2)]">No clients found.</div>}
        {!loading && !error && Array.isArray(rows) && rows.length > 0 && (
          <table className="w-full text-sm" style={{ background: '#181818' }}>
            <thead className="text-left text-[var(--text-2)] border-b border-[var(--border-subtle)]">
              <tr>
                <th className="py-2 px-3 font-medium">Client</th>
                <th className="py-2 px-3 font-medium">Active</th>
                <th className="py-2 px-3 font-medium">Primary Contact</th>
                <th className="py-2 px-3 font-medium">Tags</th>
                <th className="py-2 px-3 font-medium">Engagements</th>
                <th className="py-2 px-3 font-medium">Onboarding Tasks</th>
                <th className="py-2 px-3 font-medium">Last Activity</th>
                <th className="py-2 px-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const tags = (r.tags || '')
                  .split(',')
                  .map(t => t.trim())
                  .filter(Boolean);
                return (
                  <tr key={r.client_id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-black transition-colors" style={{ background: '#181818' }}>
                    <td className="py-2 px-3 font-medium">{r.client_name}</td>
                    <td className="py-2 px-3">
                      <span className={badgeBase + ' ' + (r.is_active ? 'bg-emerald-400/90 text-black' : 'bg-[var(--surface-4)] text-[var(--text-2)]')}>{r.is_active ? 'Yes' : 'No'}</span>
                    </td>
                    <td className="py-2 px-3">
                      {r.primary_contact_name ? (
                        <div className="flex flex-col">
                          <span>{r.primary_contact_name}</span>
                          {r.primary_contact_email && <a className="underline text-[var(--accent-active)]" href={`mailto:${r.primary_contact_email}`}>{r.primary_contact_email}</a>}
                        </div>
                      ) : <span className="opacity-60">—</span>}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex flex-wrap gap-1">
                        {tags.length > 0
                          ? tags.map(tag => <span key={tag} className={badgeBase + ' bg-[var(--surface-4)] text-[var(--text-2)]'}>{tag}</span>)
                          : <span className="opacity-60">—</span>}
                      </div>
                    </td>
                    <td className="py-2 px-3">{r.engagement_count ?? 0}</td>
                    <td className="py-2 px-3">{r.pending_onboarding_tasks ?? 0}</td>
                    <td className="py-2 px-3">{r.last_activity_utc ? formatUtc(r.last_activity_utc) : '-'}</td>
                    <td className="py-2 px-3">{r.created_utc ? formatUtc(r.created_utc, { year: 'numeric', month: 'short', day: '2-digit' }) : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default ClientsRoute;
