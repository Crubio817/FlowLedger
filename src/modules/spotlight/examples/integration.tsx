// Spotlight Module Integration Examples
// Examples showing how to integrate Spotlight with Signals, Candidates, and Pursuits

import React, { useState } from 'react';
import { SpotlightCard, SpotlightBuilder, useEvaluateSignalAgainstAllSpotlights } from '../index.ts';
import type { Signal, Candidate } from '../../../services/workstream.types.ts';
import type { Spotlight, SpotlightEvaluationResult } from '../services/spotlight.types.ts';

// ================================
// 1. Signal Detail View Integration
// ================================

interface SignalSpotlightPanelProps {
  signal: Signal;
  orgId: number;
}

const SignalSpotlightPanel: React.FC<SignalSpotlightPanelProps> = ({ signal, orgId }) => {
  const [evaluationResults, setEvaluationResults] = useState<Array<{
    spotlight: Spotlight;
    result: SpotlightEvaluationResult;
  }>>([]);

  const { mutateAsync: evaluateAgainstAll } = useEvaluateSignalAgainstAllSpotlights();

  // Extract signal data for evaluation
  const signalData = {
    source_type: signal.source_type,
    urgency_score: signal.urgency_score,
    snippet: signal.snippet,
    ...signal.metadata_json, // Additional signal-specific data
  };

  const handleEvaluateAll = async (domain: string) => {
    try {
      const results = await evaluateAgainstAll({
        orgId,
        domain,
        signalData,
      });
      
      setEvaluationResults(results.map(r => ({
        spotlight: r.spotlight,
        result: r.evaluation,
      })));
    } catch (error) {
      console.error('Batch evaluation failed:', error);
    }
  };

  const handleSpotlightEvaluation = (spotlight: Spotlight, result: SpotlightEvaluationResult) => {
    setEvaluationResults(prev => [
      ...prev.filter(r => r.spotlight.spotlight_id !== spotlight.spotlight_id),
      { spotlight, result },
    ]);
  };

  return (
    <div className="space-y-4">
      {/* Quick Evaluation */}
      <div className="bg-zinc-800/50 p-4 rounded-lg">
        <h3 className="font-medium text-white mb-3">Quick Evaluation</h3>
        <div className="flex gap-2">
          <button
            onClick={() => handleEvaluateAll('tech')}
            className="px-3 py-1 bg-cyan-500 hover:bg-cyan-600 text-white text-sm rounded"
          >
            Evaluate vs Tech Profiles
          </button>
          <button
            onClick={() => handleEvaluateAll('finance')}
            className="px-3 py-1 bg-cyan-500 hover:bg-cyan-600 text-white text-sm rounded"
          >
            Evaluate vs Finance Profiles
          </button>
        </div>
      </div>

      {/* Spotlight Card */}
      <SpotlightCard
        orgId={orgId}
        variant="evaluation"
        signalData={signalData}
        onEvaluationComplete={handleSpotlightEvaluation}
        className="min-h-96"
      />

      {/* Evaluation Results */}
      {evaluationResults.length > 0 && (
        <div className="bg-zinc-800/50 p-4 rounded-lg">
          <h3 className="font-medium text-white mb-3">Evaluation Results</h3>
          <div className="space-y-2">
            {evaluationResults
              .sort((a, b) => b.result.match_score - a.result.match_score)
              .map(({ spotlight, result }) => (
                <div
                  key={spotlight.spotlight_id}
                  className="flex items-center justify-between p-3 bg-zinc-700/30 rounded"
                >
                  <div>
                    <span className="font-medium text-white">{spotlight.name}</span>
                    <span className="text-zinc-400 ml-2">({spotlight.domain})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-medium ${getRecommendationColor(result.recommendation)}`}>
                      {Math.round(result.match_score * 100)}%
                    </span>
                    <span className="text-sm text-zinc-400">
                      {result.matched_fields}/{result.total_fields} fields
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ================================
// 2. Candidate Creation Form Integration
// ================================

interface CandidateFormWithSpotlightProps {
  orgId: number;
  signal?: Signal;
  onSave: (candidate: Candidate, associatedSpotlights: number[]) => void;
}

const CandidateFormWithSpotlight: React.FC<CandidateFormWithSpotlightProps> = ({
  orgId,
  signal,
  onSave,
}) => {
  const [selectedSpotlights, setSelectedSpotlights] = useState<number[]>([]);
  const [candidateData, setCandidateData] = useState({
    title: '',
    contact_name: '',
    contact_email: '',
    value_band: 'medium' as const,
    notes: '',
  });

  const handleSpotlightSelect = (spotlight: Spotlight) => {
    setSelectedSpotlights(prev => 
      prev.includes(spotlight.spotlight_id)
        ? prev.filter(id => id !== spotlight.spotlight_id)
        : [...prev, spotlight.spotlight_id]
    );
  };

  const handleSave = () => {
    // Create candidate logic here
    const newCandidate = {
      candidate_id: Date.now(), // Mock ID
      org_id: orgId,
      signal_id: signal?.signal_id,
      ...candidateData,
      status: 'new' as const,
      confidence: 75,
      created_utc: new Date().toISOString(),
    };

    onSave(newCandidate, selectedSpotlights);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Candidate Form */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Create Candidate</h2>
        
        <div>
          <label className="block text-sm font-medium text-white mb-2">Title</label>
          <input
            type="text"
            value={candidateData.title}
            onChange={(e) => setCandidateData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Contact Name</label>
          <input
            type="text"
            value={candidateData.contact_name}
            onChange={(e) => setCandidateData(prev => ({ ...prev, contact_name: e.target.value }))}
            className="w-full bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Value Band</label>
          <select
            value={candidateData.value_band}
            onChange={(e) => setCandidateData(prev => ({ ...prev, value_band: e.target.value as any }))}
            className="w-full bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-white"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          className="w-full px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded"
        >
          Create Candidate
        </button>
      </div>

      {/* Spotlight Selection */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Associate with Profiles</h3>
        <SpotlightCard
          orgId={orgId}
          variant="compact"
          onSpotlightSelect={handleSpotlightSelect}
          showCreateButton={false}
        />
        
        {selectedSpotlights.length > 0 && (
          <div className="mt-4 p-3 bg-cyan-500/10 rounded border border-cyan-500/30">
            <p className="text-cyan-400 text-sm">
              {selectedSpotlights.length} spotlight profile(s) will be associated
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ================================
// 3. Today Panel Integration
// ================================

interface TodayPanelSpotlightWidgetProps {
  orgId: number;
}

const TodayPanelSpotlightWidget: React.FC<TodayPanelSpotlightWidgetProps> = ({ orgId }) => {
  const [showBuilder, setShowBuilder] = useState(false);

  return (
    <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-700/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-white">Spotlight Profiles</h3>
        <button
          onClick={() => setShowBuilder(true)}
          className="px-3 py-1 bg-cyan-500 hover:bg-cyan-600 text-white text-sm rounded"
        >
          Create Profile
        </button>
      </div>

      {showBuilder ? (
        <SpotlightBuilder
          orgId={orgId}
          mode="create"
          onSave={() => setShowBuilder(false)}
          onCancel={() => setShowBuilder(false)}
        />
      ) : (
        <SpotlightCard
          orgId={orgId}
          variant="compact"
          className="border-0 bg-transparent"
        />
      )}
    </div>
  );
};

// ================================
// 4. Analytics Dashboard Integration
// ================================

import { useSpotlightAnalytics } from '../hooks/useSpotlight.ts';

interface SpotlightAnalyticsDashboardProps {
  orgId: number;
}

const SpotlightAnalyticsDashboard: React.FC<SpotlightAnalyticsDashboardProps> = ({ orgId }) => {
  const { data: analytics, isLoading, error } = useSpotlightAnalytics(orgId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-zinc-800/50 p-4 rounded-lg animate-pulse">
            <div className="h-4 bg-zinc-700 rounded mb-2"></div>
            <div className="h-8 bg-zinc-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fallback with demo data */}
        <div className="bg-zinc-800/50 p-4 rounded-lg">
          <h3 className="text-sm text-zinc-400 mb-1">Total Profiles</h3>
          <p className="text-2xl font-bold text-white">3</p>
        </div>
        <div className="bg-zinc-800/50 p-4 rounded-lg">
          <h3 className="text-sm text-zinc-400 mb-1">Active Profiles</h3>
          <p className="text-2xl font-bold text-white">2</p>
        </div>
        <div className="bg-zinc-800/50 p-4 rounded-lg">
          <h3 className="text-sm text-zinc-400 mb-1">Total Evaluations</h3>
          <p className="text-2xl font-bold text-white">12</p>
        </div>
        <div className="bg-zinc-800/50 p-4 rounded-lg">
          <h3 className="text-sm text-zinc-400 mb-1">Avg Match Score</h3>
          <p className="text-2xl font-bold text-white">73%</p>
        </div>
        <div className="md:col-span-2 lg:col-span-4 bg-zinc-800/50 p-4 rounded-lg">
          <h3 className="font-medium text-white mb-4">Analytics Dashboard</h3>
          <div className="text-zinc-400 text-center py-4">
            {error ? 'Failed to load analytics data' : 'Demo data shown - analytics API not implemented'}
          </div>
        </div>
      </div>
    );
  }

  const overview = analytics.overview || {
    total_profiles: 0,
    active_profiles: 0,
    total_evaluations: 0,
    avg_match_score: 0
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Overview Cards */}
      <div className="bg-zinc-800/50 p-4 rounded-lg">
        <h3 className="text-sm text-zinc-400 mb-1">Total Profiles</h3>
        <p className="text-2xl font-bold text-white">{overview.total_profiles || 0}</p>
      </div>

      <div className="bg-zinc-800/50 p-4 rounded-lg">
        <h3 className="text-sm text-zinc-400 mb-1">Active Profiles</h3>
        <p className="text-2xl font-bold text-white">{overview.active_profiles || 0}</p>
      </div>

      <div className="bg-zinc-800/50 p-4 rounded-lg">
        <h3 className="text-sm text-zinc-400 mb-1">Total Evaluations</h3>
        <p className="text-2xl font-bold text-white">{overview.total_evaluations || 0}</p>
      </div>

      <div className="bg-zinc-800/50 p-4 rounded-lg">
        <h3 className="text-sm text-zinc-400 mb-1">Avg Match Score</h3>
        <p className="text-2xl font-bold text-white">
          {overview.avg_match_score ? Math.round(overview.avg_match_score * 100) : 0}%
        </p>
      </div>

      {/* Top Performers */}
      <div className="md:col-span-2 lg:col-span-4 bg-zinc-800/50 p-4 rounded-lg">
        <h3 className="font-medium text-white mb-4">Top Performing Profiles</h3>
        <div className="space-y-2">
          {analytics.top_performers?.length > 0 ? (
            analytics.top_performers.map((profile) => (
              <div key={profile.spotlight_id} className="flex items-center justify-between p-2 bg-zinc-700/30 rounded">
                <div>
                  <span className="font-medium text-white">{profile.name}</span>
                  <span className="text-zinc-400 ml-2">({profile.domain})</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-zinc-400">{profile.total_evaluations || 0} evaluations</span>
                  <span className="text-green-400">{profile.avg_match_score ? Math.round(profile.avg_match_score * 100) : 0}% avg</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-zinc-400 text-center py-4">
              No performance data available yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ================================
// Helper Functions
// ================================

function getRecommendationColor(recommendation: string): string {
  switch (recommendation) {
    case 'high_match': return 'text-green-400';
    case 'medium_match': return 'text-yellow-400';
    case 'low_match': return 'text-orange-400';
    case 'no_match': return 'text-red-400';
    default: return 'text-gray-400';
  }
}

// ================================
// Exports
// ================================

export {
  SignalSpotlightPanel,
  CandidateFormWithSpotlight,
  TodayPanelSpotlightWidget,
  SpotlightAnalyticsDashboard,
};
