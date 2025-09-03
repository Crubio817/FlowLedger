import React, { useEffect, useMemo, useState } from 'react';
import Modal from './Modal.tsx';
import { Button } from '../ui/button.tsx';
import { Input } from '../ui/input.tsx';
import { Chip } from '../ui/chip.tsx';
import { Badge } from '../ui/badge.tsx';
import { Avatar } from '../ui/avatar.tsx';
// dropdown.tsx provides DropdownMenu primitives; we use native <select> here for simplicity
import { api as gen } from '../api/generated/client.ts';
import { createClient } from '../services/api.ts';
import { toast } from '../lib/toast.ts';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: (res: any) => void;
};

let tempIdCounter = -1;

export default function CreateClientModal({ open, onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [selectedPackId, setSelectedPackId] = useState<number | null>(null);
  const [selectedPackCode, setSelectedPackCode] = useState<string | null>(null);
  const [packs, setPacks] = useState<any[]>([]);

  const [industries, setIndustries] = useState<any[]>([]);
  const [selectedIndustryId, setSelectedIndustryId] = useState<number | null>(null);
  const [creatingIndustry, setCreatingIndustry] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [ownerUserId, setOwnerUserId] = useState<number | null>(null);
  const [contacts, setContacts] = useState<Array<any>>([]);
  const [notes, setNotes] = useState<Array<{ note: string }>>([]);
  const [locations, setLocations] = useState<Array<any>>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [newIndustryName, setNewIndustryName] = useState('');
  const [newIndustryDescription, setNewIndustryDescription] = useState('');
  const [industryError, setIndustryError] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);

  const InlineSpinner: React.FC<{ className?: string }> = ({ className = '' }) => (
    <svg className={"animate-spin inline-block " + className} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.2" />
      <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await gen.listTaskPacks({ page: 1, page_size: 200 } as any);
        setPacks((res && (res.data || [])) || []);
      } catch (e: any) {
        // ignore
      }

      try {
        const r2 = await gen.listIndustries({ page: 1, page_size: 200 } as any);
        setIndustries((r2 && (r2.data || [])) || []);
      } catch (e: any) {
        // ignore
      }
    })();
  }, [open]);

  async function handleCreateIndustry() {
    if (!newIndustryName) return setIndustryError('Industry name required');
    setCreatingIndustry(true);
    setIndustryError(null);
    try {
      // Must post exactly { name, description, is_active: true }
      const body = { name: newIndustryName, description: newIndustryDescription, is_active: true } as any;
      const created = await gen.createIndustry(body as any);

      const createdId = created && (created.data?.industry_id);
      if (createdId) {
        const item = created.data;
        setIndustries(prev => [item, ...prev]);
        setSelectedIndustryId(Number(createdId));
        setNewIndustryName('');
        setNewIndustryDescription('');
        toast?.success?.('Industry created');
      } else {
        // poll
        const attempts = [200, 450, 900];
        let found: any = null;
        for (const delay of attempts) {
          // eslint-disable-next-line no-await-in-loop
          await new Promise(r => setTimeout(r, delay));
          // eslint-disable-next-line no-await-in-loop
          const list = await gen.listIndustries({ page: 1, page_size: 200 } as any);
          const f = (list && (list.data || [])).find((x: any) => String(x.name).trim().toLowerCase() === String(newIndustryName).trim().toLowerCase());
          if (f && f.industry_id) { found = f; break; }
        }
        if (found) {
          setIndustries(prev => [found, ...prev]);
          setSelectedIndustryId(found.industry_id);
          setNewIndustryName('');
          setNewIndustryDescription('');
          toast?.success?.('Industry created');
        } else {
          const temp = { industry_id: tempIdCounter, name: newIndustryName, description: newIndustryDescription, is_active: true };
          tempIdCounter -= 1;
          setIndustries(prev => [temp, ...prev]);
          setSelectedIndustryId(temp.industry_id);
          setNewIndustryName('');
          setNewIndustryDescription('');
          toast?.success?.('Industry created (optimistic)');
        }
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to create industry';
      setIndustryError(msg);
      toast.error?.(msg);
    } finally {
      setCreatingIndustry(false);
    }
  }

  async function handleSubmit() {
    if (!name) {
      setClientError('Client name required');
      return;
    }
    setClientError(null);
    setSubmitting(true);
    try {
      // compute packArg preservation: prefer selectedPackId (number) else selectedPackCode (string)
      const packArg = selectedPackId ?? (selectedPackCode ?? null);

      const extras: Record<string, any> = {};
      if (contacts.length) extras.client_contacts = contacts.map((c: any, idx: number) => ({
        ...c,
        is_primary: !!c.is_primary,
        is_active: c.is_active === undefined ? true : !!c.is_active,
        contact_index: idx,
      }));
      if (notes.length) extras.notes = notes.map(n => ({ note: n.note }));
      if (locations.length) extras.locations = locations;
      if (selectedIndustryId) extras.client_industries = [{ industry_id: selectedIndustryId, is_primary: false }];
      if (ownerUserId !== null) extras.OwnerUserId = ownerUserId;
      extras.IsActive = isActive;

      if (tags.length) extras.client_tags = tags.filter(Boolean).map(t => ({ tag_name: t }));

      const contactSocialProfiles: any[] = [];
      (contacts || []).forEach((c: any, idx: number) => {
        (c.social_profiles || []).forEach((sp: any) => {
          contactSocialProfiles.push({
            contact_index: idx,
            provider: sp.provider,
            profile_url: sp.profile_url,
            is_primary: !!sp.is_primary,
          });
        });
      });
      if (contactSocialProfiles.length) extras.contact_social_profiles = contactSocialProfiles;

      const res = await createClient(name, isActive, null, packArg as any, extras);
      const createdClientId = res && (res.data?.client?.client_id || res.data?.client_id || res.client_id);

      // reconcile optimistic industry id mapping if needed
      if (createdClientId && selectedIndustryId && selectedIndustryId < 0) {
        const tempItem = industries.find(i => i.industry_id === selectedIndustryId) as any;
        if (tempItem) {
          const attempts = [300, 600, 1200];
          let found: any = null;
          for (const d of attempts) {
            // eslint-disable-next-line no-await-in-loop
            await new Promise(r => setTimeout(r, d));
            // eslint-disable-next-line no-await-in-loop
            const list = await gen.listIndustries({ page: 1, page_size: 200 } as any);
            const f = (list && (list.data || [])).find((x: any) => String(x.name).trim().toLowerCase() === String(tempItem.name).trim().toLowerCase());
            if (f && f.industry_id) { found = f; break; }
          }
          if (found) {
            try {
              await gen.addClientIndustry(Number(createdClientId), { industry_id: Number(found.industry_id), is_primary: false } as any);
            } catch (e: any) {
              // ignore mapping failure
            }
          }
        }
      } else if (createdClientId && selectedIndustryId && selectedIndustryId > 0) {
        try {
          await gen.addClientIndustry(Number(createdClientId), { industry_id: Number(selectedIndustryId), is_primary: false } as any);
        } catch (e: any) {
          // ignore mapping failure
        }
      }

      toast.success?.('Client created');
      onCreated?.(res);
      onClose();
    } catch (err: any) {
      const msg = err?.message || 'Create client failed';
      setClientError(msg);
      toast.error?.(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <Modal title="Create a new client" onClose={onClose} className="max-w-[900px]">
      <div className="grid grid-cols-3 gap-6">
        {/* Left column - main form */}
        <div className="col-span-2 space-y-4">
          <div>
            <label className="field-label">Company name <span className="text-red-500">*</span></label>
            <Input value={name} onChange={(e: any) => setName(e.target.value)} aria-invalid={!!clientError} />
            <div className="text-xs text-[var(--text-2)] mt-1">Official client name.</div>
            {clientError && <div className="text-sm text-red-500 mt-1">{clientError}</div>}
          </div>

          <div className="flex items-center gap-4">
            <div>
              <div className="text-xs field-label">Status</div>
              <div className="flex gap-2 mt-2">
                <button type="button" className={`px-4 py-2 rounded-full ${isActive ? 'bg-[var(--accent-active)] text-white' : 'bg-white/5'}`} onClick={() => setIsActive(true)}>Active</button>
                <button type="button" className={`px-4 py-2 rounded-full ${!isActive ? 'bg-white/5' : ''}`} onClick={() => setIsActive(false)}>Prospect</button>
              </div>
              <div className="text-xs text-[var(--text-2)] mt-1">Active = billable; Prospect = non-billable. (Last used saved)</div>
            </div>

            <div className="flex-1">
              <label className="field-label">Task pack</label>
              <select value={selectedPackId ?? (selectedPackCode ?? '')} onChange={(e: any) => {
                const v = e.target.value; const n = Number(v);
                if (!Number.isNaN(n) && v !== '') { setSelectedPackId(n); setSelectedPackCode(null); } else if (v === '') { setSelectedPackId(null); setSelectedPackCode(null); } else { setSelectedPackCode(String(v)); setSelectedPackId(null); }
              }} className="input w-full">
                <option value="">— No packs available —</option>
                {packs.map(p => <option key={String(p.pack_id ?? p.pack_code)} value={p.pack_id ?? p.pack_code}>{p.pack_name || p.pack_code || `#${p.pack_id}`}</option>)}
              </select>
              <div className="text-xs text-[var(--text-2)] mt-1">Optionally select a task pack to apply during client setup.</div>
            </div>
          </div>

          <div>
            <label className="field-label">Website</label>
            <Input placeholder="Optional — company website" value={(tags && tags.length && tags[0]) || ''} onChange={() => { }} />
            <div className="text-xs text-[var(--text-2)] mt-1">Enter a website to auto-suggest name, logo and email domain.</div>
          </div>

          <div>
            <a href="#" onClick={(e) => { e.preventDefault(); /* focus primary contact area */ }} className="text-sm underline">Add primary contact</a>
            <div className="text-xs text-[var(--text-2)] mt-1">Add a primary contact for quick communications.</div>
          </div>

          {/* contacts/notes/tags area (collapsed by default) */}
          <div>
            <div className="text-xs uppercase tracking-wide text-[var(--text-2)] mb-2">Additional details</div>
            <div className="space-y-3">
              {/* contacts list simplified */}
              {contacts.length > 0 && (
                <div>
                  <div className="text-sm font-medium">Contacts</div>
                  <div className="mt-2 space-y-2">
                    {contacts.map((c: any, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <Avatar name={`${c.first_name || ''} ${c.last_name || ''}`.trim() || c.email} />
                        <div className="min-w-0">
                          <div className="font-medium truncate">{`${c.first_name || ''} ${c.last_name || ''}`.trim() || '—'}</div>
                          <div className="text-xs opacity-70 truncate">{c.email || ''}</div>
                        </div>
                        {c.is_primary && <Badge variant="success">Primary</Badge>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* notes */}
              {notes.length > 0 && (
                <div>
                  <div className="text-sm font-medium">Notes</div>
                  <div className="mt-2 text-sm text-[var(--text-2)]">{notes.map(n => n.note).join(' — ')}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column - preview card */}
        <div className="col-span-1">
          <div className="p-4 rounded-md border border-white/10 bg-[var(--surface-2)]">
            <div className="flex items-start gap-3">
              <Avatar name={name || 'V'} />
              <div className="flex-1">
                <div className="font-semibold">{name || 'Company preview'}</div>
                <div className="text-sm text-[var(--text-2)]">Website</div>
                <div className="mt-2"><Badge variant={isActive ? 'success' : 'muted'}>{isActive ? 'Active' : 'Prospect'}</Badge></div>
                <div className="text-sm text-[var(--text-2)] mt-3">Pack: {selectedPackId ?? selectedPackCode ?? 'DEFAULT'}</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Industry</div>
                <button className="text-sm text-[var(--text-2)]">Cancel</button>
              </div>
              <div className="mt-2">
                <select value={selectedIndustryId ?? ''} onChange={(e: any) => setSelectedIndustryId(e.target.value ? Number(e.target.value) : null)} className="input w-full">
                  <option value="">— No industries —</option>
                  {industries.map((it: any) => <option key={String(it.industry_id)} value={it.industry_id}>{it.name}</option>)}
                </select>
              </div>

              <div className="mt-3">
                <Input placeholder="Industry name" value={newIndustryName} onChange={(e: any) => setNewIndustryName(e.target.value)} />
                <Input placeholder="Description (optional)" className="mt-2" value={newIndustryDescription} onChange={(e: any) => setNewIndustryDescription(e.target.value)} />
                <div className="mt-2 flex gap-2">
                  <Button onClick={handleCreateIndustry} disabled={creatingIndustry || submitting || !newIndustryName}>{creatingIndustry ? <><InlineSpinner className="h-4 w-4 mr-2" />Creating…</> : 'Create industry'}</Button>
                  <Button variant="subtle" onClick={() => { setNewIndustryName(''); setNewIndustryDescription(''); }}>Cancel</Button>
                </div>
              </div>

              <div className="text-sm text-[var(--text-2)] mt-4">Industry: — No industry —</div>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-footer mt-6 flex justify-between items-center">
        <div>
          <Button className="btn-cancel" onClick={onClose} disabled={submitting || creatingIndustry}>Cancel</Button>
        </div>
        <div>
          <Button className="btn-create" onClick={handleSubmit} disabled={submitting || !name}>
            {submitting ? <><InlineSpinner className="h-4 w-4 mr-2" />Creating…</> : 'Create & continue setup'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
