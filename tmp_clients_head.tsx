import React, { useEffect, useState } from 'react';
import { getClientsOverview, createClient, createClientContact, clientSetup, createEngagement, listClientTags, createClientTag, updateClientTag, deleteClientTag, applyTagToClient } from '../services/api.ts';
import { toast } from '../lib/toast.ts';
import type { ClientsOverviewItem } from '../services/models.ts';
import { formatUtc } from '../utils/date.ts';
import StatCard from '../components/StatCard.tsx';
import { Button } from '../ui/button.tsx';
import { Input } from '../ui/input.tsx';
import { Chip } from '../ui/chip.tsx';
import { Avatar } from '../ui/avatar.tsx';
import { Badge } from '../ui/badge.tsx';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover.tsx';
import { DropdownMenu, DropdownTrigger, DropdownContent, DropdownItem } from '../ui/dropdown.tsx';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogClose } from '../ui/dialog.tsx';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';

const badgeBase = 'inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium';

// Route showing a table of client engagement and onboarding stats
export const ClientsRoute: React.FC = () => {
  const [rows, setRows] = useState<ClientsOverviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagMenuOpen, setTagMenuOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [engageOpen, setEngageOpen] = useState(false);
  const [preselectClientId, setPreselectClientId] = useState<number | null>(null);
  const [tagManagerOpen, setTagManagerOpen] = useState(false);
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const [contactsOpen, setContactsOpen] = useState(false);
  const [contactsClientId, setContactsClientId] = useState<number | null>(null);
  const [contactsClientName, setContactsClientName] = useState<string | null>(null);
  const loadRows = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getClientsOverview(50);
  setRows(res.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { let cancelled = false; loadRows(); return () => { cancelled = true; }; }, [loadRows]);

  // Load available tags for filtering
  useEffect(() => {
    (async () => {
      try {
        const api = await import('../services/api.ts');
        const res = await api.listClientTags(1, 200);
        const body = (res && (res.data ?? res)) || [];
        setAvailableTags((body || []).map((t: any) => String(t.tag_name)));
      } catch {}
    })();
  }, []);

  // KPI metrics
  const totalClients = rows.length;
  const activeClients = rows.filter(r => r.is_active).length;
  const onboardingTasks = rows.reduce((sum, r) => sum + (r.pending_onboarding_tasks ?? 0), 0);
  const totalEngagements = rows.reduce((sum, r) => sum + (r.engagement_count ?? 0), 0);

  // filter by query and tags; sorting handled by TanStack
  const filteredRows = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQuery = !normalizedQuery || [
        r.client_name,
        r.primary_contact_name,
        r.primary_contact_email,
      ].some((v) => String(v || '').toLowerCase().includes(normalizedQuery));
      const tagList = String(r.tags || '')
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
      const hasTags =
        selectedTags.length === 0 ||
        selectedTags.every((t) => tagList.includes(String(t).toLowerCase()));
      return matchesQuery && hasTags;
    });
  }, [rows, query, selectedTags]);

  // TanStack Table setup
  const [sorting, setSorting] = useState<SortingState>([{ id: 'client', desc: false }]);

  type RowT = ClientsOverviewItem;
  const columns = React.useMemo<ColumnDef<RowT>[]>(() => [
    {
      id: 'client',
      accessorFn: (r) => r.client_name || '',
      header: 'Client',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.original.client_name} />
          <span className="font-semibold">{row.original.client_name}</span>
        </div>
      ),
    },
    {
      id: 'active',
      accessorFn: (r) => (r.is_active ? 1 : 0),
      header: 'Active',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'success' : 'muted'}>
          {row.original.is_active ? 'Yes' : 'No'}
        </Badge>
      ),
      sortingFn: 'alphanumeric',
    },
    {
      id: 'primary',
      header: 'Primary Contact',
      accessorFn: (r) => r.primary_contact_name || '',
      cell: ({ row }) => (
        <PrimaryContactCell
          name={row.original.primary_contact_name}
          email={row.original.primary_contact_email}
          clientId={Number(row.original.client_id)}
          onOpenContacts={(cid) => {
            setContactsClientId(cid);
            setContactsClientName(row.original.client_name || null);
            setContactsOpen(true);
          }}
        />
      ),
      enableSorting: true,
    },
    {
      id: 'tags',
      header: 'Tags',
      accessorFn: (r) => r.tags || '',
      enableSorting: false,
      cell: ({ row }) => {
        const tags = String(row.original.tags || '')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
        return (
          <div className="flex flex-wrap gap-1.5 max-h-10 overflow-hidden">
            {tags.length > 0 ? tags.map((t) => <Chip key={t}>{t}</Chip>) : <span className="opacity-60">—</span>}
          </div>
        );
      },
    },
    {
      id: 'engagements',
      header: 'Engagements',
      accessorFn: (r) => Number(r.engagement_count || 0),
      cell: ({ getValue }) => <span className="cell-num">{Number(getValue() || 0)}</span>,
      sortingFn: 'alphanumeric',
    },
    {
      id: 'tasks',
      header: 'Onboarding Tasks',
      accessorFn: (r) => Number(r.pending_onboarding_tasks || 0),
      cell: ({ getValue }) => <span className="cell-num">{Number(getValue() || 0)}</span>,
      sortingFn: 'alphanumeric',
    },
    {
      id: 'activity',
      header: 'Last Activity',
      accessorFn: (r) => (r.last_activity_utc ? Date.parse(String(r.last_activity_utc)) : 0),
      cell: ({ row }) => <span className="cell-date">{row.original.last_activity_utc ? formatUtc(row.original.last_activity_utc) : '-'}</span>,
    },
    {
      id: 'created',
      header: 'Created',
      accessorFn: (r) => (r.created_utc ? Date.parse(String(r.created_utc)) : 0),
      cell: ({ row }) => (
        <span className="cell-date">{row.original.created_utc ? formatUtc(row.original.created_utc, { year: 'numeric', month: 'short', day: '2-digit' }) : '-'}</span>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="cell-actions">Actions</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="cell-actions">
          <DropdownMenu>
            <DropdownTrigger asChild>
              <Button variant="minimal" size="sm">Actions</Button>
            </DropdownTrigger>
            <DropdownContent>
              <DropdownItem onSelect={() => { setPreselectClientId(Number(row.original.client_id)); setEngageOpen(true); }}>New Engagement</DropdownItem>
              <DropdownItem onSelect={() => setTagManagerOpen(true)}>Manage Tags</DropdownItem>
              {row.original.primary_contact_email ? (
                <DropdownItem onSelect={() => { window.location.href = `mailto:${row.original.primary_contact_email}`; }}>Email Primary</DropdownItem>
              ) : (
                <DropdownItem disabled>Email Primary</DropdownItem>
              )}
            </DropdownContent>
          </DropdownMenu>
        </div>
      ),
    },
  ], [setEngageOpen, setPreselectClientId, setTagManagerOpen]);

  const table = useReactTable({
    data: filteredRows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { sorting: [{ id: 'client', desc: false }] },
  });

  return (
  <div className="space-y-6">
      <div className="mb-2">
        <div className="flex items-center justify-between mb-0">
          <h1 className="text-xl font-semibold">Clients Overview</h1>
          <div className="toolbar relative flex-wrap gap-2">
            <Button variant="primary" onClick={() => setCreateOpen(true)}>New Client</Button>
            <Button variant="minimal" onClick={()=>setEngageOpen(true)}>New Engagement</Button>
            <Button variant="minimal" onClick={()=>setTagManagerOpen(true)}>Manage Tags</Button>

            <div className="flex items-center gap-2 ml-2">
              <Input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search clients…" className="input-search w-64" />
              <Popover open={tagMenuOpen} onOpenChange={setTagMenuOpen}>
                <PopoverTrigger asChild>
                  <Button variant="minimal" aria-expanded={tagMenuOpen} aria-haspopup="menu">Filter Tags</Button>
                </PopoverTrigger>
                <PopoverContent className="mt-2">
                  <button className="item" onClick={()=>{ setSelectedTags([]); }}>Clear filters</button>
                  <div className="w-full max-h-56 overflow-auto">
                    {availableTags.length === 0 && <div className="item">No tags</div>}
                    {availableTags.map(tag => {
                      const id = `tag-${tag}`;
                      const active = selectedTags.includes(tag);
                      return (
                        <label key={tag} htmlFor={id} className="item w-full justify-between">
                          <span>{tag}</span>
                          <input id={id} type="checkbox" checked={active} onChange={() => setSelectedTags(prev => active ? prev.filter(t => t !== tag) : [...prev, tag])} />
                        </label>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            {selectedTags.length > 0 && (
              <div className="flex items-center gap-1 ml-1">
                {selectedTags.map(t => (<Chip key={t}>{t}</Chip>))}
                <Button variant="minimal" onClick={()=>setSelectedTags([])}>Clear</Button>
              </div>
            )}
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
          <table className="table-modern text-sm rounded-xl overflow-hidden">
            <thead className="text-left border-b border-[var(--border-subtle)]">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => {
                    const sorted = header.column.getIsSorted();
                    const sortable = header.column.getCanSort();
                    const cls = sortable ? `th-sortable ${sorted ? 'active ' + (sorted === 'asc' ? 'asc' : 'desc') : ''}` : '';
                    return (
                      <th key={header.id} className={cls} onClick={sortable ? header.column.getToggleSortingHandler() : undefined}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sortable && <span className="caret">▾</span>}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="last:border-0">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

  <ClientsModalsWrapper
        createOpen={createOpen}
        setCreateOpen={setCreateOpen}
        engageOpen={engageOpen}
        setEngageOpen={setEngageOpen}
        tagManagerOpen={tagManagerOpen}
        setTagManagerOpen={setTagManagerOpen}
        contactsOpen={contactsOpen}
        setContactsOpen={setContactsOpen}
        contactsClientId={contactsClientId}
        contactsClientName={contactsClientName}
        loadRows={loadRows}
        rows={rows}
        preselect={preselectClientId}
        setPreselect={setPreselectClientId}
      />
    </div>
  );
};

export default ClientsRoute;

// Render modals adjacent to route so they can refresh the list
function ClientsModalsWrapper({
  createOpen,
  setCreateOpen,
  engageOpen,
  setEngageOpen,
  tagManagerOpen,
  setTagManagerOpen,
  contactsOpen,
  setContactsOpen,
  contactsClientId,
  contactsClientName,
  loadRows,
  rows,
  preselect,
  setPreselect,
}:{
  createOpen:boolean; setCreateOpen:(v:boolean)=>void;
  engageOpen:boolean; setEngageOpen:(v:boolean)=>void;
  tagManagerOpen:boolean; setTagManagerOpen:(v:boolean)=>void;
  contactsOpen:boolean; setContactsOpen:(v:boolean)=>void;
  contactsClientId:number|null; contactsClientName:string|null;
  loadRows:()=>Promise<void>;
  rows: ClientsOverviewItem[];
  preselect?: number | null; setPreselect:(v:number|null)=>void;
}) {
  return (
    <>
      {createOpen && (
        <CreateClientModal onClose={()=>setCreateOpen(false)} onCreated={async ()=>{ await loadRows(); setCreateOpen(false); }} />
      )}
      {engageOpen && (
        <CreateEngagementModal rows={rows} preselect={preselect} onClose={()=>{ setEngageOpen(false); setPreselect(null); }} onCreated={async ()=>{ await loadRows(); setEngageOpen(false); setPreselect(null); }} />
      )}
      {tagManagerOpen && (
        <TagManagerModal onClose={()=>setTagManagerOpen(false)} onSaved={async ()=>{ await loadRows(); setTagManagerOpen(false); }} />
      )}
      {contactsOpen && contactsClientId != null && (
        <ManageContactsModal
          clientId={contactsClientId}
          clientName={contactsClientName || ''}
          onClose={() => setContactsOpen(false)}
        />
      )}
    </>
  );
}

// Primary Contact cell with copy-email and LinkedIn controls
function PrimaryContactCell({ name, email, clientId, onOpenContacts }:{ name?: string | null; email?: string | null; clientId: number; onOpenContacts:(clientId:number)=>void }) {
  const [loading, setLoading] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState<string | null>(null);

  const copy = async () => { if (!email) return; try { await navigator.clipboard.writeText(String(email)); toast.success('Copied'); } catch { toast.error('Copy failed'); } };
  const openContacts = () => onOpenContacts(clientId);

  const fetchLinkedIn = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const api = await import('../services/api.ts');
      // find this contact by email within the client
      const contactsRes = await api.listClientContacts(1, 200, Number(clientId));
      const contacts = (contactsRes && (contactsRes.data ?? contactsRes)) || [];
      const found = contacts.find((c: any) => String(c.email || '').toLowerCase() === String(email).toLowerCase());
      if (!found) { setLoading(false); return; }
      const profilesRes = await api.listContactSocialProfiles(1, 50, Number(found.contact_id));
      const profiles = (profilesRes && (profilesRes.data ?? profilesRes)) || [];
      const li = profiles.find((p: any) => String(p.provider || '').toLowerCase() === 'linkedin' || String(p.profile_url || '').includes('linkedin.com'));
      if (li && li.profile_url) setLinkedinUrl(String(li.profile_url));
    } catch {}
    finally { setLoading(false); }
  };

  if (!name) {
    return (
      <div className="flex items-center gap-2">
        <span className="opacity-60">—</span>
        <button className="icon-btn-sm" title="Add contact" onClick={openContacts} aria-label="Add contact">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <Avatar name={name} />
        <span className="truncate" title={name || ''}>{name}</span>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {email && (
          <button className="icon-btn-sm" title="Copy email" onClick={copy} aria-label="Copy email">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </button>
        )}
        {linkedinUrl ? (
          <a className="icon-btn-sm" href={linkedinUrl} target="_blank" rel="noreferrer" title="Open LinkedIn" aria-label="Open LinkedIn">
            {/* LinkedIn icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM0 8.98h5V24H0V8.98zM7.5 8.98h4.78v2.05h.07c.66-1.25 2.27-2.56 4.68-2.56 5.01 0 5.93 3.3 5.93 7.59V24h-5v-6.7c0-1.6-.03-3.65-2.23-3.65-2.23 0-2.57 1.74-2.57 3.54V24h-5V8.98z"/></svg>
          </a>
        ) : (
          <button className="icon-btn-sm" onClick={fetchLinkedIn} title="Find LinkedIn" aria-label="Find LinkedIn" disabled={loading}>
            {loading ? (
              // small spinner
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM0 8.98h5V24H0V8.98zM7.5 8.98h4.78v2.05h.07c.66-1.25 2.27-2.56 4.68-2.56 5.01 0 5.93 3.3 5.93 7.59V24h-5v-6.7c0-1.6-.03-3.65-2.23-3.65-2.23 0-2.57 1.74-2.57 3.54V24h-5V8.98z"/></svg>
            )}
          </button>
        )}
        <button className="icon-btn-sm" title="Manage contacts" onClick={openContacts} aria-label="Manage contacts">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </button>
      </div>
    </div>
  );
}

// Manage Contacts modal (minimal)
function ManageContactsModal({ clientId, clientName, onClose }:{ clientId:number; clientName:string; onClose:()=>void }) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const api = await import('../services/api.ts');
      const res = await api.listClientContacts(1, 200, Number(clientId));
      const body = (res && (res.data ?? res)) || [];
      setContacts(Array.isArray(body) ? body : []);
    } catch (e:any) { setErr(e?.message || 'Failed to load contacts'); }
    finally { setLoading(false); }
  };
  React.useEffect(()=>{ load(); }, [clientId]);

  const add = async () => {
    if (!email.trim() && !first.trim() && !last.trim()) return;
    setSaving(true);
    setErr(null);
    try {
      const api = await import('../services/api.ts');
      await api.createClientContact({ client_id: Number(clientId), first_name: first || null, last_name: last || null, email: email || null, phone: phone || null, is_primary: false });
      setFirst(''); setLast(''); setEmail(''); setPhone('');
      await load();
      toast.success('Contact added');
    } catch (e:any) { setErr(e?.message || 'Add failed'); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open onOpenChange={(o)=>{ if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader title={`Contacts — ${clientName || 'Client'}`} />
        {err && <div className="text-sm text-red-500 px-6 pt-3">{err}</div>}
        <DialogBody>
          {loading ? (
            <div className="text-sm text-[var(--text-2)]">Loading…</div>
          ) : (
            <div className="space-y-4">
              <div>
                {contacts.length === 0 ? (
                  <div className="text-sm text-[var(--text-2)]">No contacts yet.</div>
                ) : (
                  <ul className="space-y-2">
                    {contacts.map((c:any) => (
                      <li key={c.contact_id} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar name={`${c.first_name || ''} ${c.last_name || ''}`.trim() || c.email} />
                          <div className="min-w-0">
                            <div className="font-semibold truncate">{`${c.first_name || ''} ${c.last_name || ''}`.trim() || '—'}</div>
                            <div className="text-xs opacity-70 truncate">{c.email || ''}</div>
                          </div>
                        </div>
                        <div className="text-xs opacity-60">{c.phone || ''}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="First" value={first} onChange={(e)=>setFirst(e.target.value)} />
                <Input placeholder="Last" value={last} onChange={(e)=>setLast(e.target.value)} />
                <Input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} className="col-span-2" />
                <Input placeholder="Phone" value={phone} onChange={(e)=>setPhone(e.target.value)} className="col-span-2" />
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={onClose}>Close</Button>
            <Button variant="primary" onClick={add} disabled={saving}>{saving ? 'Saving…' : 'Add contact'}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
    <Dialog open onOpenChange={(o)=>{ if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader title="New Client" />
        {err && <div className="text-sm text-red-500 px-6 pt-3">{err}</div>}
        <DialogBody>
          <div className="space-y-4">
...existing code...
          </div>
          <div className="mt-1">
            <h3 className="section-title">Client</h3>
            <div id="client-section-desc" className="section-subtle mt-0.5">Basic client information.</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">
            <div>
              <label className="field-label block">Company name <span className="text-red-400">*</span></label>
              <input aria-describedby="client-name-desc" value={name} onChange={e=>setName(e.target.value)} className="input mt-1 w-full" placeholder="Company name" />
              <div id="client-name-desc" className="field-help mt-1">Official client name.</div>
            </div>

            <div>
              <label className="field-label block">Status</label>
              <div role="radiogroup" aria-labelledby="client-status-desc" className="mt-1 inline-flex items-center rounded-full bg-[var(--surface-3)] p-1">
                <button type="button" role="radio" aria-checked={isActive} onClick={()=>setIsActive(true)} aria-pressed={isActive} className={`rounded-full px-4 py-2 leading-none transition ${isActive ? 'bg-emerald-600 text-white' : 'bg-transparent border border-white/10 text-zinc-400 hover:text-white'}`}>Active</button>
                <button type="button" role="radio" aria-checked={!isActive} onClick={()=>setIsActive(false)} aria-pressed={!isActive} className={`ml-2 rounded-full px-4 py-2 leading-none transition ${!isActive ? 'bg-emerald-600 text-white' : 'bg-transparent border border-white/10 text-zinc-400 hover:text-white'}`}>Prospect</button>
              </div>
              <div id="client-status-desc" className="field-help mt-1">Optional status for the client.</div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="section-title">Primary Contact</h3>
            <div id="primary-contact-desc" className="section-subtle mt-0.5">Optional — useful for auto-communications.</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">
            <div>
              <label className="field-label block">First name</label>
              <input aria-describedby="first-name-desc" value={first} onChange={e=>setFirst(e.target.value)} className="input mt-1 w-full" />
              <div id="first-name-desc" className="field-help mt-1">Given name.</div>
            </div>
            <div>
              <label className="field-label block">Last name</label>
              <input aria-describedby="last-name-desc" value={last} onChange={e=>setLast(e.target.value)} className="input mt-1 w-full" />
              <div id="last-name-desc" className="field-help mt-1">Family name.</div>
            </div>
            <div>
              <label className="field-label block">Email</label>
              <input aria-describedby="email-desc" value={email} onChange={e=>setEmail(e.target.value)} className="input mt-1 w-full" placeholder="name@company.com" />
              <div id="email-desc" className="field-help mt-1">Optional — used for notifications.</div>
            </div>
            <div>
              <label className="field-label block">Phone</label>
              <input aria-describedby="phone-desc" value={phone} onChange={e=>setPhone(e.target.value)} className="input mt-1 w-full" placeholder="Optional" />
              <div id="phone-desc" className="field-help mt-1">Optional — useful for quick contact.</div>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <div className="flex items-center justify-between gap-3">
            <div>
              <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
            </div>
            <div>
              <Button variant="primary" onClick={submit} disabled={saving || !name.trim()}>{saving ? 'Saving…' : 'Create'}</Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// CreateEngagementModal: compact modal implementing requested UX improvements
function CreateEngagementModal({ onClose, onCreated, rows, preselect }:{ onClose:()=>void; onCreated:()=>void; rows: ClientsOverviewItem[]; preselect?: number | null }) {
  const [clientId, setClientId] = useState<number | ''>(preselect ?? '');
  const [clientQuery, setClientQuery] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [name, setName] = useState('');
  const [status, setStatus] = useState('active');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  // tag suggestion state
  const [suggesting, setSuggesting] = useState(false);
  const [tagSuggestErr, setTagSuggestErr] = useState<string | null>(null);
  const [suggestionsTags, setSuggestionsTags] = useState<{ existing: { tag_id?: number; tag_name: string; reason?: string }[]; new: { tag_name: string; reason?: string }[]; rationale?: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string|null>(null);
  const [pendingTags, setPendingTags] = useState<{ tag_id?: number; tag_name: string }[]>([]);
  const [appliedTags, setAppliedTags] = useState<{ tag_id?: number; tag_name: string }[]>([]);
  const notesMax = 1000;
  const notesRef = React.useRef<HTMLTextAreaElement | null>(null);
  const autoResizeNotes = React.useCallback(() => {
    if (!notesRef.current) return;
    const el = notesRef.current;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 400) + 'px';
  }, []);
  const clientInputRef = React.useRef<HTMLInputElement | null>(null);
  const clientBoxRef = React.useRef<HTMLDivElement | null>(null);
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

  // close dropdown when clicking outside
  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!clientBoxRef.current) return;
      const el = clientBoxRef.current as HTMLElement;
      if (!el.contains(e.target as Node)) {
        setShowClientDropdown(false);
      }
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

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
      const payload: any = { client_id: Number(clientId), name: name.trim(), status, start_utc, notes: notes || null };
      if (startDate && endDate) payload.end_utc = new Date(endDate + 'T00:00:00Z').toISOString();
      // Debug: log payload so we can inspect what's being sent when server returns 'Required'
      // eslint-disable-next-line no-console
      console.debug('[engagement] create payload:', JSON.stringify(payload));
      let engagement: any = null;
      try {
        engagement = await createEngagement(payload);
      } catch (e:any) {
        // log full error object to console for diagnosis
        // eslint-disable-next-line no-console
        console.debug('[engagement] create error:', e, e?.response || e?.data || null);
        throw e;
      }
      // After engagement is created, persist pending tags (create tag if needed, then map)
      if (pendingTags && pendingTags.length > 0) {
        const api = await import('../services/api.ts');
        const appliedNow: { tag_id?: number; tag_name: string }[] = [];
        for (const t of pendingTags) {
          try {
            if (t.tag_id) {
              await api.createClientTagMap(Number(clientId), Number(t.tag_id));
              appliedNow.push({ tag_id: t.tag_id, tag_name: t.tag_name });
            } else {
              // create tag then map
              const created = await api.createClientTag({ tag_name: t.tag_name });
              const anyCreated: any = created;
              const tagId = anyCreated && (anyCreated.tag_id || anyCreated.data?.tag_id || anyCreated.tagId);
              if (tagId) {
                await api.createClientTagMap(Number(clientId), Number(tagId));
                appliedNow.push({ tag_id: Number(tagId), tag_name: t.tag_name });
              } else {
                // fallback: try apply helper
                try { await api.applyTagToClient(Number(clientId), t.tag_name); appliedNow.push({ tag_name: t.tag_name }); } catch {}
              }
            }
          } catch (e:any) {
            // non-blocking: continue with other tags
            console.debug('tag map error', e && (e.message || e));
          }
        }
        if (appliedNow.length > 0) {
          setAppliedTags(s => [...s, ...appliedNow]);
          setPendingTags([]);
        }
      }
      await onCreated();
      onClose();
    } catch (e:any) {
      setErr(formatServerError(e));
    } finally { setSaving(false); }
  };

  const runTagSuggest = async () => {
    setTagSuggestErr(null);
    setSuggestionsTags(null);
    if (!notes.trim()) { setTagSuggestErr('Enter some notes to analyze'); return; }
    try {
      setSuggesting(true);
      // call API helper
      // import suggestTags from services/api.ts at top
      // lazy require to keep top-of-file imports unchanged pattern
      const api = await import('../services/api.ts');
  // Pass client_id only when available so suggestions still work from free-text notes
  const payload: any = { note: notes, maxExisting: 5, maxNew: 2 };
  if (clientId) payload.client_id = Number(clientId);
  console.debug('[tag-suggest] payload:', payload);
  const r = await api.suggestTags(payload);
  // api.suggestTags now returns an ApiEnvelope<TagSuggestResponse>
  const body = (r && (r.data ?? r)) || { existing: [], new: [], rationale: undefined };
  console.debug('[tag-suggest] response:', body);

  // If backend returns only very generic tags, supplement with local keyword heuristics
  const genericTags = new Set(['security', 'compliance', 'general', 'other', 'misc']);
  const existingNames = (body.existing || []).map(t => String(t.tag_name).toLowerCase());
  const newNames = (body.new || []).map(t => String(t.tag_name).toLowerCase());
  const allReturned = new Set([...existingNames, ...newNames]);
  let supplementedNew = body.new || [];
  const shouldSupplement = (
    (body.existing || []).length > 0 && (body.existing || []).every(t => genericTags.has(String(t.tag_name).toLowerCase()))
  );
  if (shouldSupplement) {
    // extract keywords from notes (reuse local fallback logic)
    const stop = new Set(['the','and','for','with','a','an','to','of','in','on','is','are','this','that','it','we','you','as','be','by','from','or','not','but','if','was','were','has','have','needs','help','client','process','processes','processs']);
    const words = notes.split(/[^\w']+/).map(w => w.trim().toLowerCase()).filter(Boolean);
    const counts: Record<string, number> = {};
    for (const w of words) {
      if (w.length <= 2) continue;
      if (stop.has(w)) continue;
      counts[w] = (counts[w] || 0) + 1;
    }
    const picked = Object.keys(counts).sort((a,b) => (counts[b] - counts[a])).slice(0, 5);
    const extras = picked.filter(p => !allReturned.has(p)).slice(0, 3).map(s => ({ tag_name: s, reason: 'Local keyword suggestion' }));
    if (extras.length > 0) {
      supplementedNew = [...supplementedNew, ...extras];
    }
  }

  // If we added local suggestions, deprioritize/remove generic existing tags so UX surfaces more specific suggestions
  let filteredExisting = body.existing || [];
  let augmentedRationale = body.rationale || '';
  if (supplementedNew.length > 0) {
    filteredExisting = (body.existing || []).filter(t => !genericTags.has(String(t.tag_name).toLowerCase()));
    if (filteredExisting.length === 0) {
      augmentedRationale = (augmentedRationale ? augmentedRationale + ' ' : '') + 'Replaced generic tags with local keyword suggestions.';
    } else {
      augmentedRationale = (augmentedRationale ? augmentedRationale + ' ' : '') + 'Supplemented with local keyword suggestions.';
    }
  }

  setSuggestionsTags({ existing: filteredExisting, new: supplementedNew || [], rationale: augmentedRationale });
    } catch (e:any) {
      console.debug('tag suggest error', e);
      const msg = formatServerError(e) || 'Tag suggestion failed';
      const emsg = String(e?.message || '').toLowerCase();
      const isNetwork = emsg.includes('failed to fetch') || emsg.includes('connect') || emsg.includes('refused') || emsg.includes('network');
      if (isNetwork && notes && notes.trim()) {
        // local heuristic fallback: pick frequent non-stop words as suggestions
        const stop = new Set(['the','and','for','with','a','an','to','of','in','on','is','are','this','that','it','we','you','as','be','by','from','or','not','but','or','if','was','were','has','have']);
        const words = notes.split(/[^\w']+/).map(w => w.trim().toLowerCase()).filter(Boolean);
        const counts: Record<string, number> = {};
        for (const w of words) {
          if (w.length <= 2) continue;
          if (stop.has(w)) continue;
          counts[w] = (counts[w] || 0) + 1;
        }
        const picked = Object.keys(counts).sort((a,b) => (counts[b] - counts[a])).slice(0, 5);
        const newSuggestions = picked.slice(0,2).map(s => ({ tag_name: s, reason: 'Local fallback suggestion' }));
        setSuggestionsTags({ existing: [], new: newSuggestions, rationale: 'Local fallback (backend unreachable)' });
        setTagSuggestErr('Using local fallback suggestions (backend unreachable)');
      } else {
        setTagSuggestErr(msg);
      }
    } finally { setSuggesting(false); }
  };

  // Instead of immediately persisting, add suggestion to pendingTags to be saved after engagement creation
  const createAndApply = async (tagName: string, tagId?: number) => {
    // optimistic: add to pendingTags list (include tag_id when available)
    setPendingTags(s => [...s, tagId ? { tag_id: tagId, tag_name: tagName } : { tag_name: tagName }]);
    setSuggestionsTags(null);
    toast.success(`Will apply tag '${tagName}' after engagement is created`);
  };

  // Apply an existing suggestion immediately to the selected client (if any)
  const applyExistingNow = async (t: { tag_id?: number; tag_name: string }) => {
    setTagSuggestErr(null);
    if (!clientId) return setTagSuggestErr('Select a client first');
    try {
      setSaving(true);
      const api = await import('../services/api.ts');
      if (t.tag_id) {
  await api.createClientTagMap(Number(clientId), Number(t.tag_id));
  setAppliedTags(s => [...s, { tag_id: t.tag_id, tag_name: t.tag_name }]);
      } else {
        // helper will create tag if needed then map
  await api.applyTagToClient(Number(clientId), t.tag_name);
  setAppliedTags(s => [...s, { tag_name: t.tag_name }]);
      }
      toast.success(`Applied tag '${t.tag_name}' to client`);
      // remove applied tag from current suggestions
      setSuggestionsTags(prev => prev ? ({ ...prev, existing: (prev.existing || []).filter(x => x.tag_name !== t.tag_name) }) : prev);
    } catch (e:any) {
      setTagSuggestErr(e?.message || 'Failed to apply tag');
    } finally { setSaving(false); }
  };

  // Create a new tag and apply it immediately when a client is selected
  const createAndApplyNow = async (tagName: string) => {
    setTagSuggestErr(null);
    if (!clientId) return setTagSuggestErr('Select a client first');
    try {
      setSaving(true);
      const api = await import('../services/api.ts');
      let created: any = null;
      try { created = await api.createClientTag({ tag_name: tagName }); } catch (e:any) { created = null; }
      const tagId = created && (created.tag_id || created.data?.tag_id || created.tagId);
      if (tagId) {
  await api.createClientTagMap(Number(clientId), Number(tagId));
  setAppliedTags(s => [...s, { tag_id: Number(tagId), tag_name: tagName }]);
      } else {
  await api.applyTagToClient(Number(clientId), tagName);
  setAppliedTags(s => [...s, { tag_name: tagName }]);
      }
      toast.success(`Created and applied tag '${tagName}'`);
      setSuggestionsTags(prev => prev ? ({ ...prev, new: (prev.new || []).filter(x => x.tag_name !== tagName) }) : prev);
    } catch (e:any) {
      setTagSuggestErr(e?.message || 'Failed to create/apply tag');
    } finally { setSaving(false); }
  };

  const [quickTag, setQuickTag] = useState('');
  const createAndApplyQuick = async () => {
    setTagSuggestErr(null);
    if (!quickTag.trim()) return setTagSuggestErr('Enter a tag name');
    try {
      setSaving(true);
      const api = await import('../services/api.ts');
      // create global tag first (backend may allow create+apply but do explicit create for consistency)
      let created;
      try { created = await api.createClientTag({ tag_name: quickTag.trim() }); } catch (e:any) {
        // if creation fails because tag exists, ignore and continue to apply
        created = null;
      }
  // add to pendingTags to be applied after engagement is created
  // include tag_id when the create returned an id
  const anyCreated: any = created;
  const tagId = anyCreated && (anyCreated.tag_id || anyCreated.data?.tag_id || anyCreated.tagId);
  setPendingTags(s => [...s, tagId ? { tag_id: Number(tagId), tag_name: quickTag.trim() } : { tag_name: quickTag.trim() }]);
  toast.success(`Will apply tag '${quickTag.trim()}' after engagement is created`);
  setQuickTag('');
    } catch (e:any) {
      setTagSuggestErr(e?.message || 'Failed to create/apply tag');
    } finally { setSaving(false); }
  };

  return (
    <Dialog open onOpenChange={(o)=>{ if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader title="New Engagement" />
        {err && <div className="text-sm text-red-500 px-6 pt-3">{err}</div>}
        <DialogBody>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
...existing code...
          </div>
          <div>
            <label className="field-label">Client <span className="text-red-400">*</span></label>
            <div ref={clientBoxRef} className="relative mt-1">
              <input ref={clientInputRef} aria-label="Search client" placeholder="Type to search..." value={clientQuery} onChange={e=>{ setClientQuery(e.target.value); setClientId(''); setShowClientDropdown(Boolean(e.target.value)); }} className="input w-full" />
          {showClientDropdown && clientQuery && (searching || suggestions.length > 0) && (
                <ul className="absolute z-40 mt-1 w-full bg-[#0b0f12] border border-white/6 rounded max-h-44 overflow-auto">
                  {searching && <li className="px-3 py-2 text-sm text-[var(--text-2)]">Searching…</li>}
                  {!searching && suggestions.length === 0 && <li className="px-3 py-2 text-sm text-[var(--text-2)]">No matches</li>}
                  {!searching && suggestions.map(s => (
                    <li key={s.client_id}><button className="w-full text-left px-3 py-2 hover:bg-white/5" onClick={()=>{ setClientId(Number(s.client_id)); setClientQuery(String(s.client_name)); setSuggestions([]); setSearching(false); setShowClientDropdown(false); clientInputRef.current && clientInputRef.current.blur(); // update applied tags from rows if available
                      const sel = rows.find(r => Number(r.client_id) === Number(s.client_id));
                      if (sel) {
                        const tags = (sel.tags || '')
                          .split(',')
                          .map(t => t.trim())
                          .filter(Boolean)
                          .map(t => ({ tag_name: t }));
                        setAppliedTags(tags);
                      }
                    }}>{s.client_name} ({s.client_id})</button></li>
                  ))}
                </ul>
              )}
            </div>
            <div className="field-help mt-1">Search and pick the client for this engagement.</div>
          </div>

          <div>
            <label className="field-label">Engagement name <span className="text-red-400">*</span></label>
            <input placeholder="e.g., 'AP Process Audit'" value={name} onChange={e=>setName(e.target.value)} className="input mt-1 w-full" />
            <div className="field-help mt-1">Short descriptive title for the engagement.</div>
          </div>

          <div>
            <label className="field-label">Status</label>
            <select className="select mt-1 w-full" value={status} onChange={e=>setStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="prospect">Prospect</option>
            </select>
          </div>

          <div>
            <label className="field-label">Start date</label>
            <div className="mt-1 flex items-center gap-2">
              <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="input flex-1" />
              <button type="button" className="px-3 py-2 rounded bg-[var(--surface-3)]" aria-label="Open date picker">📅</button>
            </div>
            <div className="field-help mt-1">Optional start date for the engagement.</div>
          </div>

          <div>
            <label className="field-label">End date</label>
            <div className="mt-1 flex items-center gap-2">
              <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="input flex-1" disabled={!startDate} />
              <button type="button" className="px-3 py-2 rounded bg-[var(--surface-3)]" aria-label="Open date picker" disabled={!startDate}>📅</button>
            </div>
            <div className="field-help mt-1">Optional end date — only enabled after selecting a start date.</div>
          </div>

          <div className="md:col-span-2">
            <label className="field-label">Notes</label>
            <textarea ref={notesRef} rows={4} value={notes} onChange={e=>{ setNotes(e.target.value); autoResizeNotes(); }} onInput={autoResizeNotes} className="textarea mt-1 w-full" maxLength={notesMax} />
            <div className="flex items-center justify-between field-help mt-1"><span>Optional notes</span><span>{notes.length}/{notesMax}</span></div>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                title={!notes.trim() ? 'Enter notes to analyze' : 'Suggest tags from notes'}
                className={`px-3 py-1 rounded text-sm ${suggesting ? 'bg-yellow-600' : ( !notes.trim() ? 'bg-zinc-700 opacity-60 cursor-not-allowed' : 'bg-[var(--surface-3)]' )}`}
                onClick={runTagSuggest}
                disabled={suggesting || !notes.trim()}
              >{suggesting ? 'Analyzing…' : 'Suggest tags'}</button>
              <div className="field-help">Analyze notes to suggest existing or new tags.</div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input value={quickTag} onChange={e=>setQuickTag(e.target.value)} placeholder="Quick add tag" className="input flex-1 py-1" />
              <button className="px-3 py-1 rounded bg-[var(--surface-3)] text-sm" onClick={createAndApplyQuick} disabled={!quickTag.trim() || !clientId || saving}>Add + Apply</button>
            </div>
            {tagSuggestErr && <div className="text-xs text-red-400 mt-2">{tagSuggestErr}</div>}
            {/* Applied tags */}
            {appliedTags.length > 0 && (
              <div className="mt-3">
                <div className="field-help">Applied tags</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {appliedTags.map(t => (
                    <div key={t.tag_name} className={badgeBase + ' bg-[var(--surface-4)] text-[var(--text-2)] flex items-center gap-2'}>
                      <span>{t.tag_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Pending tags (will be applied after engagement creation) */}
            {pendingTags.length > 0 && (
              <div className="mt-3">
                <div className="field-help">Pending tags (will apply after create)</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {pendingTags.map((t, i) => (
                    <div key={`${t.tag_name}-${i}`} className={badgeBase + ' bg-transparent text-[var(--text-2)] border border-dashed border-white/10 flex items-center gap-2 pr-2'}>
                      <span>{t.tag_name}</span>
                      <button className="text-xs px-1" onClick={() => { setPendingTags(s => s.filter((_, idx) => idx !== i)); }}>x</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {suggestionsTags && (
              <div className="mt-3 space-y-2">
                {suggestionsTags.rationale && (
                  <div className="field-help italic mb-2">Analysis: {suggestionsTags.rationale}</div>
                )}
                <div className="field-help">Existing suggestions</div>
                <div className="flex flex-wrap gap-2">
                  {suggestionsTags.existing.length === 0 && <div className="text-xs text-[var(--text-2)]">No existing tag suggestions</div>}
                  {suggestionsTags.existing.map(t => (
                    <div key={t.tag_name} className="flex items-center gap-2">
                      <button title={t.reason} className={badgeBase + ' bg-indigo-600 text-white'} onClick={() => createAndApply(t.tag_name, t.tag_id)}>{t.tag_name}</button>
                      {clientId && (
                        <button className="px-2 py-1 rounded bg-[var(--surface-3)] text-sm" onClick={() => applyExistingNow(t)}>Apply now</button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="field-help">New suggestions</div>
                <div className="flex flex-wrap gap-2">
                  {suggestionsTags.new.length === 0 && <div className="field-help">No new tag suggestions</div>}
                  {suggestionsTags.new.map(t => (
                    <div key={t.tag_name} className="flex items-center gap-2">
                      <span title={t.reason} className={badgeBase + ' bg-transparent text-[var(--text-2)] border border-dashed border-white/10'}>{t.tag_name}</span>
                      <button className="px-2 py-1 rounded bg-[var(--surface-3)] text-sm" onClick={() => createAndApply(t.tag_name)}>{clientId ? 'Create + Apply (deferred)' : 'Create + Apply'}</button>
                      {clientId && (
                        <button className="px-2 py-1 rounded bg-[var(--surface-3)] text-sm" onClick={() => createAndApplyNow(t.tag_name)}>Create + Apply now</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          <div className="flex items-center justify-between gap-3">
            <div>
              <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
            </div>
            <div>
              <Button variant="primary" onClick={submit} disabled={saving || !clientId || !name.trim()}>{saving ? 'Saving…' : 'Create'}</Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Small badge that fetches contact social profiles on demand and shows LinkedIn if available
function ContactActions({ name, email }: { name?: string | null; email?: string | null }) {
  const [loading, setLoading] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState<string | null>(null);
  const mailTo = () => { if (!email) return; window.location.href = `mailto:${email}`; };
  const copy = async () => { if (!email) return; try { await navigator.clipboard.writeText(String(email)); toast.success('Copied'); } catch { toast.error('Copy failed'); } };
  const fetchLI = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const api = await import('../services/api.ts');
      const contactsRes = await api.listClientContacts(1, 200);
      const contacts = (contactsRes && (contactsRes.data ?? contactsRes)) || [];
      const found = contacts.find((c: any) => String(c.email || '').toLowerCase() === String(email).toLowerCase());
      if (!found) { setLoading(false); return; }
      const profilesRes = await api.listContactSocialProfiles(1, 50, Number(found.contact_id));
      const profiles = (profilesRes && (profilesRes.data ?? profilesRes)) || [];
      const li = profiles.find((p: any) => String(p.provider).toLowerCase() === 'linkedin' || String(p.profile_url || '').includes('linkedin.com'));
      if (li && li.profile_url) setLinkedinUrl(li.profile_url as string);
    } catch {} finally { setLoading(false); }
  };

  return (
    <div className="flex items-center gap-2">
      {email && (
        <>
          <button className="chip" onClick={mailTo}>Email</button>
          <button className="chip" onClick={copy}>Copy</button>
        </>
      )}
      {linkedinUrl ? (
        <a className="chip" href={linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>
      ) : (
        <button className="chip" onClick={fetchLI} disabled={loading}>{loading ? 'Checking…' : 'Find LinkedIn'}</button>
      )}
    </div>
  );
}

// TagManagerModal: manages global client tags and allows quick-create/apply
function TagManagerModal({ onClose, onSaved }:{ onClose:()=>void; onSaved:()=>void }) {
  const [tags, setTags] = useState<{ tag_id: number; tag_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string|null>(null);
  const [newTag, setNewTag] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const api = await import('../services/api.ts');
      const res = await api.listClientTags(1, 200);
      const body = (res && (res.data ?? res)) || [];
      setTags(body || []);
    } catch (e:any) {
      setErr(e?.message || 'Failed to load tags');
    } finally { setLoading(false); }
  };

  React.useEffect(()=>{ load(); }, []);

  const createTag = async () => {
    if (!newTag.trim()) return;
    try {
      const api = await import('../services/api.ts');
      const created = await api.createClientTag({ tag_name: newTag.trim() });
      setTags(s => [created, ...s]);
      setNewTag('');
      toast.success('Tag created');
    } catch (e:any) { setErr(e?.message || 'Create failed'); }
  };

  const saveEdit = async (id: number) => {
    if (!editingName.trim()) return;
    try {
      const api = await import('../services/api.ts');
      const updated = await api.updateClientTag(id, { tag_name: editingName.trim() });
      setTags(s => s.map(t => t.tag_id === id ? updated : t));
      setEditingId(null);
      setEditingName('');
      toast.success('Tag updated');
    } catch (e:any) { setErr(e?.message || 'Update failed'); }
  };

  const doDelete = async (id: number) => {
    try {
      const api = await import('../services/api.ts');
      await api.deleteClientTag(id);
      setTags(s => s.filter(t => t.tag_id !== id));
      toast.success('Tag deleted');
    } catch (e:any) { setErr(e?.message || 'Delete failed'); }
  };

  return (
    <Dialog open onOpenChange={(o)=>{ if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader title="Manage Tags" />
        {err && <div className="text-sm text-red-500 px-6 pt-3">{err}</div>}
        <DialogBody>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input value={newTag} onChange={e=>setNewTag(e.target.value)} className="input flex-1" placeholder="New tag name" />
              <Button variant="subtle" onClick={createTag}>Add</Button>
            </div>
            <div className="max-h-72 overflow-auto">
              {loading && <div className="text-sm text-[var(--text-2)]">Loading…</div>}
              {!loading && tags.length === 0 && <div className="text-sm text-[var(--text-2)]">No tags</div>}
              {!loading && tags.map(t => (
                <div key={t.tag_id} className="flex items-center justify-between gap-2 py-1">
                  {editingId === t.tag_id ? (
                    <>
                      <input value={editingName} onChange={e=>setEditingName(e.target.value)} className="input flex-1 py-1" />
                      <div className="flex gap-2">
                        <Button size="sm" variant="subtle" onClick={()=>saveEdit(t.tag_id)}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={()=>{ setEditingId(null); setEditingName(''); }}>Cancel</Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={badgeBase + ' bg-[var(--surface-4)] text-[var(--text-2)] flex-1'}>{t.tag_name}</div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="subtle" onClick={()=>{ setEditingId(t.tag_id); setEditingName(t.tag_name); }}>Edit</Button>
                        <Button size="sm" variant="ghost" onClick={()=>doDelete(t.tag_id)}>Delete</Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <div className="flex items-center justify-end">
            <Button variant="primary" onClick={onSaved}>Done</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ManageContactsModal: list + quick add contacts for a client
function ManageContactsModal({ clientId, clientName, onClose }:{ clientId:number; clientName:string; onClose:()=>void }) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string|null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const api = await import('../services/api.ts');
      const res = await api.listClientContacts(1, 200, Number(clientId));
      const body = (res && (res.data ?? res)) || [];
      setRows(body || []);
    } catch (e:any) { setErr(e?.message || 'Failed to load contacts'); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ load(); }, [clientId]);

  const add = async () => {
    if (!first.trim() && !last.trim() && !email.trim()) { toast.error('Enter a name or email'); return; }
    try {
      setSaving(true);
      const api = await import('../services/api.ts');
      await api.createClientContact({ client_id: Number(clientId), first_name: first || null, last_name: last || null, email: email || null, phone: phone || null, is_primary: rows.length === 0 });
      setFirst(''); setLast(''); setEmail(''); setPhone('');
      await load();
      toast.success('Contact added');
    } catch (e:any) { setErr(e?.message || 'Create failed'); } finally { setSaving(false); }
  };

  const copy = async (text?: string|null) => { if (!text) return; try { await navigator.clipboard.writeText(String(text)); toast.success('Copied'); } catch { toast.error('Copy failed'); } };

  return (
    <Dialog open onOpenChange={(o)=>{ if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader title={`Contacts — ${clientName || 'Client'}`} />
        {err && <div className="text-sm text-red-500 px-6 pt-3">{err}</div>}
        <DialogBody>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wide text-[var(--text-2)]">Contacts</div>
              {loading ? (
                <div className="text-sm text-[var(--text-2)]">Loading…</div>
              ) : rows.length === 0 ? (
                <div className="text-sm text-[var(--text-2)]">No contacts yet.</div>
              ) : (
                <div className="divide-y divide-[var(--border-subtle)] rounded-lg border border-[var(--border-subtle)]">
                  {rows.map((c:any) => (
                    <div key={c.contact_id} className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={`${c.first_name || ''} ${c.last_name || ''}`.trim()} />
                        <div className="min-w-0">
                          <div className="font-medium truncate">{`${c.first_name || ''} ${c.last_name || ''}`.trim() || c.email || '—'}</div>
                          <div className="text-xs text-[var(--text-2)] truncate">{c.email || ''}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {c.email && (
                          <button className="icon-btn-sm" title="Copy email" onClick={()=>copy(c.email)} aria-label="Copy email">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wide text-[var(--text-2)]">Add Contact</div>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="First name" value={first} onChange={e=>setFirst(e.target.value)} />
                <Input placeholder="Last name" value={last} onChange={e=>setLast(e.target.value)} />
                <Input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="col-span-2" />
                <Input placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} className="col-span-2" />
              </div>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={onClose}>Close</Button>
            <Button variant="primary" onClick={add} disabled={saving}>{saving ? 'Saving…' : 'Add contact'}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
