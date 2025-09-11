// Spotlight Sandbox - Hidden Development Page
// Copy of spotlight page for testing and development

import React, { useState } from 'react';
import StandardHeader from '../components/StandardHeader.tsx';
import {
  SpotlightCard,
  SpotlightBuilder,
  SpotlightBuilderStepped,
  SpotlightProfilesGallery,
  useSpotlights,
} from '../modules/spotlight/index.ts';
import SpotlightFieldsManager from '../modules/spotlight/components/SpotlightFieldsManager.tsx';
import {
  SignalSpotlightPanel,
  CandidateFormWithSpotlight,
  TodayPanelSpotlightWidget,
  SpotlightAnalyticsDashboard,
} from '../modules/spotlight/examples/integration.tsx';

// ORG_ID for demos (typically would come from app state)
const ORG_ID = 1;

// Spotlight Sandbox Page Component with All Components
export default function SpotlightSandboxPage() {
  const [useSteppedBuilder, setUseSteppedBuilder] = useState(true);
  const [useGalleryView, setUseGalleryView] = useState(false);

  // Fetch spotlight data
  const { data: spotlightsResponse } = useSpotlights({
    org_id: ORG_ID,
    active: true,
    limit: 10,
  });

  // Demo handlers for spotlight actions
  const handleSpotlightView = (spotlight: any) => {
    console.log('View spotlight:', spotlight);
    // Demo mode - just log the action
  };

  const handleSpotlightClose = (spotlight: any) => {
    console.log('Close/Deactivate spotlight:', spotlight);
    // Demo mode - just log the action
  };

  const handleSpotlightDelete = (spotlight: any) => {
    console.log('Delete spotlight:', spotlight);
    // Demo mode - just log the action
  };

  const handleSpotlightClone = (spotlight: any) => {
    console.log('Clone spotlight:', spotlight);
    // Demo mode - just log the action
  };

  const DEMO_SIGNAL = {
    signal_id: 1,
    org_id: ORG_ID,
    snippet: "Looking for process improvement consulting for our tech startup",
    source_type: 'email' as const,
    urgency_score: 85,
    cluster_id: undefined,
    cluster_count: undefined,
    owner_user_id: undefined,
    status: 'new' as const,
    metadata_json: {
      company_name: 'TechCorp Inc',
      industry: 'software',
      company_size: '51-200',
    },
    has_candidate: false,
    created_utc: new Date().toISOString(),
  };

  return (
    <div>
      <StandardHeader
        title="Spotlight Sandbox"
        subtitle="🚧 Hidden development page - All spotlight components for testing"
        color="amber"
        variant="comfortable"
      />
      <div className="px-6">
        {/* Spotlight component live previews */}
        <div className="flex flex-col gap-10 py-8">
          <section>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-semibold text-white">Spotlight Profiles</h2>
                <p className="text-sm text-zinc-400">View and manage spotlight profiles with statistics and selection handling.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-zinc-300">View Mode:</span>
                <div className="flex items-center bg-zinc-800 rounded-lg p-1">
                  <button
                    onClick={() => setUseGalleryView(false)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      !useGalleryView 
                        ? 'bg-cyan-500 text-white shadow-sm' 
                        : 'text-zinc-400 hover:text-zinc-300'
                    }`}
                  >
                    📋 List View
                  </button>
                  <button
                    onClick={() => setUseGalleryView(true)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      useGalleryView 
                        ? 'bg-cyan-500 text-white shadow-sm' 
                        : 'text-zinc-400 hover:text-zinc-300'
                    }`}
                  >
                    🎨 Gallery View
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
              {useGalleryView ? (
                <SpotlightProfilesGallery 
                  spotlights={spotlightsResponse?.data || []}
                  onSpotlightSelect={handleSpotlightView}
                  onSpotlightClose={handleSpotlightClose}
                  onSpotlightDelete={handleSpotlightDelete}
                  onSpotlightClone={handleSpotlightClone}
                  className="min-h-64" 
                />
              ) : (
                <SpotlightCard orgId={ORG_ID} variant="detailed" className="min-h-64" />
              )}
            </div>
          </section>
          <section>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-semibold text-white">Spotlight Profile Builder</h2>
                <p className="text-sm text-zinc-400 mt-1">Choose between stepped wizard or single-page form for creating spotlight profiles.</p>
              </div>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-6">
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-medium text-zinc-300">Builder Version:</span>
                  <div className="flex items-center bg-zinc-800 rounded-lg p-1">
                    <button
                      onClick={() => setUseSteppedBuilder(true)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        useSteppedBuilder 
                          ? 'bg-cyan-500 text-white shadow-sm' 
                          : 'text-zinc-400 hover:text-zinc-300'
                      }`}
                    >
                      ✨ Stepped Wizard
                    </button>
                    <button
                      onClick={() => setUseSteppedBuilder(false)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        !useSteppedBuilder 
                          ? 'bg-cyan-500 text-white shadow-sm' 
                          : 'text-zinc-400 hover:text-zinc-300'
                      }`}
                    >
                      📄 Single Page
                    </button>
                  </div>
                </div>
              </div>
              {useSteppedBuilder ? (
                <SpotlightBuilderStepped orgId={ORG_ID} mode="create" initialDomain="tech" onSave={() => { /* noop demo */ }} onCancel={() => { /* noop */ }} />
              ) : (
                <SpotlightBuilder orgId={ORG_ID} mode="create" initialDomain="tech" onSave={() => { /* noop demo */ }} onCancel={() => { /* noop */ }} />
              )}
            </div>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Custom Fields Manager</h2>
            <p className="text-sm text-zinc-400 mb-4">Manage custom fields for spotlight profiles to consolidate scattered field operations.</p>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
              <SpotlightFieldsManager orgId={ORG_ID} domain="tech" />
            </div>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">SignalSpotlightPanel</h2>
            <p className="text-sm text-zinc-400 mb-4">Evaluates a single signal against available spotlights and shows match scores.</p>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
              <SignalSpotlightPanel signal={DEMO_SIGNAL} orgId={ORG_ID} />
            </div>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">TodayPanelSpotlightWidget</h2>
            <p className="text-sm text-zinc-400 mb-4">Compact widget version for embedding spotlight insights in dashboards.</p>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
              <TodayPanelSpotlightWidget orgId={ORG_ID} />
            </div>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">CandidateFormWithSpotlight</h2>
            <p className="text-sm text-zinc-400 mb-4">Enhanced candidate creation form with spotlight profile association.</p>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
              <CandidateFormWithSpotlight orgId={ORG_ID} onSave={() => { /* noop demo */ }} />
            </div>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">SpotlightAnalyticsDashboard</h2>
            <p className="text-sm text-zinc-400 mb-4">Comprehensive analytics and performance metrics for spotlight profiles.</p>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
              <SpotlightAnalyticsDashboard orgId={ORG_ID} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
