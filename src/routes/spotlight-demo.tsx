// Spotlight ICP Management Page
// Full implementation based on backend API references and comprehensive design sketch

import React, { useState, useMemo } from 'react';
import { 
  Target, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  Play,
  BarChart3,
  Users,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Eye,
  EyeOff,
  Download,
  Upload,
  Settings,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Star,
  FileText,
  Calendar,
  Activity
} from 'lucide-react';
import {
  SpotlightCard,
  SpotlightBuilder,
  SpotlightBuilderStepped,
  SpotlightProfilesGallery,
  useSpotlights,
  useSpotlight,
  useCreateSpotlight,
  useUpdateSpotlight,
  useDeleteSpotlight,
  useCloneSpotlight,
  useEvaluateSpotlight,
  useEvaluateSignalAgainstAllSpotlights,
  useSpotlightAnalytics,
  useSpotlightPerformance,
  useSpotlightFields,
  useAvailableDomains,
} from '../modules/spotlight/index.ts';
import {
  SignalSpotlightPanel,
  CandidateFormWithSpotlight,
  TodayPanelSpotlightWidget,
  SpotlightAnalyticsDashboard,
} from '../modules/spotlight/examples/integration.tsx';
import StandardHeader from '../components/StandardHeader.tsx';
import type { 
  Spotlight, 
  SpotlightEvaluationResult, 
  SpotlightFilters,
  SpotlightField,
  CreateSpotlightRequest,
  UpdateSpotlightRequest,
  CloneSpotlightRequest
} from '../modules/spotlight/services/spotlight.types.ts';

const DEMO_ORG_ID = 1;

const DEMO_SIGNAL_DATA = {
  company_name: 'TechCorp Inc',
  industry: 'software',
  company_size: '51-200',
  revenue: '5000000',
  technology_stack: 'React, Node.js, AWS',
  pain_points: 'manual processes, scaling issues',
  decision_maker: 'CTO',
  budget_range: '100k-500k',
  timeline: 'Q1 2025',
  source_type: 'website_form',
  urgency_score: 85,
};

const SpotlightModuleDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'builder' | 'evaluation' | 'analytics' | 'integration'>('overview');
  const [selectedSpotlight, setSelectedSpotlight] = useState<Spotlight | null>(null);
  const [useSteppedBuilder, setUseSteppedBuilder] = useState(true); // Default to stepped builder
  const [useGalleryView, setUseGalleryView] = useState(false); // Toggle between card list and gallery
  const [evaluationResults, setEvaluationResults] = useState<Array<{
    spotlight: Spotlight;
    result: SpotlightEvaluationResult;
  }>>([]);

  const { data: spotlightsResponse } = useSpotlights({
    org_id: DEMO_ORG_ID,
    active: true,
    limit: 10,
  });

  const { mutateAsync: evaluateAll } = useEvaluateSignalAgainstAllSpotlights();

  const handleEvaluateAll = async () => {
    try {
      const results = await evaluateAll({
        orgId: DEMO_ORG_ID,
        domain: 'tech',
        signalData: DEMO_SIGNAL_DATA,
      });
      
      setEvaluationResults(results.map(r => ({
        spotlight: r.spotlight,
        result: r.evaluation,
      })));
    } catch (error) {
      console.error('Evaluation failed:', error);
    }
  };

  const handleSpotlightEvaluation = (spotlight: Spotlight, result: SpotlightEvaluationResult) => {
    setEvaluationResults(prev => [
      ...prev.filter(r => r.spotlight.spotlight_id !== spotlight.spotlight_id),
      { spotlight, result },
    ]);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'builder', label: 'Builder', icon: Settings },
    { id: 'evaluation', label: 'Evaluation', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'integration', label: 'Integration', icon: Zap },
  ];

  return (
    <div className="min-h-screen text-white">
      {/* Note: Using app-level background (#101010 with grid) instead of page-level bg-zinc-950 
          to avoid multiple background layers that create visual conflicts */}
      <StandardHeader
        title="Spotlight System Demo"
        subtitle="Ideal Customer Profile (ICP) Management"
        color="blue"
        variant="comfortable"
      />

      {/* Navigation */}
      <div className="border-b border-zinc-700/30">
        <div className="max-w-7xl mx-auto px-6 py-2">
          <div className="flex items-center justify-between">
            <nav className="flex space-x-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === id
                      ? 'text-cyan-400 border-b-2 border-cyan-400'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-sm rounded border border-cyan-500/30">
                Organization: {DEMO_ORG_ID}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Introduction */}
            <div className="border border-zinc-700/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Spotlight System Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-medium text-white">Profile Management</h3>
                  </div>
                  <p className="text-zinc-400 text-sm">
                    Create and manage dynamic Ideal Customer Profiles with custom fields for different domains.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-medium text-white">Signal Evaluation</h3>
                  </div>
                  <p className="text-zinc-400 text-sm">
                    Automatically evaluate incoming signals against spotlight profiles for intelligent qualification.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-medium text-white">Workstream Integration</h3>
                  </div>
                  <p className="text-zinc-400 text-sm">
                    Seamlessly integrate with signals, candidates, and pursuits for enhanced lead management.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-zinc-800/50 p-4 rounded-lg">
                <h3 className="text-sm text-zinc-400 mb-1">Active Profiles</h3>
                <p className="text-2xl font-bold text-white">
                  {spotlightsResponse?.data.filter(s => s.active).length || 0}
                </p>
              </div>
              <div className="bg-zinc-800/50 p-4 rounded-lg">
                <h3 className="text-sm text-zinc-400 mb-1">Total Profiles</h3>
                <p className="text-2xl font-bold text-white">
                  {spotlightsResponse?.data.length || 0}
                </p>
              </div>
              <div className="bg-zinc-800/50 p-4 rounded-lg">
                <h3 className="text-sm text-zinc-400 mb-1">Evaluations Run</h3>
                <p className="text-2xl font-bold text-white">{evaluationResults.length}</p>
              </div>
              <div className="bg-zinc-800/50 p-4 rounded-lg">
                <h3 className="text-sm text-zinc-400 mb-1">Avg Match Score</h3>
                <p className="text-2xl font-bold text-white">
                  {evaluationResults.length > 0 
                    ? Math.round(evaluationResults.reduce((sum, r) => sum + r.result.match_score, 0) / evaluationResults.length * 100)
                    : 0}%
                </p>
              </div>
            </div>

            {/* Spotlight Profiles Display */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Spotlight Profiles</h2>
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
              
              {useGalleryView ? (
                <SpotlightProfilesGallery 
                  spotlights={spotlightsResponse?.data || []}
                  onSpotlightSelect={setSelectedSpotlight}
                  className="min-h-96"
                />
              ) : (
                <SpotlightCard
                  orgId={DEMO_ORG_ID}
                  variant="detailed"
                  onSpotlightSelect={setSelectedSpotlight}
                  className="min-h-96"
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'builder' && (
          <div className="space-y-6">
            <div className="border border-zinc-700/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Spotlight Profile Builder</h2>
                  <p className="text-zinc-400 mt-1">
                    Create and configure spotlight profiles with dynamic field definitions.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-zinc-400">Builder Version:</span>
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
            </div>

            {useSteppedBuilder ? (
              <SpotlightBuilderStepped
                orgId={DEMO_ORG_ID}
                mode="create"
                initialDomain="tech"
                onSave={(spotlight) => {
                  setSelectedSpotlight(spotlight);
                  setActiveTab('overview');
                }}
                onCancel={() => setActiveTab('overview')}
              />
            ) : (
              <SpotlightBuilder
                orgId={DEMO_ORG_ID}
                mode="create"
                initialDomain="tech"
                onSave={(spotlight) => {
                  setSelectedSpotlight(spotlight);
                  setActiveTab('overview');
                }}
                onCancel={() => setActiveTab('overview')}
              />
            )}
          </div>
        )}

        {activeTab === 'evaluation' && (
          <div className="space-y-6">
            {/* Demo Signal Data */}
            <div className="border border-zinc-700/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Signal Evaluation Demo</h2>
              <p className="text-zinc-400 mb-4">
                Evaluate the demo signal against your spotlight profiles.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-white mb-3">Demo Signal Data</h3>
                  <div className="bg-zinc-800/50 p-4 rounded-lg space-y-2">
                    {Object.entries(DEMO_SIGNAL_DATA).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-zinc-400 capitalize">
                          {key.replace(/_/g, ' ')}:
                        </span>
                        <span className="text-white">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-white">Evaluation Actions</h3>
                    <button
                      onClick={handleEvaluateAll}
                      className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Evaluate All Tech Profiles
                    </button>
                  </div>
                  
                  {evaluationResults.length > 0 && (
                    <div className="bg-zinc-800/50 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-3">Results</h4>
                      <div className="space-y-2">
                        {evaluationResults
                          .sort((a, b) => b.result.match_score - a.result.match_score)
                          .map(({ spotlight, result }) => (
                            <div
                              key={spotlight.spotlight_id}
                              className="flex items-center justify-between p-2 bg-zinc-700/30 rounded"
                            >
                              <span className="text-white">{spotlight.name}</span>
                              <div className="flex items-center gap-2">
                                <span className={`font-medium ${getRecommendationColor(result.recommendation)}`}>
                                  {Math.round(result.match_score * 100)}%
                                </span>
                                <span className="text-xs text-zinc-400">
                                  {result.recommendation.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Interactive Evaluation */}
            <SpotlightCard
              orgId={DEMO_ORG_ID}
              variant="evaluation"
              signalData={DEMO_SIGNAL_DATA}
              onEvaluationComplete={handleSpotlightEvaluation}
              className="min-h-96"
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="border border-zinc-700/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Analytics Dashboard</h2>
              <p className="text-zinc-400 mb-6">
                Performance metrics and insights for your spotlight profiles.
              </p>
            </div>

            <SpotlightAnalyticsDashboard orgId={DEMO_ORG_ID} />
          </div>
        )}

        {activeTab === 'integration' && (
          <div className="space-y-6">
            <div className="border border-zinc-700/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Workstream Integration</h2>
              <p className="text-zinc-400 mb-6">
                Examples of how the Spotlight System integrates with other FlowLedger modules.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today Panel Widget */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Today Panel Integration</h3>
                <TodayPanelSpotlightWidget orgId={DEMO_ORG_ID} />
              </div>

              {/* Signal Panel */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Signal Detail Panel</h3>
                <div className="border border-zinc-700/20 rounded-lg p-4">
                  <SignalSpotlightPanel
                    signal={{
                      signal_id: 1,
                      org_id: DEMO_ORG_ID,
                      snippet: "Looking for process improvement consulting for our tech startup",
                      source_type: 'email',
                      urgency_score: 85,
                      cluster_id: undefined,
                      cluster_count: undefined,
                      owner_user_id: undefined,
                      status: 'new',
                      metadata_json: DEMO_SIGNAL_DATA,
                      has_candidate: false,
                      created_utc: new Date().toISOString(),
                    }}
                    orgId={DEMO_ORG_ID}
                  />
                </div>
              </div>
            </div>

            {/* Candidate Form Integration */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Candidate Creation with Spotlight</h3>
              <div className="border border-zinc-700/20 rounded-lg p-6">
                <CandidateFormWithSpotlight
                  orgId={DEMO_ORG_ID}
                  onSave={(candidate: any, spotlights: number[]) => {
                    console.log('Candidate created:', candidate, 'Associated spotlights:', spotlights);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function getRecommendationColor(recommendation: string): string {
  switch (recommendation) {
    case 'high_match': return 'text-green-400';
    case 'medium_match': return 'text-yellow-400';
    case 'low_match': return 'text-orange-400';
    case 'no_match': return 'text-red-400';
    default: return 'text-gray-400';
  }
}

export default SpotlightModuleDemo;
