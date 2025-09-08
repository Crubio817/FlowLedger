import React from 'react';
import { 
  Brain,
  Star,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Info
} from 'lucide-react';

interface PersonSkill {
  skill_id: number;
  name: string;
  level: number; // 1-5
  last_used_at?: string;
  confidence: number; // 0-1
  category: string;
}

interface SkillsChartProps {
  skills: PersonSkill[];
  personName?: string;
  className?: string;
}

export const SkillsChart: React.FC<SkillsChartProps> = ({
  skills,
  personName,
  className = ''
}) => {
  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, PersonSkill[]>);

  const getSkillLevelColor = (level: number) => {
    if (level >= 4) return 'from-emerald-500 to-green-500';
    if (level >= 3) return 'from-[#4997D0] to-blue-500';
    if (level >= 2) return 'from-amber-500 to-yellow-500';
    return 'from-red-500 to-rose-500';
  };

  const getSkillLevelText = (level: number) => {
    switch (level) {
      case 5: return 'Expert';
      case 4: return 'Advanced';
      case 3: return 'Intermediate';
      case 2: return 'Beginner';
      case 1: return 'Novice';
      default: return 'Unknown';
    }
  };

  const getRecencyColor = (lastUsed?: string) => {
    if (!lastUsed) return 'text-zinc-500';
    const daysSince = Math.floor((Date.now() - new Date(lastUsed).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince <= 7) return 'text-emerald-400';
    if (daysSince <= 30) return 'text-[#4997D0]';
    if (daysSince <= 90) return 'text-amber-400';
    return 'text-red-400';
  };

  const getRecencyText = (lastUsed?: string) => {
    if (!lastUsed) return 'Never used';
    const daysSince = Math.floor((Date.now() - new Date(lastUsed).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince === 0) return 'Used today';
    if (daysSince === 1) return 'Used yesterday';
    if (daysSince <= 7) return `${daysSince} days ago`;
    if (daysSince <= 30) return `${Math.floor(daysSince / 7)} weeks ago`;
    if (daysSince <= 365) return `${Math.floor(daysSince / 30)} months ago`;
    return `${Math.floor(daysSince / 365)} years ago`;
  };

  const getRecencyIcon = (lastUsed?: string) => {
    if (!lastUsed) return <Minus size={12} />;
    const daysSince = Math.floor((Date.now() - new Date(lastUsed).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince <= 30) return <TrendingUp size={12} />;
    if (daysSince <= 90) return <Minus size={12} />;
    return <TrendingDown size={12} />;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Programming': 'border-emerald-500/30 bg-emerald-500/5',
      'Frontend': 'border-blue-500/30 bg-blue-500/5',
      'Backend': 'border-purple-500/30 bg-purple-500/5',
      'Cloud': 'border-cyan-500/30 bg-cyan-500/5',
      'AI/ML': 'border-amber-500/30 bg-amber-500/5',
      'Design': 'border-pink-500/30 bg-pink-500/5',
      'Business': 'border-orange-500/30 bg-orange-500/5',
      'Security': 'border-red-500/30 bg-red-500/5',
      'Tools': 'border-zinc-500/30 bg-zinc-500/5',
      'Management': 'border-indigo-500/30 bg-indigo-500/5'
    };
    return colors[category as keyof typeof colors] || 'border-zinc-500/30 bg-zinc-500/5';
  };

  if (skills.length === 0) {
    return (
      <div className={`bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-6 ${className}`}>
        <div className="text-center py-8">
          <Brain className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-400 mb-2">No skills data</h3>
          <p className="text-zinc-500">Skills information will appear here when available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Brain className="text-[#4997D0]" size={20} />
          Skills Proficiency {personName && `• ${personName}`}
        </h3>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Info size={14} />
          <span>Confidence • Recency • Level</span>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
          <div key={category} className={`border rounded-lg p-4 ${getCategoryColor(category)}`}>
            <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wide">
              {category}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categorySkills.map((skill) => (
                <div key={skill.skill_id} className="bg-zinc-900/50 border border-zinc-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-white">{skill.name}</h5>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-zinc-800 rounded text-zinc-300">
                        {getSkillLevelText(skill.level)}
                      </span>
                    </div>
                  </div>

                  {/* Skill Level Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                      <span>Proficiency Level</span>
                      <span>{skill.level}/5</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${getSkillLevelColor(skill.level)} rounded-full transition-all duration-1000`}
                        style={{ width: `${(skill.level / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Confidence Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                      <span>Confidence</span>
                      <span>{Math.round(skill.confidence * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-zinc-600 to-zinc-400 rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${skill.confidence * 100}%`,
                          opacity: skill.confidence
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Last Used */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Last used</span>
                    <div className={`flex items-center gap-1 ${getRecencyColor(skill.last_used_at)}`}>
                      {getRecencyIcon(skill.last_used_at)}
                      <span>{getRecencyText(skill.last_used_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Skills Summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/30">
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-400 mb-1">
            {skills.filter(s => s.level >= 4).length}
          </div>
          <div className="text-xs text-zinc-400">Expert Skills</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[#4997D0] mb-1">
            {Math.round(skills.reduce((sum, s) => sum + s.confidence, 0) / skills.length * 100)}%
          </div>
          <div className="text-xs text-zinc-400">Avg Confidence</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-400 mb-1">
            {skills.filter(s => s.last_used_at && Math.floor((Date.now() - new Date(s.last_used_at).getTime()) / (1000 * 60 * 60 * 24)) <= 30).length}
          </div>
          <div className="text-xs text-zinc-400">Recent Skills</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400 mb-1">
            {Object.keys(skillsByCategory).length}
          </div>
          <div className="text-xs text-zinc-400">Categories</div>
        </div>
      </div>
    </div>
  );
};
