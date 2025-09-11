import React, { useState } from 'react';
import { Target, Eye, X, Copy, Trash2, TrendingUp, BarChart3 } from 'lucide-react';
import type { Spotlight } from '../services/spotlight.types.ts';

interface SpotlightProfilesGalleryProps {
  spotlights?: Spotlight[];
  onSpotlightSelect?: (spotlight: Spotlight) => void;
  onSpotlightClose?: (spotlight: Spotlight) => void;
  onSpotlightClone?: (spotlight: Spotlight) => void;
  onSpotlightDelete?: (spotlight: Spotlight) => void;
  className?: string;
}

const SpotlightProfilesGallery: React.FC<SpotlightProfilesGalleryProps> = ({
  spotlights = [],
  onSpotlightSelect,
  onSpotlightClose,
  onSpotlightClone,
  onSpotlightDelete,
  className = '',
}) => {
  const [showCloseConfirm, setShowCloseConfirm] = useState<Spotlight | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Spotlight | null>(null);
  // Fallback demo data if no spotlights provided
  const defaultProfiles = [
    {
      id: 1,
      name: 'This is a test',
      domain: 'tech',
      description: 'this is just a test',
      evaluations: 0,
      avgMatch: 'NaN%',
      status: 'draft',
      lastUsed: 'Never',
      color: 'cyan'
    },
    {
      id: 2,
      name: 'Enterprise SaaS Companies',
      domain: 'saas',
      description: 'Large enterprise software companies with 500+ employees',
      evaluations: 127,
      avgMatch: '84%',
      status: 'active',
      lastUsed: '2 hours ago',
      color: 'emerald'
    },
    {
      id: 3,
      name: 'Early Stage Startups',
      domain: 'startup',
      description: 'Seed to Series A startups in tech sector',
      evaluations: 45,
      avgMatch: '72%',
      status: 'active',
      lastUsed: '1 day ago',
      color: 'violet'
    }
  ];

  // Transform spotlights data to match profile structure
  const profiles = spotlights.length > 0 
    ? spotlights.map((spotlight, index) => ({
        id: spotlight.spotlight_id,
        name: spotlight.name,
        domain: spotlight.domain,
        description: spotlight.description || 'No description provided',
        evaluations: 0, // TODO: Add evaluation count from analytics
        avgMatch: 'N/A', // TODO: Add match score from analytics
        status: spotlight.active ? 'active' : 'draft',
        lastUsed: 'Recently', // TODO: Add last used tracking
        color: ['cyan', 'emerald', 'violet', 'orange'][index % 4] as string
      }))
    : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'draft': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'archived': return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
      default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };

  const getProfileColor = (color: string) => {
    const colors: Record<string, string> = {
      cyan: 'bg-cyan-500',
      emerald: 'bg-emerald-500',
      violet: 'bg-violet-500',
      orange: 'bg-orange-500'
    };
    return colors[color] || 'bg-zinc-500';
  };

  const ProfileCard = ({ profile }: { profile: any }) => {
    // Find the original spotlight data if available
    const originalSpotlight = spotlights.find(s => s.spotlight_id === profile.id);
    
    return (
      <div className="group bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-zinc-700/30 rounded-2xl p-6 transition-all duration-300 hover:transform hover:scale-[1.02] shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(255,255,255,0.02)] hover:shadow-[12px_12px_20px_rgba(0,0,0,0.5),-12px_-12px_20px_rgba(255,255,255,0.03)] h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div 
            className="flex items-center cursor-pointer flex-1 min-w-0"
            onClick={() => originalSpotlight && onSpotlightSelect?.(originalSpotlight)}
          >
            <div className={`w-11 h-11 ${getProfileColor(profile.color)} rounded-xl flex items-center justify-center mr-3 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.3)] flex-shrink-0`}>
              <Target className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-white text-lg group-hover:text-cyan-400 transition-colors duration-200 truncate">
                {profile.name}
              </h3>
              <div className="flex items-center mt-1.5 gap-2">
                <span className="text-sm text-zinc-400 truncate">{profile.domain}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs border shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.05)] ${getStatusColor(profile.status)} flex-shrink-0`}>
                  {profile.status}
                </span>
              </div>
            </div>
          </div>
          
          {/* Remove the ellipsis button completely */}
        </div>

        {/* Description */}
        <p className="text-zinc-300 text-sm mb-6 line-clamp-3 leading-relaxed flex-1">
          {profile.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-zinc-800/40 to-zinc-900/60 rounded-xl p-4 border border-zinc-700/20 shadow-[inset_3px_3px_6px_rgba(0,0,0,0.3),inset_-3px_-3px_6px_rgba(255,255,255,0.02)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-400 text-xs font-medium tracking-wider">EVALUATIONS</span>
              <div className="p-1.5 bg-zinc-700/50 rounded-lg shadow-[inset_1px_1px_2px_rgba(0,0,0,0.4),inset_-1px_-1px_2px_rgba(255,255,255,0.05)]">
                <BarChart3 className="w-3 h-3 text-zinc-400" />
              </div>
            </div>
            <p className="text-white text-lg font-bold">{profile.evaluations}</p>
          </div>
          
          <div className="bg-gradient-to-br from-zinc-800/40 to-zinc-900/60 rounded-xl p-4 border border-zinc-700/20 shadow-[inset_3px_3px_6px_rgba(0,0,0,0.3),inset_-3px_-3px_6px_rgba(255,255,255,0.02)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-400 text-xs font-medium tracking-wider">AVG MATCH</span>
              <div className="p-1.5 bg-zinc-700/50 rounded-lg shadow-[inset_1px_1px_2px_rgba(0,0,0,0.4),inset_-1px_-1px_2px_rgba(255,255,255,0.05)]">
                <TrendingUp className="w-3 h-3 text-zinc-400" />
              </div>
            </div>
            <p className={`text-lg font-bold ${profile.avgMatch === 'NaN%' ? 'text-zinc-500' : 'text-emerald-400'}`}>
              {profile.avgMatch}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-700/50">
          <div className="flex items-center gap-2">
            <button 
              className="p-2 text-zinc-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all duration-200 border border-transparent hover:border-cyan-500/20"
              title="View Profile"
              onClick={() => originalSpotlight && onSpotlightSelect?.(originalSpotlight)}
            >
              <Eye className="w-4 h-4" />
            </button>
            <button 
              className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all duration-200 border border-transparent hover:border-emerald-500/20"
              title="Clone Profile"
              onClick={() => originalSpotlight && onSpotlightClone?.(originalSpotlight)}
            >
              <Copy className="w-4 h-4" />
            </button>
            <button 
              className="p-2 text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all duration-200 border border-transparent hover:border-amber-500/20"
              title="Close Profile"
              onClick={() => originalSpotlight && setShowCloseConfirm(originalSpotlight)}
            >
              <X className="w-4 h-4" />
            </button>
            <button 
              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 border border-transparent hover:border-red-500/20"
              title="Delete Profile"
              onClick={() => originalSpotlight && setShowDeleteConfirm(originalSpotlight)}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-zinc-500 mb-1">Last used</p>
            <p className="text-xs text-zinc-400 font-medium">{profile.lastUsed}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`${className}`}>
      {profiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mb-6">
            <Target className="w-8 h-8 text-zinc-600" />
          </div>
          <h3 className="text-xl font-semibold text-zinc-400 mb-2">No Profiles Yet</h3>
          <p className="text-zinc-500 max-w-md">
            Get started by creating your first spotlight profile to begin targeting your ideal customers.
          </p>
        </div>
      ) : (
        /* Profiles Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {profiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}

      {/* Close Confirmation Modal */}
      {showCloseConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">Close Spotlight Profile</h3>
            <p className="text-zinc-400 mb-6">
              Are you sure you want to close "{showCloseConfirm.name}"? This will deactivate the profile but keep all data.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowCloseConfirm(null)}
                className="px-6 py-3 bg-zinc-800/40 hover:bg-zinc-700/40 text-zinc-300 hover:text-white rounded-lg font-medium transition-all duration-300 border border-zinc-600/30 hover:border-zinc-500/50 backdrop-blur-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onSpotlightClose?.(showCloseConfirm);
                  setShowCloseConfirm(null);
                }}
                className="px-6 py-3 bg-amber-800/40 hover:bg-amber-700/40 text-amber-300 hover:text-white rounded-lg font-medium transition-all duration-300 border border-amber-600/30 hover:border-amber-500/50 backdrop-blur-sm"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">Delete Spotlight Profile</h3>
            <p className="text-zinc-400 mb-6">
              Are you sure you want to permanently delete "{showDeleteConfirm.name}"? This action cannot be undone and will remove all associated data.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-6 py-3 bg-zinc-800/40 hover:bg-zinc-700/40 text-zinc-300 hover:text-white rounded-lg font-medium transition-all duration-300 border border-zinc-600/30 hover:border-zinc-500/50 backdrop-blur-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onSpotlightDelete?.(showDeleteConfirm);
                  setShowDeleteConfirm(null);
                }}
                className="px-6 py-3 bg-red-800/40 hover:bg-red-700/40 text-red-300 hover:text-white rounded-lg font-medium transition-all duration-300 border border-red-600/30 hover:border-red-500/50 backdrop-blur-sm"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpotlightProfilesGallery;
