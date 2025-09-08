import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building, 
  Link, 
  Upload, 
  User, 
  Mail, 
  Phone,
  Globe,
  Briefcase,
  Plus,
  Check,
  ChevronDown,
  Sparkles,
  Search,
  AlertCircle,
  Image,
  Zap,
  Users,
  ArrowRight,
  Loader2,
  Trash2,
  FileText,
  MapPin
} from 'lucide-react';
import { extractClientFromUrl, createClient, createClientProc } from '../services/api.ts';
import { toast } from '../lib/toast.ts';
import { api as gen } from '../api/generated/client.ts';

interface CreateClientModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (res: any) => void;
}

interface Contact {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  is_primary: boolean;
}

export default function CreateClientModal({ open, onClose, onCreated }: CreateClientModalProps) {
  const [activeTab, setActiveTab] = useState('active');
  const [companyUrl, setCompanyUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState(false);
  const [storedExtractedData, setStoredExtractedData] = useState<any>(null);
  const [showIndustryInput, setShowIndustryInput] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [selectedPackCode, setSelectedPackCode] = useState('');
  const [selectedPackId, setSelectedPackId] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  
  // Form states
  const [clientName, setClientName] = useState('');
  const [selectedIndustryId, setSelectedIndustryId] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([
    { first_name: '', last_name: '', email: '', phone: '', is_primary: true }
  ]);
  const [notes, setNotes] = useState<Array<{ note: string }>>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [engagementTags, setEngagementTags] = useState<any[]>([]);

  // Industries data
  const [industriesData, setIndustriesData] = useState<any[]>([]);
  const [isLoadingIndustries, setIsLoadingIndustries] = useState(false);
  const [newIndustryName, setNewIndustryName] = useState('');
  const [isCreatingIndustry, setIsCreatingIndustry] = useState(false);

  // Task packs data
  const [taskPacksData, setTaskPacksData] = useState<any[]>([]);
  const [isLoadingTaskPacks, setIsLoadingTaskPacks] = useState(false);

  // Load industries and task packs on mount
  useEffect(() => {
    const loadData = async () => {
      if (!open) return;
      
      // Load industries
      setIsLoadingIndustries(true);
      try {
        const response = await gen.listIndustries({ page: 1, page_size: 200 } as any);
        if (response.data) {
          setIndustriesData(response.data);
        }
      } catch (error) {
        console.error('Failed to load industries:', error);
        toast.error('Failed to load industries');
      } finally {
        setIsLoadingIndustries(false);
      }

      // Load task packs
      setIsLoadingTaskPacks(true);
      try {
        const response = await gen.listTaskPacks({ page: 1, page_size: 200 } as any);
        if (response.data) {
          setTaskPacksData(response.data);
        }
      } catch (error) {
        console.error('Failed to load task packs:', error);
        // Don't show error toast for task packs as they're optional
      } finally {
        setIsLoadingTaskPacks(false);
      }
    };

    loadData();
  }, [open]);

  const handleCreateIndustry = async () => {
    if (!newIndustryName.trim()) {
      toast.error('Industry name is required');
      return;
    }

    setIsCreatingIndustry(true);
    try {
      const body = { 
        name: newIndustryName.trim(), 
        description: '', 
        is_active: true 
      };
      const created = await gen.createIndustry(body as any);
      
      if (created?.data?.industry_id) {
        // Add to local list
        const newIndustry = {
          industry_id: created.data.industry_id,
          industry_name: newIndustryName.trim(),
          is_active: true
        };
        setIndustriesData(prev => [newIndustry, ...prev]);
        setSelectedIndustryId(String(created.data.industry_id));
        setNewIndustryName('');
        setShowIndustryInput(false);
        toast.success('Industry created successfully!');
      }
    } catch (error: any) {
      console.error('Failed to create industry:', error);
      toast.error(error.message || 'Failed to create industry');
    } finally {
      setIsCreatingIndustry(false);
    }
  };

  const handleExtractData = async () => {
    if (!companyUrl.trim()) {
      toast.error('Please enter a company URL');
      return;
    }

    setIsExtracting(true);
    try {
      const extracted = await extractClientFromUrl(companyUrl);
      const data = extracted?.data || extracted;
      if (data) {
        // Store the extracted data for later use
        setStoredExtractedData(data);
        
        setClientName(data.client_name || data.name || '');
        setLogoUrl(data.logo_url || '');
        
        // Handle contacts
        if (data.contacts && data.contacts.length > 0) {
          setContacts(data.contacts.map((c: any, idx: number) => ({
            first_name: c.first_name || '',
            last_name: c.last_name || '',
            email: c.email || '',
            phone: c.phone || '',
            is_primary: idx === 0
          })));
        } else if (data.contact) {
          // Handle single contact object
          setContacts([{
            first_name: data.contact.first_name || '',
            last_name: data.contact.last_name || '',
            email: data.contact.email || '',
            phone: data.contact.phone || '',
            is_primary: true
          }]);
        }
        
        // Handle notes - map both notes field and client_note object
        const notesArray: Array<{ note: string }> = [];
        if (data.notes) {
          notesArray.push({ note: data.notes });
        }
        if (data.client_note && data.client_note.content) {
          notesArray.push({ note: data.client_note.content });
        }
        if (notesArray.length > 0) {
          setNotes(notesArray);
        }
        
        // Handle location
        if (data.location) {
          setLocations([{
            address_1: data.location.address_1 || data.location.address || '',
            city: data.location.city || '',
            state: data.location.state || data.location.province || '',
            postal_code: data.location.postal_code || data.location.zip || '',
            country: data.location.country || ''
          }]);
        }
        
        setExtractedData(true);
        toast.success('Company data extracted successfully!');
      }
    } catch (error: any) {
      console.error('URL extraction failed:', error);
      toast.error(error.message || 'Failed to extract company data');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim()) {
      toast.error('Company name is required');
      return;
    }

    try {
      let result;
      
      if (companyUrl && extractedData && storedExtractedData) {
        // Use stored procedure path for extracted data
        const createBody: any = {};
        
        // Required field - use exact API field name
        const finalName = clientName?.trim() || storedExtractedData.name?.trim() || storedExtractedData.client_name?.trim();
        if (!finalName) {
          toast.error('Company name is required');
          return;
        }
        createBody.Name = finalName;  // API expects "Name" not "name"
        
        // Optional basic fields - use exact API field names
        if (isActive !== undefined) createBody.IsActive = isActive;
        if (selectedPackCode) createBody.PackCode = selectedPackCode;
        if (selectedPackId) createBody.PackCode = String(selectedPackId);
        if (logoUrl) createBody.LogoUrl = logoUrl;
        
        // Include all additional fields for comprehensive client creation
        // Always include contacts from the form if any have data
        const validContacts = contacts.filter(c => c.first_name || c.last_name || c.email);
        if (validContacts.length > 0) {
          createBody.contacts = validContacts.map((c: any) => ({
            first_name: c.first_name || '',
            last_name: c.last_name || '',
            email: c.email || '',
            phone: c.phone || '',
            is_primary: !!c.is_primary,
            is_active: c.is_active === undefined ? true : !!c.is_active
          }));
        }
        
        if (notes.length && notes.some(n => n.note?.trim())) {
          createBody.notes = notes
            .filter(n => n.note?.trim())
            .map(n => ({
              title: 'Note',
              content: n.note.trim(),
              note_type: 'general',
              is_important: false,
              is_active: true
            }));
        }
        
        if (locations.length && locations.some(l => l.address_1 || l.city || l.state)) {
          createBody.locations = locations
            .filter(l => l.address_1 || l.city || l.state)
            .map((l: any, idx: number) => ({
              label: `Location ${idx + 1}`,
              line1: l.address_1 || '',
              city: l.city || '',
              state_province: l.state || '',
              postal_code: l.postal_code || '',
              country: l.country || '',
              is_primary: idx === 0
            }));
        }
        
        if (selectedIndustryId) {
          createBody.client_industries = [{ 
            industry_id: parseInt(selectedIndustryId), 
            is_primary: true 
          }];
        }
        
        // Handle contact social profiles (if extracted data has them)
        if (storedExtractedData.contact_social_profiles && storedExtractedData.contact_social_profiles.length > 0) {
          createBody.contact_social_profiles = storedExtractedData.contact_social_profiles.map((sp: any) => ({
            contact_email: sp.contact_email || (validContacts[0]?.email),
            provider: sp.provider,
            profile_url: sp.profile_url,
            is_primary: !!sp.is_primary,
          }));
        }

        // Debug: Log the request body
        console.log('CreateProcBody being sent:', JSON.stringify(createBody, null, 2));

        result = await createClientProc(createBody);
      } else {
        // Use traditional path for manual entry
        const extras: any = {};
        if (logoUrl) extras.logo_url = logoUrl;
        if (selectedIndustryId) extras.industry_id = selectedIndustryId;
        if (contacts.filter(c => c.first_name || c.last_name || c.email).length) {
          extras.contacts = contacts.filter(c => c.first_name || c.last_name || c.email);
        }

        result = await createClient(clientName, isActive, null, selectedPackCode || selectedPackId || null, extras);
      }

      toast.success('Client created successfully!');
      onCreated?.(result);
      onClose();
      
      // Reset form
      setClientName('');
      setCompanyUrl('');
      setLogoUrl('');
      setExtractedData(false);
      setStoredExtractedData(null);
      setContacts([{ first_name: '', last_name: '', email: '', phone: '', is_primary: true }]);
      setSelectedIndustryId('');
      setIsActive(true);
      setSelectedPackCode('');
      setSelectedPackId('');
      setNotes([]);
      setLocations([]);
      setDocuments([]);
      setIntegrations([]);
      setEngagementTags([]);
      setNewIndustryName('');
      setShowIndustryInput(false);
      
    } catch (error: any) {
      console.error('Failed to create client:', error);
      toast.error(error.message || 'Failed to create client');
    }
  };

  const addContact = () => {
    setContacts([...contacts, { first_name: '', last_name: '', email: '', phone: '', is_primary: false }]);
  };

  const updateContact = (index: number, field: keyof Contact, value: string | boolean) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    
    // If setting as primary, unset all others
    if (field === 'is_primary' && value === true) {
      updated.forEach((contact, i) => {
        if (i !== index) contact.is_primary = false;
      });
    }
    
    setContacts(updated);
  };

  const removeContact = (index: number) => {
    if (contacts.length <= 1) return;
    const updated = contacts.filter((_, i) => i !== index);
    // Ensure at least one contact is primary
    if (!updated.some(c => c.is_primary) && updated.length > 0) {
      updated[0].is_primary = true;
    }
    setContacts(updated);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-zinc-800 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                <Building className="text-cyan-400" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Create a new client</h2>
                <p className="text-sm text-zinc-400 mt-0.5">Add company details and primary contact</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="text-zinc-400 hover:text-white" size={20} />
            </button>
          </div>

          {/* Progress indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-800">
            <div className="h-full w-1/3 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Smart Extract Section */}
            <div className="p-6 border-b border-zinc-800 bg-gradient-to-b from-zinc-900/50 to-transparent">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="text-amber-400" size={16} />
                <span className="text-sm font-medium text-zinc-300">Quick Setup</span>
                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-xs rounded-full">AI Powered</span>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={companyUrl}
                    onChange={(e) => setCompanyUrl(e.target.value)}
                    placeholder="Paste company URL (LinkedIn, website, etc.)"
                    className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:bg-zinc-900 transition-all pr-10"
                  />
                  <Globe className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                </div>
                <button
                  type="button"
                  onClick={handleExtractData}
                  disabled={!companyUrl || isExtracting}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Extract Data
                    </>
                  )}
                </button>
              </div>
              
              {extractedData && (
                <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
                  <Check className="text-emerald-400" size={16} />
                  <span className="text-sm text-emerald-400">Company data extracted successfully!</span>
                </div>
              )}
            </div>

            <div className="p-6 grid grid-cols-2 gap-6">
              {/* Left Column - Company Details */}
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
                    <Building size={16} />
                    Company Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1.5">
                        Company name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Enter company name"
                        className="w-full px-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:bg-zinc-900 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-zinc-400 mb-1.5">
                        Logo URL <span className="text-xs text-zinc-600">(Optional)</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={logoUrl}
                          onChange={(e) => setLogoUrl(e.target.value)}
                          placeholder="Company logo URL"
                          className="flex-1 px-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:bg-zinc-900 transition-all"
                        />
                        {logoUrl && (
                          <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center overflow-hidden">
                            <img 
                              src={logoUrl} 
                              alt="Logo preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-zinc-400 mb-1.5">
                        Industry <span className="text-xs text-zinc-600">(Optional)</span>
                      </label>
                      <div className="relative">
                        <select
                          value={selectedIndustryId}
                          onChange={(e) => setSelectedIndustryId(e.target.value)}
                          className="w-full px-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 focus:bg-zinc-900 transition-all appearance-none cursor-pointer"
                          disabled={isLoadingIndustries}
                        >
                          <option value="">Select industry</option>
                          {industriesData.map((industry) => (
                            <option key={industry.industry_id} value={industry.industry_id}>
                              {industry.industry_name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={18} />
                      </div>
                      
                      {!showIndustryInput ? (
                        <button 
                          type="button"
                          onClick={() => setShowIndustryInput(true)}
                          className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                        >
                          <Plus size={14} />
                          Create new industry
                        </button>
                      ) : (
                        <div className="mt-3 p-3 bg-zinc-900/30 border border-zinc-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-zinc-300 font-medium">New Industry</span>
                            <button
                              type="button"
                              onClick={() => {
                                setShowIndustryInput(false);
                                setNewIndustryName('');
                              }}
                              className="text-zinc-500 hover:text-zinc-300 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newIndustryName}
                              onChange={(e) => setNewIndustryName(e.target.value)}
                              placeholder="Industry name"
                              className="flex-1 px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 text-sm"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleCreateIndustry();
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={handleCreateIndustry}
                              disabled={!newIndustryName.trim() || isCreatingIndustry}
                              className="px-3 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded transition-colors flex items-center gap-1"
                            >
                              {isCreatingIndustry ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Check size={14} />
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm text-zinc-400 mb-1.5">Status</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsActive(true)}
                          className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                            isActive 
                              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                              : 'bg-zinc-900/50 text-zinc-400 border border-zinc-800 hover:bg-zinc-800'
                          }`}
                        >
                          Active
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsActive(false)}
                          className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                            !isActive 
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                              : 'bg-zinc-900/50 text-zinc-400 border border-zinc-800 hover:bg-zinc-800'
                          }`}
                        >
                          Prospect
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-zinc-500">
                        {isActive ? 'Billable client (Last used saved)' : 'Non-billable prospect account'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm text-zinc-400 mb-1.5">Task Pack</label>
                      <div className="relative">
                        <select 
                          value={selectedPackCode}
                          onChange={(e) => setSelectedPackCode(e.target.value)}
                          className="w-full px-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 focus:bg-zinc-900 transition-all appearance-none cursor-pointer"
                          disabled={isLoadingTaskPacks}
                        >
                          <option value="">
                            {isLoadingTaskPacks ? 'Loading...' : taskPacksData.length === 0 ? 'No packs available' : 'Select a task pack'}
                          </option>
                          {taskPacksData.map((pack) => (
                            <option key={pack.pack_id || pack.id} value={pack.pack_code || pack.code}>
                              {pack.pack_name || pack.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={18} />
                      </div>
                      <p className="mt-1 text-xs text-zinc-500">Optionally select a task pack to apply during setup</p>
                    </div>
                  </div>
                </div>

                {/* Notes Section - Moved to left column */}
                <div>
                  <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
                    <FileText size={16} />
                    Notes
                  </h3>
                  
                  <div className="space-y-3">
                    {notes.map((note, index) => (
                      <div key={index} className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-zinc-400">Note {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = notes.filter((_, i) => i !== index);
                              setNotes(updated);
                            }}
                            className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <textarea
                          value={note.note}
                          onChange={(e) => {
                            const updated = [...notes];
                            updated[index] = { note: e.target.value };
                            setNotes(updated);
                          }}
                          placeholder="Add a note about this client..."
                          rows={2}
                          className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 text-sm resize-none"
                        />
                      </div>
                    ))}

                    <button 
                      type="button"
                      onClick={() => setNotes([...notes, { note: '' }])}
                      className="w-full px-4 py-2 bg-zinc-900/50 border border-dashed border-zinc-700 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:border-zinc-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      Add a note
                    </button>
                  </div>
                </div>

                {/* Locations Section - Moved to left column */}
                <div>
                  <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
                    <MapPin size={16} />
                    Locations
                  </h3>
                  
                  <div className="space-y-3">
                    {locations.map((location, index) => (
                      <div key={index} className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-zinc-400">Location {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = locations.filter((_, i) => i !== index);
                              setLocations(updated);
                            }}
                            className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={location.address_1 || ''}
                            onChange={(e) => {
                              const updated = [...locations];
                              updated[index] = { ...updated[index], address_1: e.target.value };
                              setLocations(updated);
                            }}
                            placeholder="Street address"
                            className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 text-sm"
                          />
                          
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={location.city || ''}
                              onChange={(e) => {
                                const updated = [...locations];
                                updated[index] = { ...updated[index], city: e.target.value };
                                setLocations(updated);
                              }}
                              placeholder="City"
                              className="px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 text-sm"
                            />
                            <input
                              type="text"
                              value={location.state || ''}
                              onChange={(e) => {
                                const updated = [...locations];
                                updated[index] = { ...updated[index], state: e.target.value };
                                setLocations(updated);
                              }}
                              placeholder="State"
                              className="px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 text-sm"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={location.postal_code || ''}
                              onChange={(e) => {
                                const updated = [...locations];
                                updated[index] = { ...updated[index], postal_code: e.target.value };
                                setLocations(updated);
                              }}
                              placeholder="ZIP/Postal"
                              className="px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 text-sm"
                            />
                            <input
                              type="text"
                              value={location.country || ''}
                              onChange={(e) => {
                                const updated = [...locations];
                                updated[index] = { ...updated[index], country: e.target.value };
                                setLocations(updated);
                              }}
                              placeholder="Country"
                              className="px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button 
                      type="button"
                      onClick={() => setLocations([...locations, {}])}
                      className="w-full px-4 py-2 bg-zinc-900/50 border border-dashed border-zinc-700 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:border-zinc-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      Add a location
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column - Preview & Contacts */}
              <div className="space-y-5">
                {/* Company Preview Card */}
                <div className="p-4 bg-gradient-to-b from-zinc-900/50 to-zinc-900/30 border border-zinc-800 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                      {logoUrl ? (
                        <img 
                          src={logoUrl} 
                          alt="Company logo"
                          className="w-6 h-6 object-cover rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = '<Building size="16" class="text-cyan-400" />';
                          }}
                        />
                      ) : (
                        <Building size={16} className="text-cyan-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white">{clientName || 'Company Preview'}</h4>
                      <p className="text-xs text-zinc-500">{companyUrl ? new URL(companyUrl).hostname : 'Website'}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/50">
                      <span className="text-zinc-500">Status</span>
                      <span className={`px-2 py-0.5 rounded ${isActive ? 'bg-cyan-500/10 text-cyan-400' : 'bg-purple-500/10 text-purple-400'}`}>
                        {isActive ? 'Active' : 'Prospect'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-zinc-500">Pack</span>
                      <span className="text-zinc-300">{selectedPackCode || 'DEFAULT'}</span>
                    </div>
                  </div>
                </div>

                {/* Contacts */}
                <div>
                  <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
                    <Users size={16} />
                    Contacts
                  </h3>
                  
                  <div className="space-y-4">
                    {contacts.map((contact, index) => (
                      <div key={index} className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-400">Contact {index + 1}</span>
                            {contact.is_primary && (
                              <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-xs rounded">Primary</span>
                            )}
                          </div>
                          {contacts.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeContact(index)}
                              className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <input
                            type="text"
                            value={contact.first_name}
                            onChange={(e) => updateContact(index, 'first_name', e.target.value)}
                            placeholder="First name"
                            className="px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 text-sm"
                          />
                          <input
                            type="text"
                            value={contact.last_name}
                            onChange={(e) => updateContact(index, 'last_name', e.target.value)}
                            placeholder="Last name"
                            className="px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 text-sm"
                          />
                        </div>
                        
                        <input
                          type="email"
                          value={contact.email}
                          onChange={(e) => updateContact(index, 'email', e.target.value)}
                          placeholder="Email address"
                          className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 text-sm mb-3"
                        />
                        
                        <input
                          type="tel"
                          value={contact.phone || ''}
                          onChange={(e) => updateContact(index, 'phone', e.target.value)}
                          placeholder="Phone (optional)"
                          className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 text-sm mb-3"
                        />
                        
                        {!contact.is_primary && (
                          <button
                            type="button"
                            onClick={() => updateContact(index, 'is_primary', true)}
                            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            Set as primary contact
                          </button>
                        )}
                      </div>
                    ))}

                    <button 
                      type="button"
                      onClick={addContact}
                      className="w-full px-4 py-2.5 bg-zinc-900/50 border border-dashed border-zinc-700 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:border-zinc-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      Add another contact
                    </button>
                  </div>
                </div>

                {/* Pro tip */}
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex gap-2">
                    <AlertCircle className="text-blue-400 flex-shrink-0" size={16} />
                    <div>
                      <p className="text-xs text-blue-300 font-medium">Pro tip</p>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Add a primary contact for quick communications and better organization.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>          {/* Footer */}
          <div className="border-t border-zinc-800 p-6 bg-zinc-900/30">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              
              <div className="flex items-center gap-3">
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                >
                  Create Client
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
