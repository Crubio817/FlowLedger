
import React, { useEffect, useState } from 'react';
import { getClientsOverview } from '../services/api.ts';
import type { ClientsOverviewItem } from '../services/models.ts';
import { formatUtc } from '../utils/date.ts';

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold mb-1">Clients Overview</h1>
        <p className="text-sm text-[var(--text-2)]">Snapshot of client engagement & onboarding signals.</p>
      </div>
      <div className="card overflow-auto">
        {loading && <div className="p-6 text-sm text-[var(--text-2)]">Loading…</div>}
        {!loading && error && <div className="p-6 text-sm text-red-400">{error}</div>}
        {!loading && !error && rows.length === 0 && <div className="p-6 text-sm text-[var(--text-2)]">No clients found.</div>}
        {!loading && !error && rows.length > 0 && (
          <table className="w-full text-sm">
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
                const tags: string[] = (r.tags || '')
                  .split(',')
                  .map((t: string) => t.trim())
                  .filter((t: string) => Boolean(t));
                return (
                  <tr key={r.client_id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--surface-3)] transition-colors">
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
                        {tags.map((tag: string) => <span key={tag} className={badgeBase + ' bg-[var(--surface-4)] text-[var(--text-2)]'}>{tag}</span>)}
                        {tags.length === 0 && <span className="opacity-60">—</span>}
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
