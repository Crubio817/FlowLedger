// Workstream Module v2.1 - Route Definitions
// React Router configuration for workstream module with Spotlight integration

import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Search, Filter, BarChart3, Target, TrendingUp, Users, X } from 'lucide-react';
import StandardHeader from '../components/StandardHeader.tsx';
import TodayPanel from '../components/TodayPanel.tsx';
import SignalsPage from './workstream-signals.tsx';
import CandidatesPage from './workstream-candidates.tsx';
import PursuitsPage from './workstream-pursuits.tsx';
import SpotlightSandboxPage from './spotlight-sandbox.tsx';
// Spotlight module components
import {
  SpotlightBuilderStepped,
  SpotlightProfilesGallery,
  useSpotlights,
  useDeleteSpotlight,
  useCloneSpotlight,
  useUpdateSpotlight,
} from '../modules/spotlight/index.ts';
import Modal from '../components/Modal.tsx';
import { toast } from 'react-hot-toast';

// ORG_ID for demos (typically would come from app state)
const ORG_ID = 1;

// Main Spotlight Page Component with Gallery and Modals
function SpotlightPage() {
  const [showBuilder, setShowBuilder] = useState(false);
  const [viewingSpotlight, setViewingSpotlight] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<any>(null);
  const [showCloneConfirm, setShowCloneConfirm] = useState<any>(null);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState<any>(null);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState('');

  // Spotlight data and mutations
  const { data: spotlightsResponse, refetch } = useSpotlights({
    org_id: ORG_ID,
    active: true,
    limit: 10,
  });

  const deleteSpotlightMutation = useDeleteSpotlight();
  const cloneSpotlightMutation = useCloneSpotlight();
  const updateSpotlightMutation = useUpdateSpotlight();

  const spotlights = spotlightsResponse?.data || [];

  // Calculate KPI metrics
  const kpiMetrics = {
    totalProfiles: spotlights.length,
    activeProfiles: spotlights.filter(s => s.active).length,
    avgEvaluations: Math.round(spotlights.reduce((acc, s) => acc + (s.field_count || 0), 0) / (spotlights.length || 1)),
    recentActivity: spotlights.filter(s => {
      const updatedDate = new Date(s.updated_at);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return updatedDate > dayAgo;
    }).length
  };

  // Filter spotlights based on search and filters
  const filteredSpotlights = spotlights.filter(spotlight => {
    const matchesSearch = searchQuery === '' || 
      spotlight.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spotlight.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spotlight.domain?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDomain = selectedDomains.length === 0 || selectedDomains.includes(spotlight.domain);
    const matchesStatus = filterStatus === '' || 
      (filterStatus === 'active' && spotlight.active) ||
      (filterStatus === 'inactive' && !spotlight.active);
    
    return matchesSearch && matchesDomain && matchesStatus;
  });

  // Get unique domains for filter dropdown
  const uniqueDomains = [...new Set(spotlights.map(s => s.domain))];

  // KPI Card Component
  const KpiCard = ({ title, value, icon: Icon, trend, color = 'cyan' }: {
    title: string;
    value: string | number;
    icon: any;
    trend?: string;
    color?: string;
  }) => (
    <div className="bg-zinc-800/30 border border-zinc-700/20 rounded-xl p-6 hover:bg-zinc-700/30 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-zinc-400 text-sm font-medium">{title}</p>
          <p className={`text-2xl font-bold mt-2 text-${color}-400`}>{value}</p>
          {trend && (
            <p className="text-zinc-500 text-xs mt-1">{trend}</p>
          )}
        </div>
        <div className={`p-3 bg-${color}-500/10 rounded-lg`}>
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
      </div>
    </div>
  );

  // Modal handlers
  const handleCloseModal = () => {
    setViewingSpotlight(null);
    setShowDeleteConfirm(null);
    setShowCloneConfirm(null);
    setShowDeactivateConfirm(null);
  };

  const handleSpotlightView = (spotlight: any) => {
    setViewingSpotlight(spotlight);
  };

  const handleSpotlightDelete = (spotlight: any) => {
    setShowDeleteConfirm(spotlight);
  };

  const handleSpotlightClone = (spotlight: any) => {
    setShowCloneConfirm(spotlight);
  };

  const handleSpotlightClose = (spotlight: any) => {
    setShowDeactivateConfirm(spotlight);
  };

  // Confirmation handlers with API calls
  const handleConfirmDelete = async () => {
    if (!showDeleteConfirm) return;
    
    try {
      await deleteSpotlightMutation.mutateAsync({
        spotlightId: showDeleteConfirm.spotlight_id,
        orgId: ORG_ID,
      });
      
      toast.success('Spotlight profile deleted successfully');
      refetch();
      handleCloseModal();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete spotlight profile');
    }
  };

  const handleConfirmClone = async () => {
    if (!showCloneConfirm) return;
    
    try {
      await cloneSpotlightMutation.mutateAsync({
        spotlightId: showCloneConfirm.spotlight_id,
        orgId: ORG_ID,
      });
      
      toast.success('Spotlight profile cloned successfully');
      refetch();
      handleCloseModal();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to clone spotlight profile');
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!showDeactivateConfirm) return;
    
    try {
      await updateSpotlightMutation.mutateAsync({
        spotlightId: showDeactivateConfirm.spotlight_id,
        data: {
          org_id: ORG_ID,
          active: false,
        },
      });
      
      toast.success('Spotlight profile deactivated successfully');
      refetch();
      handleCloseModal();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to deactivate spotlight profile');
    }
  };

  return (
    <div className="min-h-screen bg-[#101010] text-white">
      <StandardHeader 
        title="Spotlight Profiles" 
        subtitle="AI-powered Ideal Customer Profile (ICP) management and targeting"
        color="blue"
      />
      
      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => {
              setFilterStatus('');
              setSearchQuery('');
              setSelectedDomains([]);
            }}
            className={`text-left transition-all duration-200 ${
              !filterStatus ? 'ring-2 ring-blue-500/50 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'hover:scale-105'
            }`}
          >
            <KpiCard 
              title="Total Profiles" 
              value={kpiMetrics.totalProfiles}
              icon={Target}
              trend="All spotlight profiles"
              color="blue"
            />
          </button>
          <button
            onClick={() => {
              setFilterStatus('active');
              setSearchQuery('');
              setSelectedDomains([]);
            }}
            className={`text-left transition-all duration-200 ${
              filterStatus === 'active' ? 'ring-2 ring-emerald-500/50 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'hover:scale-105'
            }`}
          >
            <KpiCard 
              title="Active Profiles" 
              value={kpiMetrics.activeProfiles}
              icon={Users}
              trend={`${Math.round((kpiMetrics.activeProfiles / (kpiMetrics.totalProfiles || 1)) * 100)}% active`}
              color="emerald"
            />
          </button>
          <button
            onClick={() => {
              setFilterStatus('inactive');
              setSearchQuery('');
              setSelectedDomains([]);
            }}
            className={`text-left transition-all duration-200 ${
              filterStatus === 'inactive' ? 'ring-2 ring-amber-500/50 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'hover:scale-105'
            }`}
          >
            <KpiCard 
              title="Inactive Profiles" 
              value={kpiMetrics.totalProfiles - kpiMetrics.activeProfiles}
              icon={BarChart3}
              trend={`${Math.round(((kpiMetrics.totalProfiles - kpiMetrics.activeProfiles) / (kpiMetrics.totalProfiles || 1)) * 100)}% inactive`}
              color="amber"
            />
          </button>
          <KpiCard 
            title="Recent Activity" 
            value={kpiMetrics.recentActivity}
            icon={TrendingUp}
            trend="Updated today"
            color="violet"
          />
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search profiles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
                spellCheck="false"
                className="w-full pl-10 pr-4 py-2 bg-zinc-800/40 border border-zinc-700/30 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm"
              />
            </div>

            {/* Multi-Select Domain Filter */}
            <div className="flex flex-col gap-2">
              <select
                onChange={(e) => {
                  const domain = e.target.value;
                  if (domain && !selectedDomains.includes(domain)) {
                    setSelectedDomains([...selectedDomains, domain]);
                  }
                  e.target.value = '';
                }}
                className="px-4 py-2 bg-zinc-800/40 border border-zinc-700/30 rounded-lg text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm min-w-[140px]"
              >
                <option value="">Select Domains</option>
                {uniqueDomains
                  .filter(domain => !selectedDomains.includes(domain))
                  .map(domain => (
                    <option key={domain} value={domain}>{domain}</option>
                  ))}
              </select>
              
              {/* Selected Domain Badges */}
              {selectedDomains.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedDomains.map(domain => (
                    <span
                      key={domain}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/10 text-blue-400 text-sm rounded-lg border border-blue-500/20"
                    >
                      {domain}
                      <button
                        onClick={() => setSelectedDomains(selectedDomains.filter(d => d !== domain))}
                        className="hover:text-blue-300 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Filter indicator */}
            {(searchQuery || selectedDomains.length > 0 || filterStatus) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDomains([]);
                  setFilterStatus('');
                }}
                className="flex items-center gap-2 px-3 py-2 text-zinc-400 hover:text-zinc-200 text-sm transition-colors"
              >
                <Filter className="w-4 h-4" />
                Clear ({filteredSpotlights.length} results)
              </button>
            )}
          </div>
          
          {/* Create New Profile Button */}
          <button
            onClick={() => setShowBuilder(true)}
            className="relative flex items-center gap-2 px-6 py-3 bg-black/40 hover:bg-black/20 text-blue-300 hover:text-white rounded-lg font-medium transition-all duration-300 border-2 border-blue-500 hover:border-blue-400 backdrop-blur-xl overflow-hidden group shadow-[0_0_30px_rgba(59,130,246,0.6),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(59,130,246,0.8),0_0_100px_rgba(59,130,246,0.4),inset_0_1px_0_rgba(255,255,255,0.3)]"
          >
            {/* Inner glass reflection */}
            <div className="absolute inset-[1px] bg-gradient-to-b from-white/20 via-transparent to-transparent rounded-md opacity-60"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-80"></div>
            <span className="relative z-10 drop-shadow-[0_0_4px_rgba(59,130,246,0.8)]">Create New Profile</span>
          </button>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-sm rounded-lg border border-blue-500/20">
            {filteredSpotlights.length} {searchQuery || selectedDomains.length > 0 || filterStatus ? 'Filtered' : 'Profiles'}
          </span>
        </div>

        {/* Spotlight Gallery */}
        <SpotlightProfilesGallery
          spotlights={filteredSpotlights}
          onSpotlightSelect={handleSpotlightView}
          onSpotlightClose={handleSpotlightClose}
          onSpotlightDelete={handleSpotlightDelete}
          onSpotlightClone={handleSpotlightClone}
          className="mt-8"
        />

        {/* Builder Modal */}
        {showBuilder && (
          <Modal onClose={() => setShowBuilder(false)} title="Create Spotlight Profile">
            <div className="max-w-full">
              <div className="mb-4">
                <p className="text-zinc-400 text-sm">Define your ideal customer profile with custom fields and targeting criteria</p>
              </div>
              <SpotlightBuilderStepped
                orgId={ORG_ID}
                onSave={() => {
                  setShowBuilder(false);
                  refetch();
                  toast.success('Spotlight profile created successfully!');
                }}
                onCancel={() => setShowBuilder(false)}
              />
            </div>
          </Modal>
        )}

        {/* View Modal */}
        {viewingSpotlight && (
          <Modal onClose={handleCloseModal} title={`Spotlight: ${viewingSpotlight.name}`}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">Description</h4>
                  <p className="text-zinc-200">{viewingSpotlight.description || 'No description provided'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">Status</h4>
                  <span className={`px-3 py-1 rounded-lg text-sm ${
                    viewingSpotlight.active 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                      : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                  }`}>
                    {viewingSpotlight.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-3 bg-zinc-800/40 hover:bg-zinc-700/40 text-zinc-300 hover:text-white rounded-lg font-medium transition-all duration-300 border border-zinc-600/30 hover:border-zinc-500/50 backdrop-blur-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <Modal onClose={handleCloseModal} title="Delete Spotlight Profile">
            <div className="space-y-4">
              <p className="text-zinc-300">
                Are you sure you want to permanently delete "<strong>{showDeleteConfirm.name}</strong>"? 
                This action cannot be undone and will remove all associated data.
              </p>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-3 bg-zinc-800/40 hover:bg-zinc-700/40 text-zinc-300 hover:text-white rounded-lg font-medium transition-all duration-300 border border-zinc-600/30 hover:border-zinc-500/50 backdrop-blur-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteSpotlightMutation.isPending}
                  className="px-6 py-3 bg-red-800/40 hover:bg-red-700/40 text-red-300 hover:text-white rounded-lg font-medium transition-all duration-300 border border-red-600/30 hover:border-red-500/50 backdrop-blur-sm disabled:opacity-50"
                >
                  {deleteSpotlightMutation.isPending ? 'Deleting...' : 'Delete Forever'}
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Clone Confirmation Modal */}
        {showCloneConfirm && (
          <Modal onClose={handleCloseModal} title="Clone Spotlight Profile">
            <div className="space-y-4">
              <p className="text-zinc-300">
                Create a copy of "<strong>{showCloneConfirm.name}</strong>"? 
                The cloned profile will be created with the suffix "(Copy)" and can be customized separately.
              </p>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-3 bg-zinc-800/40 hover:bg-zinc-700/40 text-zinc-300 hover:text-white rounded-lg font-medium transition-all duration-300 border border-zinc-600/30 hover:border-zinc-500/50 backdrop-blur-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmClone}
                  disabled={cloneSpotlightMutation.isPending}
                  className="px-6 py-3 bg-emerald-800/40 hover:bg-emerald-700/40 text-emerald-300 hover:text-white rounded-lg font-medium transition-all duration-300 border border-emerald-600/30 hover:border-emerald-500/50 backdrop-blur-sm disabled:opacity-50"
                >
                  {cloneSpotlightMutation.isPending ? 'Cloning...' : 'Clone Profile'}
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Deactivate Confirmation Modal */}
        {showDeactivateConfirm && (
          <Modal onClose={handleCloseModal} title="Deactivate Spotlight Profile">
            <div className="space-y-4">
              <p className="text-zinc-300">
                Deactivate "<strong>{showDeactivateConfirm.name}</strong>"? 
                This will disable the profile but preserve all data. You can reactivate it later.
              </p>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-3 bg-zinc-800/40 hover:bg-zinc-700/40 text-zinc-300 hover:text-white rounded-lg font-medium transition-all duration-300 border border-zinc-600/30 hover:border-zinc-500/50 backdrop-blur-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDeactivate}
                  disabled={updateSpotlightMutation.isPending}
                  className="px-6 py-3 bg-amber-800/40 hover:bg-amber-700/40 text-amber-300 hover:text-white rounded-lg font-medium transition-all duration-300 border border-amber-600/30 hover:border-amber-500/50 backdrop-blur-sm disabled:opacity-50"
                >
                  {updateSpotlightMutation.isPending ? 'Deactivating...' : 'Deactivate Profile'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}

export default function WorkstreamModule() {
  return (
    <div className="w-full h-full">
      <Routes>
        {/* Today Panel (Overview) */}
        <Route path="/today" element={<TodayPanel />} />
        
        {/* Spotlight Profiles Management */}
        <Route path="/spotlight" element={<SpotlightPage />} />
        <Route path="/spotlight/sandbox" element={<SpotlightSandboxPage />} />
        
        {/* Signals Management */}
        <Route path="/signals" element={<SignalsPage />} />
        <Route path="/signals/:signalId" element={<div>Signal Detail (TODO)</div>} />
        <Route path="/signals/new" element={<div>Create Signal (TODO)</div>} />
        
        {/* Candidates Management */}
        <Route path="/candidates" element={<CandidatesPage />} />
        <Route path="/candidates/:candidateId" element={<div>Candidate Detail (TODO)</div>} />
        <Route path="/candidates/new" element={<div>Create Candidate (TODO)</div>} />
        
        {/* Pursuits Management */}
        <Route path="/pursuits" element={<PursuitsPage />} />
        <Route path="/pursuits/:pursuitId" element={<div>Pursuit Detail (TODO)</div>} />
        <Route path="/pursuits/new" element={<div>Create Pursuit (TODO)</div>} />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/workstream/today" replace />} />
        <Route path="*" element={<Navigate to="/workstream/today" replace />} />
      </Routes>
    </div>
  );
}
