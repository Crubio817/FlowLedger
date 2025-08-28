import React, { useEffect, useState } from 'react';
import { getClientsOverview, createClient, createClientContact, clientSetup, createEngagement } from '../services/api.ts';
import { toast } from '../lib/toast.ts';
import type { ClientsOverviewItem } from '../services/models.ts';
import { formatUtc } from '../utils/date.ts';
import StatCard from '../components/StatCard.tsx';
import Modal from '../components/Modal.tsx';

const badgeBase = 'inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium';

// Route showing a table of client engagement and onboarding stats
export const ClientsRoute: React.FC = () => {
  const [rows, setRows] = useState<ClientsOverviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [engageOpen, setEngageOpen] = useState(false);
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const loadRows = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getClientsOverview(50);
      setRows(res.data || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { let cancelled = false; loadRows(); return () => { cancelled = true; }; }, [loadRows]);

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
          <div className="flex items-center gap-3">
            <button
              aria-label="Add new client"
              className="flex items-center justify-center font-semibold transition-transform hover:scale-105 border-none"
              style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(180deg, #232323 0%, #181818 100%)', color: '#fff', boxShadow: '8px 8px 24px #111, -8px -8px 24px #222', fontSize: '1.2rem' }}
              onClick={() => setCreateOpen(true)}
              title="Add New Client"
            >
              <span style={{fontWeight:600, fontSize:20}}>+</span>
            </button>
            <button className="px-3 py-2 rounded bg-[var(--surface-3)] hover:bg-[var(--surface-4)] text-sm" onClick={()=>setEngageOpen(true)}>New Engagement</button>
          </div>
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

      <ClientsModalsWrapper createOpen={createOpen} setCreateOpen={setCreateOpen} engageOpen={engageOpen} setEngageOpen={setEngageOpen} loadRows={loadRows} rows={rows} />
    </div>
  );
};

export default ClientsRoute;

// Render modals adjacent to route so they can refresh the list
function ClientsModalsWrapper({ createOpen, setCreateOpen, engageOpen, setEngageOpen, loadRows, rows }:{ createOpen:boolean; setCreateOpen:(v:boolean)=>void; engageOpen:boolean; setEngageOpen:(v:boolean)=>void; loadRows:()=>Promise<void>; rows: ClientsOverviewItem[] }) {
  return (
    <>
      {createOpen && (
        <CreateClientModal onClose={()=>setCreateOpen(false)} onCreated={async ()=>{ await loadRows(); setCreateOpen(false); }} />
      )}
      {engageOpen && (
        <CreateEngagementModal rows={rows} onClose={()=>setEngageOpen(false)} onCreated={async ()=>{ await loadRows(); setEngageOpen(false); }} />
      )}
    </>
  );
}

// CreateClientModal: modal for creating client + primary contact
function CreateClientModal({ onClose, onCreated }:{ onClose:()=>void; onCreated:()=>void }) {
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string|null>(null);
  const modalRef = React.useRef<HTMLDivElement|null>(null);

  React.useEffect(()=>{
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') submit(); };
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return;
      const focusable = Array.from(modalRef.current.querySelectorAll<HTMLElement>('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])')).filter(el => !el.hasAttribute('disabled'));
      if (focusable.length === 0) return;
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length-1];
      if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
      if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keydown', trap);
    return ()=>{ window.removeEventListener('keydown', onKey); window.removeEventListener('keydown', trap); if (prev && typeof prev.focus === 'function') prev.focus(); };
  }, []);

  const validateEmail = (v: string) => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const submit = async () => {
    setErr(null);
    if (!name.trim()) { setErr('Client name is required'); return; }
    if (email && !validateEmail(email)) { setErr('Enter a valid email or leave blank'); return; }
    try {
      setSaving(true);
      const client = await createClient(name.trim(), isActive, null);
      const clientId = client && (client.client_id || client.data?.client_id || client.clientId || client.client_id);
      if (clientId && (first || last || email || phone)) {
        await createClientContact({ client_id: Number(clientId), first_name: first || null, last_name: last || null, email: email || null, phone: phone || null, is_primary: true });
        // attempt orchestration - best-effort
        try { await clientSetup(Number(clientId), { PrimaryContactId: undefined, PlaybookCode: 'DEFAULT', OwnerUserId: null }); } catch {}
      }
      onCreated();
      onClose();
    } catch (e:any) {
      setErr(e?.message || 'Failed to create client');
    } finally { setSaving(false); }
  };

  return (
    <Modal title="New Client" onClose={onClose} className="bg-zinc-900/95 text-[var(--text-1)] w-full max-w-lg p-6" footer={(
      <div className="flex items-center justify-between gap-3">
        <div>
          <button className="btn-cancel" onClick={onClose} disabled={saving}>Cancel</button>
        </div>
        <div>
          <button className="btn-create" onClick={submit} disabled={saving || !name.trim()}>{saving ? 'Saving…' : 'Create'}</button>
        </div>
      </div>
    )}>
      {err && <div className="text-sm text-red-500 mb-2">{err}</div>}

      <div style={{ maxHeight: '60vh', overflow: 'auto', paddingRight: 6 }}>
        <div className="space-y-4">
          <div className="pb-2 border-b border-white/6 mt-2">
            <h3 className="text-sm font-semibold text-zinc-300">Client</h3>
            <div id="client-section-desc" className="text-xs text-[var(--text-2)] mt-1">Basic client information.</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <div>
              <label className="text-xs block">Name <span className="text-red-400">*</span></label>
              <input aria-describedby="client-name-desc" value={name} onChange={e=>setName(e.target.value)} className="mt-1 w-full rounded px-3 py-2 bg-[#0b0f12] text-white border border-white/10 hover:bg-zinc-700 focus:outline-none focus:border-[var(--silver-700)] focus:ring-2 focus:ring-[var(--silver-700)]" placeholder="Company name" />
              <div id="client-name-desc" className="text-xs text-[var(--text-2)] mt-1">Official client name.</div>
            </div>

            <div>
              <label className="text-xs block">Status</label>
              <div role="radiogroup" aria-labelledby="client-status-desc" className="mt-1 inline-flex items-center rounded-full bg-[var(--surface-3)] p-1">
                <button type="button" role="radio" aria-checked={isActive} onClick={()=>setIsActive(true)} aria-pressed={isActive} className={`rounded-full px-4 py-2 leading-none transition ${isActive ? 'bg-emerald-600 text-white' : 'bg-transparent border border-white/10 text-zinc-400 hover:text-white'}`}>Active</button>
                <button type="button" role="radio" aria-checked={!isActive} onClick={()=>setIsActive(false)} aria-pressed={!isActive} className={`ml-2 rounded-full px-4 py-2 leading-none transition ${!isActive ? 'bg-emerald-600 text-white' : 'bg-transparent border border-white/10 text-zinc-400 hover:text-white'}`}>Prospect</button>
              </div>
              <div id="client-status-desc" className="text-xs text-[var(--text-2)] mt-1">Optional status for the client.</div>
            </div>
          </div>

          <div className="pt-2 pb-1 border-b border-white/6 mt-6">
            <h3 className="text-sm font-semibold text-zinc-300">Primary Contact</h3>
            <div id="primary-contact-desc" className="text-xs text-[var(--text-2)] mt-1">Optional — useful for auto-communications.</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <div>
              <label className="text-xs block">First name</label>
              <input aria-describedby="first-name-desc" value={first} onChange={e=>setFirst(e.target.value)} className="mt-1 w-full rounded px-3 py-2 bg-[#0b0f12] text-white border border-white/10 hover:bg-zinc-700 focus:outline-none focus:border-[var(--silver-700)] focus:ring-2 focus:ring-[var(--silver-700)]" />
              <div id="first-name-desc" className="text-xs text-[var(--text-2)] mt-1">Given name.</div>
            </div>
            <div>
              <label className="text-xs block">Last name</label>
              <input aria-describedby="last-name-desc" value={last} onChange={e=>setLast(e.target.value)} className="mt-1 w-full rounded px-3 py-2 bg-[#0b0f12] text-white border border-white/10 hover:bg-zinc-700 focus:outline-none focus:border-[var(--silver-700)] focus:ring-2 focus:ring-[var(--silver-700)]" />
              <div id="last-name-desc" className="text-xs text-[var(--text-2)] mt-1">Family name.</div>
            </div>
            <div>
              <label className="text-xs block">Email</label>
              <input aria-describedby="email-desc" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded px-3 py-2 bg-[#0b0f12] text-white border border-white/10 hover:bg-zinc-700 focus:outline-none focus:border-[var(--silver-700)] focus:ring-2 focus:ring-[var(--silver-700)]" placeholder="name@company.com" />
              <div id="email-desc" className="text-xs text-[var(--text-2)] mt-1">Optional — used for notifications.</div>
            </div>
            <div>
              <label className="text-xs block">Phone</label>
              <input aria-describedby="phone-desc" value={phone} onChange={e=>setPhone(e.target.value)} className="mt-1 w-full rounded px-3 py-2 bg-[#0b0f12] text-white border border-white/10 hover:bg-zinc-700 focus:outline-none focus:border-[var(--silver-700)] focus:ring-2 focus:ring-[var(--silver-700)]" placeholder="Optional" />
              <div id="phone-desc" className="text-xs text-[var(--text-2)] mt-1">Optional — useful for quick contact.</div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// CreateEngagementModal: compact modal implementing requested UX improvements
function CreateEngagementModal({ onClose, onCreated, rows, preselect }:{ onClose:()=>void; onCreated:()=>void; rows: ClientsOverviewItem[]; preselect?: number | null }) {
  const [clientId, setClientId] = useState<number | ''>(preselect ?? '');
  const [clientQuery, setClientQuery] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('active');
  const [startDate, setStartDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string|null>(null);
  const notesMax = 1000;
  const modalRef = React.useRef<HTMLDivElement | null>(null);

  // suggestions for combobox (remote-backed)
  const [suggestions, setSuggestions] = React.useState<ClientsOverviewItem[]>([]);
  const [searching, setSearching] = React.useState(false);
  // debounce remote search
  React.useEffect(() => {
    let cancelled = false;
    if (!clientQuery) {
      setSuggestions([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const id = setTimeout(async () => {
      try {
        // call API-backed overview with query; expect the endpoint to support a 'q' param
        const res = await getClientsOverview(10, clientQuery);
        if (!cancelled) setSuggestions(res.data || []);
      } catch (e) {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(id); };
  }, [clientQuery]);

  React.useEffect(()=>{
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') submit();
    };
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return;
      const focusable = Array.from(modalRef.current.querySelectorAll<HTMLElement>('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])')).filter(el => !el.hasAttribute('disabled'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length-1];
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keydown', trap);
    return ()=>{ window.removeEventListener('keydown', onKey); window.removeEventListener('keydown', trap); if (prev && typeof prev.focus === 'function') prev.focus(); };
  }, []);

  const formatServerError = (e: any) => {
    const raw = e && (e.message || e?.toString?.());
    if (!raw) return 'Request failed';
    try {
      const parsed = JSON.parse(String(raw));
      if (parsed?.error?.message) return parsed.error.message;
      if (parsed?.message) return parsed.message;
      return JSON.stringify(parsed);
    } catch { return String(raw); }
  };

  const submit = async () => {
    setErr(null);
    if (!clientId) { setErr('Select a client'); return; }
    if (!name.trim()) { setErr('Name is required'); return; }
    try {
      setSaving(true);
      const start_utc = startDate ? new Date(startDate + 'T00:00:00Z').toISOString() : null;
      await createEngagement({ client_id: Number(clientId), name: name.trim(), status, start_utc, notes: notes || null });
      onCreated();
      onClose();
    } catch (e:any) {
      setErr(formatServerError(e));
    } finally { setSaving(false); }
  };

  return (
    <Modal title="New Engagement" onClose={onClose} className="bg-[#0f1213] w-full max-w-lg p-6" footer={(
      <div className="flex items-center justify-between gap-3">
        <div>
          <button className="btn-cancel" onClick={onClose} disabled={saving}>Cancel</button>
        </div>
        <div>
          <button className="btn-create" onClick={submit} disabled={saving || !clientId || !name.trim()}>{saving ? 'Saving…' : 'Create'}</button>
        </div>
      </div>
    )}>
      {err && <div className="text-sm text-red-500 mb-2">{err}</div>}

      <div style={{ maxHeight: '56vh', overflow: 'auto', paddingRight: 6 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm">Client <span className="text-red-400">*</span></label>
            <div className="relative mt-1">
              <input aria-label="Search client" placeholder="Type to search..." value={clientQuery} onChange={e=>{ setClientQuery(e.target.value); setClientId(''); }} className="w-full rounded px-3 py-2 bg-[var(--surface-2)] text-white" />
              {clientQuery && (
                <ul className="absolute z-40 mt-1 w-full bg-[#0b0f12] border border-white/6 rounded max-h-44 overflow-auto">
                  {searching && <li className="px-3 py-2 text-sm text-[var(--text-2)]">Searching…</li>}
                  {!searching && suggestions.length === 0 && <li className="px-3 py-2 text-sm text-[var(--text-2)]">No matches</li>}
                  {!searching && suggestions.map(s => (
                    <li key={s.client_id}><button className="w-full text-left px-3 py-2 hover:bg-white/5" onClick={()=>{ setClientId(Number(s.client_id)); setClientQuery(String(s.client_name)); }}>{s.client_name} ({s.client_id})</button></li>
                  ))}
                </ul>
              )}
            </div>
            <div className="text-xs text-[var(--text-2)] mt-1">Search and pick the client for this engagement.</div>
          </div>

          <div>
            <label className="text-sm">Name <span className="text-red-400">*</span></label>
            <input placeholder="e.g., 'AP Process Audit'" value={name} onChange={e=>setName(e.target.value)} className="mt-1 w-full rounded px-3 py-2 bg-[#111316] text-white" />
            <div className="text-xs text-[var(--text-2)] mt-1">Short descriptive title for the engagement.</div>
          </div>

          <div>
            <label className="text-sm">Status</label>
            <select className="mt-1 w-full rounded px-3 py-2 bg-[#111316] text-white" value={status} onChange={e=>setStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="prospect">Prospect</option>
            </select>
          </div>

          <div>
            <label className="text-sm">Start date</label>
            <div className="mt-1 flex items-center gap-2">
              <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="flex-1 rounded px-3 py-2 bg-[#111316] text-white" />
              <button type="button" className="px-3 py-2 rounded bg-[var(--surface-3)]" aria-label="Open date picker">📅</button>
            </div>
            <div className="text-xs text-[var(--text-2)] mt-1">Optional start date for the engagement.</div>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm">Notes</label>
            <textarea rows={4} value={notes} onChange={e=>setNotes(e.target.value)} className="mt-1 w-full rounded px-3 py-2 bg-[#111316] text-white" maxLength={notesMax} />
            <div className="flex items-center justify-between text-xs text-[var(--text-2)] mt-1"><span>Optional notes</span><span>{notes.length}/{notesMax}</span></div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
