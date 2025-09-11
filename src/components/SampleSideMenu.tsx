import React, { useState } from 'react';
import { 
  Trophy, 
  Heart, 
  Target, 
  Crown,
  TrendingUp, 
  Users, 
  BarChart3, 
  Settings, 
  Bell,
  Star,
  Shield,
  Zap
} from 'lucide-react';

const SampleSideMenu: React.FC = () => {
  const [activeItem, setActiveItem] = useState('performance');

  const menuItems = [
    { 
      id: 'performance', 
      icon: Trophy, 
      label: 'Performance Score',
      value: '98.5',
      status: 'active',
      color: 'emerald'
    },
    { 
      id: 'engagement', 
      icon: Heart, 
      label: 'User Engagement',
      value: '87%',
      status: 'warning',
      color: 'amber'
    },
    { 
      id: 'success', 
      icon: Target, 
      label: 'Success Rate',
      value: '94.2%',
      status: 'normal',
      color: 'blue'
    },
    { 
      id: 'quality', 
      icon: Crown, 
      label: 'Quality Index',
      value: '9.8/10',
      status: 'premium',
      color: 'purple'
    },
  ];

  const getCardStyle = (color: string, isActive: boolean) => {
    const baseStyle = "relative overflow-hidden backdrop-blur-sm border transition-all duration-300 cursor-pointer group";
    
    if (isActive) {
      switch (color) {
        case 'emerald': return `${baseStyle} bg-emerald-500/10 border-emerald-400/30 shadow-emerald-500/20 shadow-lg`;
        case 'amber': return `${baseStyle} bg-amber-500/10 border-amber-400/30 shadow-amber-500/20 shadow-lg`;
        case 'blue': return `${baseStyle} bg-blue-500/10 border-blue-400/30 shadow-blue-500/20 shadow-lg`;
        case 'purple': return `${baseStyle} bg-purple-500/10 border-purple-400/30 shadow-purple-500/20 shadow-lg`;
        default: return `${baseStyle} bg-zinc-700/20 border-zinc-600/30`;
      }
    }
    
    return `${baseStyle} bg-slate-800/30 border-slate-700/40 hover:bg-slate-700/40 hover:border-slate-600/50 shadow-lg hover:shadow-xl`;
  };

  const getIconStyle = (color: string, isActive: boolean) => {
    if (isActive) {
      switch (color) {
        case 'emerald': return 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300';
        case 'amber': return 'bg-amber-500/20 border-amber-400/40 text-amber-300';
        case 'blue': return 'bg-blue-500/20 border-blue-400/40 text-blue-300';
        case 'purple': return 'bg-purple-500/20 border-purple-400/40 text-purple-300';
        default: return 'bg-zinc-600/30 border-zinc-500/40 text-zinc-300';
      }
    }
    return 'bg-slate-700/50 border-slate-600/50 text-slate-300 group-hover:bg-slate-600/60 group-hover:text-slate-200';
  };

  const getStatusDot = (color: string, isActive: boolean) => {
    if (isActive) {
      switch (color) {
        case 'emerald': return 'bg-emerald-400';
        case 'amber': return 'bg-amber-400';
        case 'blue': return 'bg-blue-400';
        case 'purple': return 'bg-purple-400';
        default: return 'bg-zinc-400';
      }
    }
    return 'bg-slate-500';
  };

  const getValueStyle = (color: string, isActive: boolean) => {
    if (isActive) {
      switch (color) {
        case 'emerald': return 'text-emerald-200';
        case 'amber': return 'text-amber-200';
        case 'blue': return 'text-blue-200';
        case 'purple': return 'text-purple-200';
        default: return 'text-white';
      }
    }
    return 'text-slate-200 group-hover:text-white';
  };

  return (
    <div className="w-80 p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-slate-300 font-medium text-sm uppercase tracking-wider mb-4">Neumorphism Design</h3>
      </div>

      {/* Menu Cards */}
      <div className="space-y-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          
          return (
            <div
              key={item.id}
              onClick={() => setActiveItem(item.id)}
              className={`${getCardStyle(item.color, isActive)} rounded-2xl p-6`}
              style={{
                background: isActive 
                  ? `linear-gradient(145deg, rgba(51, 65, 85, 0.8), rgba(30, 41, 59, 0.9))`
                  : `linear-gradient(145deg, rgba(51, 65, 85, 0.4), rgba(30, 41, 59, 0.6))`,
                boxShadow: isActive
                  ? `
                    inset 8px 8px 16px rgba(15, 23, 42, 0.8),
                    inset -8px -8px 16px rgba(71, 85, 105, 0.3),
                    0 10px 30px rgba(0, 0, 0, 0.4)
                  `
                  : `
                    8px 8px 16px rgba(15, 23, 42, 0.6),
                    -8px -8px 16px rgba(71, 85, 105, 0.1)
                  `
              }}
            >
              {/* Status indicator */}
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${getIconStyle(item.color, isActive)}`}
                     style={{
                       boxShadow: isActive
                         ? `inset 4px 4px 8px rgba(15, 23, 42, 0.6), inset -4px -4px 8px rgba(71, 85, 105, 0.2)`
                         : `4px 4px 8px rgba(15, 23, 42, 0.4), -4px -4px 8px rgba(71, 85, 105, 0.1)`
                     }}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <div className="flex flex-col items-end">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">STATUS</span>
                  <div className={`w-2 h-2 rounded-full ${getStatusDot(item.color, isActive)} ${isActive ? 'animate-pulse' : ''}`}></div>
                </div>
              </div>

              {/* Content */}
              <div>
                <div className={`text-3xl font-bold mb-2 ${getValueStyle(item.color, isActive)}`}>
                  {item.value}
                </div>
                <div className="text-slate-400 text-sm font-medium">
                  {item.label}
                </div>
              </div>

              {/* Subtle glow effect for active items */}
              {isActive && (
                <div 
                  className="absolute inset-0 rounded-2xl opacity-20 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${
                      item.color === 'emerald' ? 'rgba(16, 185, 129, 0.3)' :
                      item.color === 'amber' ? 'rgba(245, 158, 11, 0.3)' :
                      item.color === 'blue' ? 'rgba(59, 130, 246, 0.3)' :
                      item.color === 'purple' ? 'rgba(168, 85, 247, 0.3)' :
                      'rgba(120, 119, 198, 0.3)'
                    }, transparent 70%)`
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-8">
        <div 
          className="rounded-2xl p-6 border border-slate-700/40 backdrop-blur-sm transition-all duration-300 hover:border-slate-600/50"
          style={{
            background: `linear-gradient(145deg, rgba(51, 65, 85, 0.4), rgba(30, 41, 59, 0.6))`,
            boxShadow: `
              8px 8px 16px rgba(15, 23, 42, 0.6),
              -8px -8px 16px rgba(71, 85, 105, 0.1)
            `
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-10 h-10 rounded-lg border border-purple-400/40 bg-purple-500/20 flex items-center justify-center text-purple-300"
              style={{
                boxShadow: `inset 4px 4px 8px rgba(15, 23, 42, 0.6), inset -4px -4px 8px rgba(71, 85, 105, 0.2)`
              }}
            >
              <Crown className="w-5 h-5" />
            </div>
            <span className="text-slate-200 font-medium">Upgrade to Pro</span>
          </div>
          <p className="text-slate-400 text-sm mb-4">Unlock advanced analytics and premium neumorphic design features</p>
          <button 
            className="w-full py-3 rounded-xl font-medium text-white transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: `linear-gradient(145deg, rgba(168, 85, 247, 0.8), rgba(139, 92, 246, 0.9))`,
              boxShadow: `
                4px 4px 12px rgba(15, 23, 42, 0.6),
                -2px -2px 8px rgba(168, 85, 247, 0.2),
                inset 1px 1px 2px rgba(255, 255, 255, 0.1)
              `
            }}
          >
            Get Premium
          </button>
        </div>
      </div>
    </div>
  );
};

export default SampleSideMenu;
