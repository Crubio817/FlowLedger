import React, { useState } from 'react';
import { Button } from '../ui/button.tsx';
import { Badge } from '../ui/badge.tsx';
import { 
  TrendingUp, 
  Brain, 
  Clock, 
  Globe, 
  Shield, 
  Star,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface StaffingRequest {
  id: number;
  title: string;
  description: string;
  requiredSkills: RequiredSkill[];
  budget: { min: number; max: number; currency: string };
  duration: { start: string; end: string; hoursPerWeek: number };
  location: string;
  remote: boolean;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
}

interface RequiredSkill {
  name: string;
  minimumLevel: number;
  weight: number;
  required: boolean;
}

interface PersonFit {
  person_id: number;
  name: string;
  fit_score: number; // 0-100
  reasons: FitReason[];
  avatar?: string;
  level: string;
  modeled_rate?: {
    base: number;
    total: number;
    currency: string;
  };
}

interface FitReason {
  code: 'HARD_SKILL_MATCH' | 'SOFT_SKILL_GAP' | 'AVAILABILITY' | 'TZ_OVERLAP' | 'DOMAIN' | 'RELIABILITY' | 'CONTINUITY';
  detail: string;
  contribution: number;
  evidence?: any;
}

interface CandidateRankingDemoProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CandidateRankingDemo: React.FC<CandidateRankingDemoProps> = ({ isOpen, onClose }) => {
  const [selectedRequest, setSelectedRequest] = useState<StaffingRequest | null>(null);
  const [candidates, setCandidates] = useState<PersonFit[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedCandidate, setExpandedCandidate] = useState<number | null>(null);

  // Mock staffing requests
  const mockRequests: StaffingRequest[] = [
    {
      id: 1,
      title: 'Senior React Developer',
      description: 'Building next-generation audit platform',
      requiredSkills: [
        { name: 'React', minimumLevel: 4, weight: 0.3, required: true },
        { name: 'TypeScript', minimumLevel: 3, weight: 0.2, required: true },
        { name: 'Financial Services', minimumLevel: 3, weight: 0.25, required: false },
        { name: 'Team Leadership', minimumLevel: 3, weight: 0.25, required: false }
      ],
      budget: { min: 120, max: 180, currency: 'USD' },
      duration: { start: '2025-10-01', end: '2026-03-31', hoursPerWeek: 40 },
      location: 'New York, NY',
      remote: true,
      urgency: 'High'
    },
    {
      id: 2,
      title: 'Security Consultant',
      description: 'Cybersecurity assessment for financial client',
      requiredSkills: [
        { name: 'Penetration Testing', minimumLevel: 4, weight: 0.4, required: true },
        { name: 'Network Security', minimumLevel: 4, weight: 0.3, required: true },
        { name: 'Compliance', minimumLevel: 3, weight: 0.3, required: false }
      ],
      budget: { min: 140, max: 200, currency: 'USD' },
      duration: { start: '2025-09-15', end: '2025-12-15', hoursPerWeek: 30 },
      location: 'Remote',
      remote: true,
      urgency: 'Critical'
    }
  ];

  // Mock candidate ranking (simulating API response)
  const mockRankCandidates = async (requestId: number): Promise<PersonFit[]> => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockCandidates: PersonFit[] = [
      {
        person_id: 1,
        name: 'Sarah Chen',
        fit_score: 92,
        level: 'L4',
        modeled_rate: { base: 185, total: 165, currency: 'USD' },
        reasons: [
          { code: 'HARD_SKILL_MATCH', detail: 'React (5/5) exceeds requirement (4/5)', contribution: 25, evidence: { skill: 'React', level: 5, required: 4 } },
          { code: 'HARD_SKILL_MATCH', detail: 'TypeScript (4/5) meets requirement (3/5)', contribution: 20, evidence: { skill: 'TypeScript', level: 4, required: 3 } },
          { code: 'AVAILABILITY', detail: '80% available, matches 100% requirement', contribution: 12, evidence: { available: 0.8, required: 1.0 } },
          { code: 'TZ_OVERLAP', detail: 'Eastern timezone aligns with client hours', contribution: 10, evidence: { overlap: 0.9 } },
          { code: 'RELIABILITY', detail: 'Excellent track record (95% reliability)', contribution: 15, evidence: { score: 0.95 } },
          { code: 'DOMAIN', detail: 'Strong financial services background', contribution: 10, evidence: { years: 4 } }
        ]
      },
      {
        person_id: 2,
        name: 'Marcus Johnson',
        fit_score: 78,
        level: 'L5',
        modeled_rate: { base: 295, total: 285, currency: 'USD' },
        reasons: [
          { code: 'HARD_SKILL_MATCH', detail: 'Leadership skills strong but lacks React depth', contribution: 15, evidence: { leadership: 5, react: 2 } },
          { code: 'AVAILABILITY', detail: '60% available, below optimal', contribution: -5, evidence: { available: 0.6, required: 1.0 } },
          { code: 'TZ_OVERLAP', detail: 'Pacific timezone, limited overlap', contribution: -3, evidence: { overlap: 0.6 } },
          { code: 'RELIABILITY', detail: 'Outstanding reliability (98%)', contribution: 18, evidence: { score: 0.98 } },
          { code: 'DOMAIN', detail: 'Extensive financial consulting experience', contribution: 25, evidence: { years: 8 } },
          { code: 'CONTINUITY', detail: 'Already working on related engagement', contribution: 28, evidence: { related_project: true } }
        ]
      },
      {
        person_id: 4,
        name: 'David Kim',
        fit_score: 85,
        level: 'L2',
        modeled_rate: { base: 95, total: 115, currency: 'USD' },
        reasons: [
          { code: 'HARD_SKILL_MATCH', detail: 'Strong technical foundation, some gaps', contribution: 18, evidence: { react: 3, typescript: 4 } },
          { code: 'AVAILABILITY', detail: '100% available immediately', contribution: 15, evidence: { available: 1.0, required: 1.0 } },
          { code: 'TZ_OVERLAP', detail: 'Seoul timezone, challenging but workable', contribution: -2, evidence: { overlap: 0.4 } },
          { code: 'RELIABILITY', detail: 'Good reliability for junior level (91%)', contribution: 12, evidence: { score: 0.91 } },
          { code: 'SOFT_SKILL_GAP', detail: 'Limited leadership experience', contribution: -8, evidence: { leadership: 1, required: 3 } }
        ]
      }
    ];

    setLoading(false);
    return mockCandidates;
  };

  const handleRankCandidates = async (request: StaffingRequest) => {
    setSelectedRequest(request);
    const results = await mockRankCandidates(request.id);
    setCandidates(results);
  };

  const getFitScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 80) return 'text-cyan-400';
    if (score >= 70) return 'text-amber-400';
    return 'text-orange-400';
  };

  const getReasonColor = (contribution: number) => {
    if (contribution > 15) return 'text-emerald-400';
    if (contribution > 0) return 'text-cyan-400';
    if (contribution > -5) return 'text-amber-400';
    return 'text-red-400';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-cyan-400" />
              AI Candidate Ranking Demo
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              Explainable AI recommendations with FitScore analysis
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!selectedRequest ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Select a Staffing Request</h3>
              <div className="grid gap-4">
                {mockRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 cursor-pointer hover:border-cyan-500/50 transition-all"
                    onClick={() => handleRankCandidates(request)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{request.title}</h4>
                        <p className="text-zinc-400 text-sm mt-1">{request.description}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <Badge variant={request.urgency === 'Critical' ? 'success' : 'muted'}>
                            {request.urgency} Priority
                          </Badge>
                          <span className="text-sm text-zinc-500">
                            ${request.budget.min}-{request.budget.max}/hr
                          </span>
                          <span className="text-sm text-zinc-500">
                            {request.duration.hoursPerWeek}h/week
                          </span>
                        </div>
                      </div>
                      <Button className="bg-cyan-600 hover:bg-cyan-700">
                        <TrendingUp size={16} className="mr-2" />
                        Rank Candidates
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Request Summary */}
              <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-white">{selectedRequest.title}</h3>
                    <p className="text-zinc-400 text-sm">{selectedRequest.description}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => { setSelectedRequest(null); setCandidates([]); }}
                    className="border-zinc-600"
                  >
                    Back to Requests
                  </Button>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center gap-3 text-cyan-400">
                    <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing candidates with AI FitScore...</span>
                  </div>
                </div>
              )}

              {/* Ranked Candidates */}
              {candidates.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">
                    Ranked Candidates ({candidates.length})
                  </h3>
                  {candidates.map((candidate, index) => (
                    <div key={candidate.person_id} className="bg-zinc-800/30 border border-zinc-700 rounded-lg overflow-hidden">
                      <div 
                        className="p-4 cursor-pointer hover:bg-zinc-800/50 transition-colors"
                        onClick={() => setExpandedCandidate(
                          expandedCandidate === candidate.person_id ? null : candidate.person_id
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                              <span className="text-zinc-500 font-mono text-sm">#{index + 1}</span>
                              <div>
                                <h4 className="font-medium text-white">{candidate.name}</h4>
                                <Badge variant="muted" className="text-xs">{candidate.level}</Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className={`font-semibold ${getFitScoreColor(candidate.fit_score)}`}>
                                {candidate.fit_score}/100
                              </div>
                              <div className="text-xs text-zinc-500">FitScore</div>
                            </div>
                            {candidate.modeled_rate && (
                              <div className="text-right">
                                <div className="font-semibold text-white">
                                  ${candidate.modeled_rate.total}/hr
                                </div>
                                <div className="text-xs text-zinc-500">Modeled Rate</div>
                              </div>
                            )}
                            {expandedCandidate === candidate.person_id ? (
                              <ChevronUp size={20} className="text-zinc-400" />
                            ) : (
                              <ChevronDown size={20} className="text-zinc-400" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedCandidate === candidate.person_id && (
                        <div className="border-t border-zinc-700 p-4 bg-zinc-900/50">
                          <h5 className="font-medium text-white mb-3">FitScore Breakdown</h5>
                          <div className="space-y-2">
                            {candidate.reasons.map((reason, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded">
                                <div className="flex-1">
                                  <span className="text-sm text-zinc-300">{reason.detail}</span>
                                </div>
                                <div className={`text-sm font-medium ${getReasonColor(reason.contribution)}`}>
                                  {reason.contribution > 0 ? '+' : ''}{reason.contribution}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 pt-3 border-t border-zinc-700 flex justify-end">
                            <Button className="bg-emerald-600 hover:bg-emerald-700">
                              Select Candidate
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
