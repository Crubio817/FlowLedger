import React from 'react';
import { useParams, NavLink, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button.tsx';
import { Input } from '../ui/input.tsx';
import { Avatar } from '../ui/avatar.tsx';
import { Badge } from '../ui/badge.tsx';
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter } from '../ui/dialog.tsx';
import { getClientsOverview, listClientContacts, listAudits, listClientEngagements } from '../services/api.ts';
import type { ClientsOverviewItem } from '../services/models.ts';
import { formatUtc } from '../utils/date.ts';
import { Users2, Briefcase, Tag, FileText, ArrowLeft, Search } from 'lucide-react';

export default function ClientProfileRoute() {
  const params = useParams();
  const navigate = useNavigate();
  const clientId = Number(params.clientId);
  const [client, setClient] = React.useState<ClientsOverviewItem | null>(null);
  const [contacts, setContacts] = React.useState<any[]>([]);
  const [audits, setAudits] = React.useState<any[]>([]);
  const [engagements, setEngagements] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true); setErr(null);
        const [ovr, cons, aus, eng] = await Promise.all([
          getClientsOverview(500),
          listClientContacts(1, 200, clientId),
          listAudits(1, 50),
          listClientEngagements(1, 200, clientId),
        ]);
        if (cancelled) return;
        const row = (ovr.data || []).find((r: any) => Number(r.client_id) === Number(clientId)) || null;
        setClient(row);
        const consArr = (cons.data || cons || []);
        const filteredCons = Array.isArray(consArr) ? consArr.filter((c:any) => Number(c.client_id) === Number(clientId)) : [];
        setContacts(filteredCons);
        const allAudits = (aus.data || aus || []) as any[];
        setAudits(allAudits.filter(a => Number(a.client_id) === Number(clientId)).slice(0, 50));
        const engList = (eng && (eng.data ?? eng)) || [];
        setEngagements(Array.isArray(engList) ? engList.filter((e:any) => Number(e.client_id) === Number(clientId)) : []);
      } catch (e: any) {
        setErr(e?.message || 'Failed to load client');
      } finally { setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [clientId]);

  const tags = String(client?.tags || '')
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="minimal" onClick={()=>navigate('/clients')} title="Back to Clients"><ArrowLeft size={16} /></Button>
          <div>
            <h1 className="text-xl font-semibold">{client?.client_name || 'Client'}</h1>
            <p className="text-sm text-[var(--text-2)]">Client profile and activity.</p>
          </div>
          {client && <Badge variant={client.is_active ? 'success' : 'muted'}>{client.is_active ? 'Active' : 'Inactive'}</Badge>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <NavLink to={`/clients/engagements`} className="btn-pill btn-minimal inline-flex items-center gap-2">
            <Briefcase size={16} /> Engagements
          </NavLink>
          <NavLink to={`/clients/${clientId}/documents`} className="btn-pill btn-minimal inline-flex items-center gap-2">
            <FileText size={16} /> Documents
          </NavLink>
        </div>
      </div>

      {loading && <div className="text-sm text-[var(--text-2)]">Loading…</div>}
      {!loading && err && <div className="text-sm text-red-500">{err}</div>}

      {!loading && !err && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Overview card */}
            <div className="card p-4" style={{ background: '#181818' }}>
              <div className="text-xs uppercase tracking-wide text-[var(--text-2)] mb-2">Overview</div>
              <div className="space-y-2 text-sm">
                <div><span className="opacity-70 mr-2">Created:</span>{client?.created_utc ? formatUtc(client.created_utc) : '-'}</div>
                <div><span className="opacity-70 mr-2">Last Activity:</span>{client?.last_activity_utc ? formatUtc(client.last_activity_utc) : '-'}</div>
                <div><span className="opacity-70 mr-2">Engagements:</span>{client?.engagement_count ?? 0}</div>
                <div><span className="opacity-70 mr-2">Onboarding tasks:</span>{client?.pending_onboarding_tasks ?? 0}</div>
              </div>
            </div>

            {/* Tags */}
            <div className="card p-4" style={{ background: '#181818' }}>
              <div className="text-xs uppercase tracking-wide text-[var(--text-2)] mb-2">Tags</div>
              <div className="flex flex-wrap gap-1.5">
                {tags.length > 0 ? tags.map(t => <span key={t} className="chip">{t}</span>) : <span className="opacity-60 text-sm">—</span>}
              </div>
            </div>

            {/* Quick search */}
            <div className="card p-4" style={{ background: '#181818' }}>
              <div className="text-xs uppercase tracking-wide text-[var(--text-2)] mb-2">Search</div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70" />
                <Input placeholder="Search within this client (coming soon)" className="pl-9" />
              </div>
            </div>
          </div>

          {/* Contacts */}
          <div className="card p-4" style={{ background: '#181818' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs uppercase tracking-wide text-[var(--text-2)]">Contacts</div>
              <div className="text-xs text-[var(--text-2)]">{contacts.length} total</div>
            </div>
            <div className="divide-y divide-[var(--border-subtle)] rounded-lg border border-[var(--border-subtle)]">
              {contacts.length === 0 && <div className="p-3 text-sm text-[var(--text-2)]">No contacts</div>}
              {contacts.map((c:any)=> (
                <div key={c.contact_id} className="p-3 flex items-center gap-3">
                  <Avatar name={`${c.first_name||''} ${c.last_name||''}`.trim() || c.email} />
                  <div className="min-w-0">
                    <div className="font-medium truncate">{`${c.first_name||''} ${c.last_name||''}`.trim() || '—'}</div>
                    <div className="text-xs opacity-70 truncate">{c.email || ''}</div>
                  </div>
                  {c.is_primary && <span className="badge badge-emerald ml-auto">Primary</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Audits */}
          <div className="card p-4" style={{ background: '#181818' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs uppercase tracking-wide text-[var(--text-2)]">Audits</div>
              <div className="text-xs text-[var(--text-2)]">Showing latest {audits.length}</div>
            </div>
            <table className="table-modern text-sm rounded-xl overflow-hidden">
              <thead className="text-left border-b border-[var(--border-subtle)]">
                <tr>
                  <th>Title</th>
                  <th>Phase</th>
                  <th>Complete</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {audits.length === 0 && (
                  <tr><td colSpan={4} className="p-3 text-[var(--text-2)]">No audits found</td></tr>
                )}
                {audits.map((a:any) => (
                  <tr key={a.audit_id} className="last:border-0">
                    <td>{a.title || '-'}</td>
                    <td>{a.phase || '-'}</td>
                    <td>{typeof a.percent_complete === 'number' ? `${a.percent_complete}%` : '-'}</td>
                    <td>{a.updated_utc ? formatUtc(a.updated_utc) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-xs text-[var(--text-2)] mt-2">Note: This list is global for now. Once the API exposes client or engagement filters, we’ll scope results.</div>
          </div>

          {/* Engagements */}
          <div className="card p-4" style={{ background: '#181818' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs uppercase tracking-wide text-[var(--text-2)]">Engagements</div>
              <div className="text-xs text-[var(--text-2)]">{engagements.length} total</div>
            </div>
            <table className="table-modern text-sm rounded-xl overflow-hidden">
              <thead className="text-left border-b border-[var(--border-subtle)]">
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Start</th>
                  <th>End</th>
                </tr>
              </thead>
              <tbody>
                {engagements.length === 0 && (
                  <tr><td colSpan={4} className="p-3 text-[var(--text-2)]">No engagements</td></tr>
                )}
        {engagements.map((e:any) => (
                  <tr key={e.engagement_id} className="last:border-0">
                    <td>{e.title || e.name || '-'}</td>
                    <td>{e.status || '-'}</td>
          <td>{(e.start_date ?? e.start_utc ?? e.startDate) ? new Date(e.start_date ?? e.start_utc ?? e.startDate).toLocaleDateString() : '-'}</td>
          <td>{(e.end_date ?? e.end_utc ?? e.endDate) ? new Date(e.end_date ?? e.end_utc ?? e.endDate).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
