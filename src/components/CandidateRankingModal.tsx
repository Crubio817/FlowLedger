import React, { useState, useEffect } from 'react';
import { 
  X,
  Brain,
  Star,
  Clock,
  Globe,
  DollarSign,
  Briefcase,
  Shield,
  TrendingUp,
  Target,
  CheckCircle2,
  User,
  Award,
  AlertCircle,
  Info,
  Zap,
  ArrowRight,
  Calendar
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogBody } from '../ui/dialog.tsx';
import { Badge } from '../ui/badge.tsx';
import { Button } from '../ui/button.tsx';

// Types for candidate ranking
interface PersonFit {
  person_id: number;
  fit_score: number; // 0-1 scale
  reasons: FitReason[];
  modeled_rate?: RateBreakdown;
  person: {
    name: string;
    email: string;
    level: string;
    timezone: string;
    location: string;
    skills: PersonSkill[];
    availability_next_2_weeks: number;
    reliability_score: number;
    performance_score: number;
  };
}

interface FitReason {
  code: 'HARD_SKILL_MATCH' | 'SOFT_SKILL_GAP' | 'AVAILABILITY' | 'TZ_OVERLAP' | 'DOMAIN' | 'RELIABILITY' | 'CONTINUITY';
  detail: string;
  contribution: number; // + or - impact on score
  evidence?: any; // Supporting data
}

interface RateBreakdown {
  currency: string;
  base: number;
  abs_premiums: Array<{source: string; amount: number}>;
  pct_premiums: Array<{source: string; percentage: number}>;
  scarcity: number;
  total: number;
  override_source?: string;
}

interface PersonSkill {
  skill_id: number;
  name: string;
  level: number; // 1-5
  last_used_at?: string;
  confidence: number; // 0-1
}

interface StaffingRequest {
  id: number;
  title: string;
  role: string;
  required_skills: string[];
  start_date: string;
  end_date: string;
  budget: number;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
}

interface CandidateRankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffingRequest: StaffingRequest | null;
  onSelectCandidate: (personId: number) => void;
}

export const CandidateRankingModal: React.FC<CandidateRankingModalProps> = ({
  isOpen,
  onClose,
  staffingRequest,
  onSelectCandidate
}) => {
  const [candidates, setCandidates] = useState<PersonFit[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<PersonFit | null>(null);
  const [showRateDetails, setShowRateDetails] = useState<number | null>(null);

  // Mock data for demonstration
  const mockCandidates: PersonFit[] = [
    {
      person_id: 1,
      fit_score: 0.92,
      reasons: [
        { code: 'HARD_SKILL_MATCH', detail: 'Expert Python (5/5) matches requirement exactly', contribution: 0.35, evidence: { skill: 'Python', required: 5, actual: 5 } },
        { code: 'AVAILABILITY', detail: '80% available, exceeds 60% requirement', contribution: 0.15, evidence: { available: 80, required: 60 } },
        { code: 'TZ_OVERLAP', detail: '8 hours overlap with EST timezone', contribution: 0.10, evidence: { overlap_hours: 8 } },
        { code: 'RELIABILITY', detail: 'Excellent track record (95% reliability)', contribution: 0.10, evidence: { score: 0.95 } },
        { code: 'DOMAIN', detail: 'Previous FinTech experience matches client domain', contribution: 0.08, evidence: { domain: 'FinTech' } }
      ],
      modeled_rate: {
        currency: 'USD',
        base: 185,
        abs_premiums: [
          { source: 'Python Expert', amount: 15 },
          { source: 'Senior Level', amount: 25 }
        ],
        pct_premiums: [
          { source: 'Market Scarcity', percentage: 8 }
        ],
        scarcity: 1.08,
        total: 243
      },
      person: {
        name: 'Sarah Chen',
        email: 'sarah.chen@company.com',
        level: 'L4',
        timezone: 'America/New_York',
        location: 'New York, NY',
        skills: [
          { skill_id: 1, name: 'Python', level: 5, confidence: 0.95 },
          { skill_id: 2, name: 'React', level: 4, confidence: 0.88 },
          { skill_id: 3, name: 'AWS', level: 4, confidence: 0.85 }
        ],
        availability_next_2_weeks: 80,
        reliability_score: 0.95,
        performance_score: 92
      }
    },
    {
      person_id: 2,
      fit_score: 0.87,
      reasons: [
        { code: 'HARD_SKILL_MATCH', detail: 'Strong React skills (4/5), close to requirement', contribution: 0.30, evidence: { skill: 'React', required: 5, actual: 4 } },
        { code: 'AVAILABILITY', detail: '90% available, exceeds requirement significantly', contribution: 0.15, evidence: { available: 90, required: 60 } },
        { code: 'TZ_OVERLAP', detail: '6 hours overlap with EST timezone', contribution: 0.08, evidence: { overlap_hours: 6 } },
        { code: 'RELIABILITY', detail: 'Very good track record (89% reliability)', contribution: 0.09, evidence: { score: 0.89 } },
        { code: 'SOFT_SKILL_GAP', detail: 'Limited leadership experience for senior role', contribution: -0.05, evidence: { gap: 'Leadership' } }
      ],
      modeled_rate: {
        currency: 'EUR',
        base: 125,
        abs_premiums: [
          { source: 'UI/UX Design', amount: 20 }
        ],
        pct_premiums: [
          { source: 'EU Market Premium', percentage: 12 }
        ],
        scarcity: 1.12,
        total: 162
      },
      person: {
        name: 'Elena Rodriguez',
        email: 'elena.rodriguez@company.com',
        level: 'L3',
        timezone: 'Europe/Madrid',
        location: 'Madrid, Spain',
        skills: [
          { skill_id: 7, name: 'UI/UX Design', level: 5, confidence: 0.93 },
          { skill_id: 8, name: 'Figma', level: 5, confidence: 0.95 },
          { skill_id: 9, name: 'User Research', level: 4, confidence: 0.87 }
        ],
        availability_next_2_weeks: 90,
        reliability_score: 0.89,
        performance_score: 88
      }
    },
    {
      person_id: 3,
      fit_score: 0.81,
      reasons: [
        { code: 'HARD_SKILL_MATCH', detail: 'Good Python skills (4/5), slightly below optimal', contribution: 0.28, evidence: { skill: 'Python', required: 5, actual: 4 } },
        { code: 'AVAILABILITY', detail: '100% available, maximum availability', contribution: 0.15, evidence: { available: 100, required: 60 } },
        { code: 'TZ_OVERLAP', detail: '4 hours overlap with EST timezone', contribution: 0.06, evidence: { overlap_hours: 4 } },
        { code: 'RELIABILITY', detail: 'Good track record (91% reliability)', contribution: 0.09, evidence: { score: 0.91 } },
        { code: 'CONTINUITY', detail: 'No existing client relationships for fresh perspective', contribution: 0.03, evidence: { fresh_perspective: true } }
      ],
      modeled_rate: {
        currency: 'USD',
        base: 95,
        abs_premiums: [
          { source: 'Machine Learning', amount: 30 }
        ],
        pct_premiums: [
          { source: 'High Demand Skills', percentage: 15 }
        ],
        scarcity: 1.15,
        total: 144
      },
      person: {
        name: 'David Kim',
        email: 'david.kim@company.com',
        level: 'L2',
        timezone: 'Asia/Seoul',
        location: 'Seoul, South Korea',
        skills: [
          { skill_id: 10, name: 'Machine Learning', level: 4, confidence: 0.85 },
          { skill_id: 11, name: 'Python', level: 4, confidence: 0.88 },
          { skill_id: 12, name: 'TensorFlow', level: 3, confidence: 0.75 }
        ],
        availability_next_2_weeks: 100,
        reliability_score: 0.91,
        performance_score: 85
      }
    }
  ];

  useEffect(() => {
    if (isOpen && staffingRequest) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setCandidates(mockCandidates);
        setLoading(false);
      }, 1000);
    }
  }, [isOpen, staffingRequest]);

  const getReasonIcon = (code: FitReason['code']) => {
    switch (code) {
      case 'HARD_SKILL_MATCH': return <Brain className="text-emerald-400" size={16} />;
      case 'SOFT_SKILL_GAP': return <AlertCircle className="text-amber-400" size={16} />;
      case 'AVAILABILITY': return <Clock className="text-blue-400" size={16} />;
      case 'TZ_OVERLAP': return <Globe className="text-purple-400" size={16} />;
      case 'DOMAIN': return <Briefcase className="text-cyan-400" size={16} />;
      case 'RELIABILITY': return <Shield className="text-green-400" size={16} />;
      case 'CONTINUITY': return <TrendingUp className="text-orange-400" size={16} />;
    }
  };

  const getContributionColor = (contribution: number) => {
    if (contribution > 0.1) return 'text-emerald-400';
    if (contribution > 0) return 'text-blue-400';
    if (contribution > -0.05) return 'text-amber-400';
    return 'text-red-400';
  };

  const getFitScoreColor = (score: number) => {
    if (score >= 0.9) return 'from-emerald-500 to-green-500';
    if (score >= 0.8) return 'from-[#4997D0] to-blue-500';
    if (score >= 0.7) return 'from-amber-500 to-yellow-500';
    return 'from-red-500 to-rose-500';
  };

  const handleSelectCandidate = (candidate: PersonFit) => {
    setSelectedCandidate(candidate);
    onSelectCandidate(candidate.person_id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-zinc-950 border-zinc-800">
        <div className="bg-gradient-to-r from-[#4997D0]/10 to-cyan-500/10 border border-[#4997D0]/20 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                <Brain className="text-[#4997D0]" size={28} />
                AI Candidate Ranking
              </h2>
              <p className="text-zinc-400">
                {staffingRequest ? `For "${staffingRequest.title}" • ${staffingRequest.role}` : 'Select the best candidate for your staffing request'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-zinc-400 hover:text-white"
            >
              <X size={20} />
            </Button>
          </div>
          
          {staffingRequest && (
            <div className="flex gap-4 mt-4">
              <span className="px-3 py-1 bg-zinc-800/50 text-zinc-300 text-sm rounded-lg border border-zinc-700">
                <Calendar className="mr-1" size={12} />
                {new Date(staffingRequest.start_date).toLocaleDateString()} - {new Date(staffingRequest.end_date).toLocaleDateString()}
              </span>
              <Badge variant={staffingRequest.urgency === 'Critical' || staffingRequest.urgency === 'High' ? 'muted' : 'success'}>
                {staffingRequest.urgency} Priority
              </Badge>
              <span className="px-3 py-1 bg-zinc-800/50 text-zinc-300 text-sm rounded-lg border border-zinc-700">
                <DollarSign className="mr-1" size={12} />
                ${staffingRequest.budget.toLocaleString()} budget
              </span>
            </div>
          )}
        </div>

        <DialogBody className="overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-[#4997D0] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-zinc-400">Analyzing candidates with AI...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {candidates.map((candidate, index) => (
                <div 
                  key={candidate.person_id}
                  className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-6 hover:border-[#4997D0]/30 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#4997D0] via-blue-500 to-cyan-500 p-[2px] shadow-lg shadow-[#4997D0]/20">
                          <div className="w-full h-full bg-zinc-900 rounded-xl flex items-center justify-center">
                            <span className="text-lg font-bold text-white">
                              {candidate.person.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        </div>
                        <div className="absolute -top-2 -right-2 bg-zinc-950 rounded-full p-1">
                          <div className="text-xs font-bold text-[#4997D0] bg-[#4997D0]/10 border border-[#4997D0]/20 rounded-full px-2 py-1">
                            #{index + 1}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">{candidate.person.name}</h3>
                        <p className="text-zinc-400 text-sm mb-2">{candidate.person.email}</p>
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-sm rounded border border-purple-500/20">
                            {candidate.person.level}
                          </span>
                          <div className="flex items-center gap-1 text-zinc-400 text-sm">
                            <Globe size={12} />
                            {candidate.person.location}
                          </div>
                          <div className="flex items-center gap-1 text-zinc-400 text-sm">
                            <Clock size={12} />
                            {candidate.person.availability_next_2_weeks}% available
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-sm text-zinc-400">FitScore</div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r ${getFitScoreColor(candidate.fit_score)} rounded-full transition-all duration-1000`}
                              style={{ width: `${candidate.fit_score * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-white font-bold text-lg min-w-[3rem]">
                            {Math.round(candidate.fit_score * 100)}%
                          </span>
                        </div>
                      </div>
                      
                      {candidate.modeled_rate && (
                        <div className="text-right">
                          <div className="text-sm text-zinc-400 mb-1">Estimated Rate</div>
                          <div className="text-white font-bold text-lg">
                            {candidate.modeled_rate.currency === 'USD' ? '$' : candidate.modeled_rate.currency === 'EUR' ? '€' : '£'}{candidate.modeled_rate.total}/hr
                          </div>
                          <button
                            onClick={() => setShowRateDetails(showRateDetails === candidate.person_id ? null : candidate.person_id)}
                            className="text-xs text-[#4997D0] hover:text-cyan-400 transition-colors"
                          >
                            {showRateDetails === candidate.person_id ? 'Hide' : 'Show'} breakdown
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                      <Brain size={14} />
                      Key Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {candidate.person.skills.map((skill) => (
                        <span 
                          key={skill.skill_id}
                          className={`px-3 py-1 bg-zinc-700/50 rounded-lg text-sm ${
                            skill.level >= 4 ? 'text-emerald-400' : skill.level >= 3 ? 'text-[#4997D0]' : 'text-amber-400'
                          }`}
                        >
                          {skill.name} ({skill.level}/5)
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Rate Breakdown */}
                  {showRateDetails === candidate.person_id && candidate.modeled_rate && (
                    <div className="mb-4 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/30">
                      <h4 className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
                        <DollarSign size={14} />
                        Rate Breakdown
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Base Rate</span>
                          <span className="text-white font-medium">
                            {candidate.modeled_rate.currency === 'USD' ? '$' : candidate.modeled_rate.currency === 'EUR' ? '€' : '£'}{candidate.modeled_rate.base}
                          </span>
                        </div>
                        {candidate.modeled_rate?.abs_premiums.map((premium, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span className="text-zinc-400">+ {premium.source}</span>
                            <span className="text-emerald-400">+{candidate.modeled_rate?.currency === 'USD' ? '$' : candidate.modeled_rate?.currency === 'EUR' ? '€' : '£'}{premium.amount}</span>
                          </div>
                        ))}
                        {candidate.modeled_rate?.pct_premiums.map((premium, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span className="text-zinc-400">× {premium.source} ({premium.percentage}%)</span>
                            <span className="text-blue-400">×{(premium.percentage / 100 + 1).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="border-t border-zinc-700 pt-2 mt-2">
                          <div className="flex justify-between font-medium">
                            <span className="text-white">Total Rate</span>
                            <span className="text-white text-lg">
                              {candidate.modeled_rate.currency === 'USD' ? '$' : candidate.modeled_rate.currency === 'EUR' ? '€' : '£'}{candidate.modeled_rate.total}/hr
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fit Reasons */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
                      <Target size={14} />
                      AI Analysis & Reasoning
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {candidate.reasons.map((reason, idx) => (
                        <div 
                          key={idx}
                          className="flex items-start gap-3 p-3 bg-zinc-800/20 rounded-lg border border-zinc-700/30"
                        >
                          <div className="mt-0.5">
                            {getReasonIcon(reason.code)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                                {reason.code.replace('_', ' ')}
                              </span>
                              <span className={`text-xs font-bold ${getContributionColor(reason.contribution)}`}>
                                {reason.contribution > 0 ? '+' : ''}{Math.round(reason.contribution * 100)}%
                              </span>
                            </div>
                            <p className="text-sm text-zinc-300">{reason.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                    <div className="flex items-center gap-4 text-sm text-zinc-400">
                      <div className="flex items-center gap-1">
                        <Shield size={14} />
                        <span>Reliability: {Math.round(candidate.person.reliability_score * 100)}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={14} />
                        <span>Performance: {candidate.person.performance_score}%</span>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => handleSelectCandidate(candidate)}
                      className="bg-gradient-to-r from-[#4997D0] to-cyan-500 hover:shadow-lg hover:shadow-[#4997D0]/30 transition-all"
                    >
                      <span className="flex items-center gap-2">
                        Select Candidate
                        <ArrowRight size={16} />
                      </span>
                    </Button>
                  </div>
                </div>
              ))}

              {candidates.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-zinc-400 mb-2">No candidates found</h3>
                  <p className="text-zinc-500">Try adjusting your requirements or search criteria</p>
                </div>
              )}
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};
