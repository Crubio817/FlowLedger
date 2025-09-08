import React, { useState } from 'react';
import { Button } from '../ui/button.tsx';
import { Input } from '../ui/input.tsx';
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter } from '../ui/dialog.tsx';
import { Badge } from '../ui/badge.tsx';
import { User, Building2, Mail, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { 
  enrichContact, 
  createEnrichmentJob, 
  type ClientContact, 
  type EnrichmentRequest 
} from '../services/api.ts';
import { toast } from '../lib/toast.ts';

interface EnrichmentModalProps {
  open: boolean;
  clientId: number;
  contacts: ClientContact[];
  onClose: () => void;
  onSuccess: () => void;
}

export function EnrichmentModal({ open, clientId, contacts, onClose, onSuccess }: EnrichmentModalProps) {
  const [selectedContact, setSelectedContact] = useState<ClientContact | null>(null);
  const [manualData, setManualData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    company: '',
    domain: ''
  });
  const [mode, setMode] = useState<'contact' | 'manual'>('contact');
  const [provider, setProvider] = useState('FullEnrich');
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let enrichmentData: EnrichmentRequest;
    let contactName: string;
    let contactEmail: string | undefined;
    
    if (mode === 'contact' && selectedContact) {
      enrichmentData = {
        first_name: selectedContact.first_name || '',
        last_name: selectedContact.last_name || '',
        email: selectedContact.email || '',
        company: '', // Will be enriched
        domain: '' // Will be enriched
      };
      contactName = `${selectedContact.first_name || ''} ${selectedContact.last_name || ''}`.trim() || selectedContact.email || 'Unknown';
      contactEmail = selectedContact.email || undefined;
    } else {
      enrichmentData = manualData;
      contactName = `${manualData.first_name} ${manualData.last_name}`.trim() || manualData.email || 'Unknown';
      contactEmail = manualData.email;
    }

    if (!enrichmentData.first_name && !enrichmentData.last_name && !enrichmentData.email) {
      toast.error?.('Please provide at least a name or email address');
      return;
    }

    try {
      setProcessing(true);
      
      // Start enrichment via MCP
      const mcpResult = await enrichContact(enrichmentData);
      
      // Create local job record
      await createEnrichmentJob({
        job_id: mcpResult.job_id,
        client_id: clientId,
        contact_id: selectedContact?.contact_id,
        status: 'PENDING',
        provider: provider,
        contact_name: contactName,
        contact_email: contactEmail,
        company: enrichmentData.company,
        domain: enrichmentData.domain,
        created_date: new Date().toISOString()
      });

      toast.success?.('Enrichment job started successfully');
      onSuccess();
    } catch (error: any) {
      console.error('Enrichment failed:', error);
      toast.error?.(error.message || 'Failed to start enrichment');
    } finally {
      setProcessing(false);
    }
  };

  const handleContactSelect = (contact: ClientContact) => {
    setSelectedContact(contact);
    setMode('contact');
  };

  if (!open) return null;

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader title="New Contact Enrichment" />
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <div className="space-y-6">
              {/* Mode Selection */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setMode('contact')}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    mode === 'contact' 
                      ? 'border-cyan-500 bg-cyan-500/10' 
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <User className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <div className="text-sm font-medium text-white">Select Contact</div>
                  <div className="text-xs text-zinc-400">Choose from existing contacts</div>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('manual')}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    mode === 'manual' 
                      ? 'border-cyan-500 bg-cyan-500/10' 
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <Mail className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <div className="text-sm font-medium text-white">Manual Entry</div>
                  <div className="text-xs text-zinc-400">Enter contact details manually</div>
                </button>
              </div>

              {/* Contact Selection */}
              {mode === 'contact' && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-zinc-300">
                    Select Contact to Enrich
                  </label>
                  <div className="max-h-64 overflow-y-auto space-y-2 border border-zinc-700 rounded-lg p-4">
                    {contacts.length === 0 ? (
                      <div className="text-center py-8">
                        <User className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                        <p className="text-zinc-400">No contacts found</p>
                        <p className="text-xs text-zinc-500">Switch to manual entry</p>
                      </div>
                    ) : (
                      contacts.map((contact) => (
                        <div
                          key={contact.contact_id}
                          onClick={() => handleContactSelect(contact)}
                          className={`p-3 rounded-lg cursor-pointer transition-all ${
                            selectedContact?.contact_id === contact.contact_id
                              ? 'bg-cyan-500/20 border border-cyan-500/50'
                              : 'bg-zinc-800/50 hover:bg-zinc-800/70 border border-zinc-700/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-white">
                                {`${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Unnamed Contact'}
                              </div>
                              {contact.email && (
                                <div className="text-sm text-zinc-400">{contact.email}</div>
                              )}
                              {contact.title && (
                                <div className="text-xs text-zinc-500">{contact.title}</div>
                              )}
                            </div>
                            {contact.is_primary && (
                              <Badge variant="success" className="text-xs">Primary</Badge>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Manual Entry */}
              {mode === 'manual' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        First Name
                      </label>
                      <Input
                        value={manualData.first_name}
                        onChange={(e) => setManualData(prev => ({ ...prev, first_name: e.target.value }))}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Last Name
                      </label>
                      <Input
                        value={manualData.last_name}
                        onChange={(e) => setManualData(prev => ({ ...prev, last_name: e.target.value }))}
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={manualData.email}
                      onChange={(e) => setManualData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Company
                      </label>
                      <Input
                        value={manualData.company}
                        onChange={(e) => setManualData(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Acme Corp"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Domain
                      </label>
                      <Input
                        value={manualData.domain}
                        onChange={(e) => setManualData(prev => ({ ...prev, domain: e.target.value }))}
                        placeholder="acme.com"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Provider Selection */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Enrichment Provider
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="FullEnrich">FullEnrich</option>
                  <option value="Clay">Clay</option>
                  <option value="Apollo">Apollo</option>
                  <option value="ZoomInfo">ZoomInfo</option>
                </select>
                <p className="text-xs text-zinc-500 mt-1">
                  Different providers offer varying data quality and coverage
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Zap className="text-blue-400 mt-0.5" size={16} />
                  <div>
                    <h4 className="text-sm font-medium text-blue-300">About Contact Enrichment</h4>
                    <p className="text-xs text-blue-200/80 mt-1">
                      This will enhance the contact with additional information like phone numbers, 
                      social profiles, company details, and more from external data sources.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={onClose} disabled={processing}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                disabled={processing || (mode === 'contact' && !selectedContact) || (mode === 'manual' && !manualData.first_name && !manualData.last_name && !manualData.email)}
                className="gap-2"
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    Start Enrichment
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
