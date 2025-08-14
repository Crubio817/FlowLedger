import React, { useEffect, useState, useCallback } from 'react';
import { getClientsOverview, createClient } from '../services/api.ts';
import { API_BASE_URL } from '../services/client.ts';
import type { ClientsOverviewItem } from '../services/models.ts';
import { formatUtc } from '../utils/date.ts';
<<<<<<< Updated upstream
=======
import { Users2 } from 'lucide-react';
import { formatRelativeTime } from '../utils/date.ts';
>>>>>>> Stashed changes

// Adapted row shape for UI presentation
interface ClientRow {
  id: number;
  name: string;
  status: 'active' | 'onboarding' | 'inactive';
  is_active: boolean;
  engagement_count?: number;
  pending_onboarding_tasks?: number;
  last_activity_utc?: string;
  created_utc?: string;
  primary_contact_name?: string;
  primary_contact_email?: string;
}
interface Contact { id: number; name: string; role: string; email: string; primary?: boolean } // placeholder until real endpoint
interface Engagement { id: number; title: string; phase: string; started: string; updated: string } // placeholder

// Placeholder mock related data kept temporarily for panel UX (will be replaced by real endpoints when available)
const seedRelated: { contacts: Record<number, Contact[]>; engagements: Record<number, Engagement[]> } = {
  contacts: {},
  engagements: {}
};

const contactsByClient: Record<number, Contact[]> = seedRelated.contacts;
const engagementsByClient: Record<number, Engagement[]> = seedRelated.engagements;

const statusColor: Record<ClientRow['status'], string> = {
  active: 'bg-[var(--silver-700)]/25 text-[var(--silver-200)] border border-[var(--silver-600)]',
  onboarding: 'bg-[var(--silver-600)]/20 text-[var(--silver-300)] border border-[var(--silver-500)]',
  inactive: 'bg-[var(--silver-800)]/15 text-[var(--silver-500)] border border-[var(--silver-700)]'
};

const ClientsRoute: React.FC = () => {
  const [rows, setRows] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [lastFetchOk, setLastFetchOk] = useState<boolean | null>(null);
  const [expanded, setExpanded] = useState<{ id: number; panel: 'contacts' | 'engagements' } | null>(null);
<<<<<<< Updated upstream
=======
  const [showNewClient, setShowNewClient] = useState(false);
>>>>>>> Stashed changes

  const load = useCallback(async () => {
      try {
      setLoading(true);
      setError(undefined);
      const res = await getClientsOverview(100);
      const data: ClientsOverviewItem[] = res.data || [];
        setLastFetchOk(true);
      if ((import.meta as any).env?.DEV) console.debug('[clients] overview response', { count: data.length, meta: res.meta });
      const mapped: ClientRow[] = data.map(d => {
        const status: ClientRow['status'] = !d.is_active ? 'inactive' : (d.pending_onboarding_tasks ? 'onboarding' : 'active');
        return {
          id: d.client_id!,
            name: d.client_name || '—',
            status,
            is_active: !!d.is_active,
            engagement_count: d.engagement_count ?? undefined,
            pending_onboarding_tasks: d.pending_onboarding_tasks ?? undefined,
            last_activity_utc: d.last_activity_utc || undefined,
            created_utc: d.created_utc || undefined,
            primary_contact_name: d.primary_contact_name || undefined,
            primary_contact_email: d.primary_contact_email || undefined,
        };
      });
      setRows(mapped);
    } catch (e: any) {
      setLastFetchOk(false);
      if ((import.meta as any).env?.DEV) console.error('[clients] load failed', e);
      setError(e?.message || 'Failed to load clients');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function toggle(id: number, panel: 'contacts' | 'engagements') {
    setExpanded(cur => {
      if (!cur) return { id, panel };
      if (cur.id === id && cur.panel === panel) return null; // collapse same
      return { id, panel }; // switch or open new
    });
  }

  function renderPanel(row: ClientRow) {
    if (!expanded || expanded.id !== row.id) return null;
    if (expanded.panel === 'contacts') {
      const list = contactsByClient[row.id] || [];
      return (
        <div className="p-4 space-y-3">
          <div className="text-xs uppercase tracking-wide text-[var(--text-2)] font-medium">Contacts</div>
          {list.length === 0 && <div className="text-sm text-[var(--text-2)]">No contacts yet.</div>}
          {list.length > 0 && (
            <ul className="divide-y divide-[var(--border-subtle)]">
              {list.map(c => (
                <li key={c.id} className="py-2 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{c.name}</span> <span className="opacity-70">· {c.role}</span>
                    {c.primary && <span className="ml-2 text-[10px] uppercase bg-[var(--accent-active)] text-black px-1.5 py-0.5 rounded">Primary</span>}
                  </div>
                  <a href={`mailto:${c.email}`} className="underline text-[var(--accent-active)]">{c.email}</a>
                </li>
              ))}
            </ul>
          )}
          <div>
            <button className="accent-btn">Add Contact</button>
          </div>
        </div>
      );
    }
    // engagements panel
    const list = engagementsByClient[row.id] || [];
    return (
      <div className="p-4 space-y-3">
        <div className="text-xs uppercase tracking-wide text-[var(--text-2)] font-medium">Engagements</div>
        {list.length === 0 && <div className="text-sm text-[var(--text-2)]">No engagements yet.</div>}
        {list.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2">
            {list.map(e => (
              <div key={e.id} className="card p-3 hoverable">
                <div className="text-sm font-medium mb-1">{e.title}</div>
                <div className="text-xs flex gap-3 opacity-70">
                  <span>{e.phase}</span>
                  <span>Started {e.started}</span>
                  <span>Updated {e.updated}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <div>
          <button className="accent-btn">New Engagement</button>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6" data-testid="clients-page">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Clients</h1>
<<<<<<< Updated upstream
          <p className="text-sm text-[var(--text-2)] mt-1">Live directory pulled from overview endpoint.</p>
        </div>
        <div className="flex gap-2">
          <button className="accent-btn" onClick={async () => {
            const name = prompt('Client name?');
            if (!name) return;
            try {
              await createClient(name, true);
              await load();
            } catch {/* toast already shown */}
          }}>New Client</button>
        </div>
      </header>
      <div className="card p-0 overflow-hidden">
        {loading && <div className="p-6 text-sm text-[var(--text-2)]">Loading clients…</div>}
        {!loading && error && <div className="p-6 text-sm text-red-400">{error}</div>}
        {!loading && !error && (
          <table className="w-full text-sm">
=======
          <p className="text-sm text-[var(--text-2)] mt-1">All active and onboarding clients.</p>
        </div>
        <div className="flex gap-2">
          <button className="accent-btn" onClick={() => setShowNewClient(true)}>New Client</button>
        </div>
      </header>
      {/* KPI grid moved from Dashboard: contextual KPIs based on clients overview */}
      {!loading && !error && rows.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <KPI title="Total Clients" value={rows.length} />
          <KPI title="Active %" value={(() => { const active = rows.filter(r=>r.is_active).length; return rows.length? ((active/rows.length*100)|0)+'%':''; })()} />
          <KPI title="Total Engagements" value={rows.reduce((a,r)=>a+(r.engagement_count||0),0)} />
          <KPI title="Pending Tasks" value={rows.reduce((a,r)=>a+(r.pending_onboarding_tasks||0),0)} />
        </div>
      )}
    <div className="card p-0 overflow-hidden">
        {loading && <div className="p-6 text-sm text-[var(--text-2)]">Loading clients…</div>}
        {!loading && error && <div className="p-6 text-sm text-red-400">{error}</div>}
        {!loading && !error && (
          <table className="w-full text-sm clients-table">
>>>>>>> Stashed changes
            <thead className="text-[var(--text-2)] text-xs uppercase tracking-wide">
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="text-left py-2 px-3 font-medium">Client</th>
                <th className="text-left py-2 px-3 font-medium">Status</th>
                <th className="text-left py-2 px-3 font-medium">Engagements</th>
                <th className="text-left py-2 px-3 font-medium">Pending Tasks</th>
                <th className="text-left py-2 px-3 font-medium">Last Activity</th>
                <th className="text-left py-2 px-3 font-medium">Created</th>
                <th className="text-right py-2 px-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <React.Fragment key={r.id}>
                  <tr className="border-b border-[var(--border-subtle)] hover:bg-[var(--surface-3)] transition-colors" aria-expanded={expanded?.id === r.id}>
<<<<<<< Updated upstream
                    <td className="py-2 px-3 font-medium">{r.name}</td>
                    <td className="py-2 px-3"><span className={`rounded-full px-2 py-0.5 text-[11px] tracking-wide font-medium uppercase ${statusColor[r.status]}`}>{r.status}</span></td>
                    <td className="py-2 px-3">{r.engagement_count ?? 0}</td>
                    <td className="py-2 px-3">{r.pending_onboarding_tasks ?? 0}</td>
                    <td className="py-2 px-3">{r.last_activity_utc ? formatUtc(r.last_activity_utc) : '—'}</td>
                    <td className="py-2 px-3">{r.created_utc ? formatUtc(r.created_utc, { year: 'numeric', month: 'short', day: '2-digit' }) : '—'}</td>
                    <td className="py-2 px-3 text-right space-x-2">
                      <button onClick={() => toggle(r.id, 'contacts')} className={`text-xs underline ${expanded?.id === r.id && expanded.panel==='contacts' ? 'text-[var(--accent-active)]' : ''}`}>Contacts</button>
                      <button onClick={() => toggle(r.id, 'engagements')} className={`text-xs underline ${expanded?.id === r.id && expanded.panel==='engagements' ? 'text-[var(--accent-active)]' : ''}`}>Engagements</button>
=======
                    <td className="py-2 px-3 font-medium"><a className="hover:underline" href={`/clients/${r.id}`}>{r.name}</a></td>
                    <td className="py-2 px-3"><span className={`rounded-full px-2 py-0.5 text-[11px] tracking-wide font-medium uppercase ${statusColor[r.status]}`}>{r.status}</span></td>
                    <td className="py-2 px-3 numeric">{r.engagement_count ?? 0}</td>
                    <td className="py-2 px-3 numeric">{r.pending_onboarding_tasks ?? 0}</td>
                    <td className="py-2 px-3">{r.last_activity_utc ? formatUtc(r.last_activity_utc) : '—'}</td>
                    <td className="py-2 px-3">{r.created_utc ? formatUtc(r.created_utc, { year: 'numeric', month: 'short', day: '2-digit' }) : '—'}</td>
                    <td className="py-2 px-3 text-right space-x-2">
                      <button title="View Contacts" aria-label="View Contacts" className="icon-action" onClick={() => toggle(r.id, 'contacts')}>📇</button>
                      <button title="View Engagements" aria-label="View Engagements" className="icon-action" onClick={() => toggle(r.id, 'engagements')}>📊</button>
>>>>>>> Stashed changes
                    </td>
                  </tr>
                  {expanded?.id === r.id && (
                    <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-2)]">
                      <td colSpan={7} className="p-0">
                        <div className="animate-fade-in">
                          {renderPanel(r)}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[var(--text-2)] space-y-3">
                    <div className="font-medium">No clients returned</div>
                    <div className="text-xs max-w-md mx-auto opacity-70 leading-relaxed">
                      The overview endpoint responded with an empty list. If you expect data:
                      <ul className="list-disc list-inside text-left mt-2 space-y-1">
                        <li>Confirm the backend has client records.</li>
                        <li>Verify you are pointing to the correct environment (VITE_API_BASE_URL).</li>
                        <li>Check browser console for any network or CORS errors (they will be logged in dev).</li>
                      </ul>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
<<<<<<< Updated upstream
=======
      {showNewClient && (
        <NewClientModal onClose={() => setShowNewClient(false)} onCreated={async (name:string) => {
          try { await createClient(name, true); await load(); }
          catch {/* handled in api */}
          finally { setShowNewClient(false); }
        }} />
      )}
>>>>>>> Stashed changes
    </div>
  );
};

export default ClientsRoute;
<<<<<<< Updated upstream
=======


function NewClientModal({ onClose, onCreated }:{ onClose:()=>void; onCreated:(name:string)=>Promise<void> }){
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string|undefined>();

  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4">
      <div className="modal-card rounded-2xl p-4 w-full max-w-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">New Client</h3>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        {err && <div className="text-sm text-red-600 mb-2">{err}</div>}
        <label className="text-sm block">Client name
          <input className="w-full border rounded px-2 py-1 mt-1 bg-[var(--surface-1)] text-[var(--text-1)]" value={name} onChange={e=>setName(e.target.value)} />
        </label>
        <div className="flex gap-2 justify-end mt-4">
          <button className="border rounded px-3 py-2" onClick={onClose}>Cancel</button>
          <button className="accent-btn" disabled={saving} onClick={async ()=>{
            if(!name.trim()){ setErr('Name is required'); return; }
            setErr(undefined); setSaving(true);
            try { await onCreated(name.trim()); }
            catch(e:any){ setErr(e?.message || 'Create failed'); }
            finally{ setSaving(false); }
          }}>{saving? 'Creating…' : 'Create'}</button>
        </div>
      </div>
    </div>
  );
}

// Small KPI card used on Clients page (moved from Dashboard)
const KPI: React.FC<{ title: string; value: string | number | undefined }> = ({ title, value }) => (
  <div className="rounded-xl border border-[var(--border-subtle)] p-4 bg-[var(--surface-2)] flex flex-col gap-1">
    <div className="text-[11px] uppercase tracking-wide text-[var(--text-2)]">{title}</div>
    <div className="text-lg font-semibold">{value ?? '\u2014'}</div>
  </div>
);
>>>>>>> Stashed changes
