import React, { useState, useEffect, useRef } from 'react';
import { 
  Gamepad2,
  Zap,
  Star,
  Heart,
  Trophy,
  Target,
  Rocket,
  Crown,
  Gem,
  Flame,
  Sparkles,
  Eye,
  Brain,
  Shield,
  Globe,
  Music,
  Volume2,
  Play,
  Pause,
  Settings,
  Download,
  Share,
  Bookmark,
  Bell,
  Search,
  Filter,
  RotateCcw,
  Maximize,
  Minimize
} from 'lucide-react';
import { PageTitleEditorial } from '../components/PageTitles.tsx';

const GamingUIRoute: React.FC = () => {
  const [health, setHealth] = useState(85);
  const [mana, setMana] = useState(60);
  const [xp, setXp] = useState(75);
  const [level, setLevel] = useState(42);
  const [score, setScore] = useState(123456);
  const [isActive, setIsActive] = useState(false);
  const [selectedWeapon, setSelectedWeapon] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setHealth(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 10)));
      setMana(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 8)));
      setXp(prev => Math.max(0, Math.min(100, prev + Math.random() * 2)));
      setScore(prev => prev + Math.floor(Math.random() * 1000));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Gaming HUD Component
  const GamingHUD = () => (
    <div className="relative bg-black/90 border-2 border-cyan-500/50 rounded-xl p-6 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
      
      {/* Scan lines */}
      <div className="absolute inset-0 opacity-20">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"
            style={{ 
              top: `${i * 5}%`,
              animationDelay: `${i * 0.1}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10">
        <h3 className="text-2xl font-bold text-cyan-400 mb-6 font-mono tracking-wider">
          GAMING HUD
        </h3>

        {/* Player Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Health Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-red-400 font-mono font-bold">HEALTH</span>
              <span className="text-white font-mono">{health}/100</span>
            </div>
            <div className="h-4 bg-zinc-800 border border-red-500/50 rounded overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500"
                style={{ width: `${health}%` }}
              >
                <div className="h-full bg-gradient-to-t from-red-700/50 to-transparent animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Mana Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-blue-400 font-mono font-bold">MANA</span>
              <span className="text-white font-mono">{mana}/100</span>
            </div>
            <div className="h-4 bg-zinc-800 border border-blue-500/50 rounded overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
                style={{ width: `${mana}%` }}
              >
                <div className="h-full bg-gradient-to-t from-blue-700/50 to-transparent animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* XP and Level */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-yellow-400 font-mono font-bold">EXPERIENCE</span>
              <span className="text-white font-mono">{xp}%</span>
            </div>
            <div className="h-3 bg-zinc-800 border border-yellow-500/50 rounded overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-700"
                style={{ width: `${xp}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-emerald-400 font-mono font-bold mb-1">LEVEL</div>
            <div className="text-4xl font-bold text-white font-mono">{level}</div>
          </div>
        </div>

        {/* Score */}
        <div className="text-center p-4 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/50 rounded-lg">
          <div className="text-purple-400 font-mono font-bold mb-1">SCORE</div>
          <div className="text-3xl font-bold text-white font-mono tracking-wider">
            {score.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );

  // Weapon Selection
  const WeaponSelector = () => {
    const weapons = [
      { name: 'Plasma Rifle', damage: 95, icon: Zap, color: '#06b6d4' },
      { name: 'Flame Thrower', damage: 87, icon: Flame, color: '#f59e0b' },
      { name: 'Laser Cannon', damage: 92, icon: Target, color: '#ef4444' },
      { name: 'Ion Blaster', damage: 89, icon: Sparkles, color: '#8b5cf6' }
    ];

    return (
      <div className="bg-zinc-900/90 border-2 border-emerald-500/50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-emerald-400 mb-4 font-mono">WEAPON SELECT</h3>
        
        <div className="grid grid-cols-2 gap-3">
          {weapons.map((weapon, index) => (
            <button
              key={index}
              onClick={() => setSelectedWeapon(index)}
              className={`p-4 rounded-lg border-2 transition-all duration-300 group ${
                selectedWeapon === index
                  ? 'border-emerald-400 bg-emerald-500/20 scale-105'
                  : 'border-zinc-700 bg-zinc-800/50 hover:border-emerald-500/50'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <weapon.icon 
                  className="w-6 h-6 group-hover:animate-pulse" 
                  style={{ color: weapon.color }}
                />
                <span className="text-white font-mono font-bold text-sm">
                  {weapon.name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-emerald-400 font-mono text-xs">DMG</span>
                <span className="text-white font-mono font-bold ml-2">{weapon.damage}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Achievement Unlocked
  const AchievementCard = ({ title, description, icon: Icon, rarity }: {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  }) => {
    const rarityColors = {
      common: '#10b981',
      rare: '#3b82f6', 
      epic: '#8b5cf6',
      legendary: '#f59e0b'
    };

    return (
      <div 
        className="relative p-6 rounded-xl border-2 bg-black/80 overflow-hidden group cursor-pointer hover:scale-105 transition-all duration-300"
        style={{ borderColor: rarityColors[rarity] }}
      >
        {/* Animated background */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500"
          style={{ background: `linear-gradient(45deg, ${rarityColors[rarity]}40, transparent)` }}
        ></div>

        {/* Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full opacity-0 group-hover:opacity-100 animate-pulse"
              style={{
                background: rarityColors[rarity],
                left: `${20 + i * 15}%`,
                top: `${10 + i * 10}%`,
                animationDelay: `${i * 0.2}s`
              }}
            ></div>
          ))}
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="p-3 rounded-lg border"
              style={{ 
                borderColor: rarityColors[rarity],
                backgroundColor: `${rarityColors[rarity]}20`
              }}
            >
              <Icon className="w-6 h-6" style={{ color: rarityColors[rarity] }} />
            </div>
            <div>
              <div 
                className="font-mono font-bold text-sm uppercase tracking-wider"
                style={{ color: rarityColors[rarity] }}
              >
                {rarity}
              </div>
              <div className="text-white font-bold">{title}</div>
            </div>
          </div>
          <p className="text-zinc-400 text-sm">{description}</p>
        </div>
      </div>
    );
  };

  // Mini Games
  const MiniGames = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white mb-4">Mini Games</h3>
      
      {/* Memory Game */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-purple-400 mb-4">Memory Match</h4>
        <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
          {Array.from({ length: 16 }, (_, i) => (
            <button
              key={i}
              className="aspect-square bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg hover:scale-105 transition-transform duration-200 flex items-center justify-center"
            >
              <Star className="w-6 h-6 text-white" />
            </button>
          ))}
        </div>
      </div>

      {/* Reaction Test */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-red-400 mb-4">Reaction Test</h4>
        <div className="text-center">
          <button
            onClick={() => setIsActive(!isActive)}
            className={`w-32 h-32 rounded-full border-4 transition-all duration-300 ${
              isActive
                ? 'bg-green-500 border-green-400 shadow-lg shadow-green-500/50 animate-pulse'
                : 'bg-red-500 border-red-400 shadow-lg shadow-red-500/50'
            }`}
          >
            <span className="text-white font-bold text-lg">
              {isActive ? 'NOW!' : 'WAIT...'}
            </span>
          </button>
          <p className="text-zinc-400 text-sm mt-4">Click when it turns green!</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 min-h-screen">
      <PageTitleEditorial
        eyebrow="Gaming Interface"
        title="Gaming UI Components"
        subtitle="Futuristic gaming interfaces with HUDs, stats, and interactive elements"
      />

      {/* Gaming HUD */}
      <section>
        <GamingHUD />
      </section>

      {/* Weapon Selector and Mini Games */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <WeaponSelector />
          <MiniGames />
        </div>
      </section>

      {/* Achievements */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Achievement Gallery</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AchievementCard
            title="First Steps"
            description="Complete your first mission"
            icon={Trophy}
            rarity="common"
          />
          <AchievementCard
            title="Speed Demon"
            description="Complete a level in under 30 seconds"
            icon={Rocket}
            rarity="rare"
          />
          <AchievementCard
            title="Master Strategist"
            description="Win 10 battles without losing health"
            icon={Crown}
            rarity="epic"
          />
          <AchievementCard
            title="Legend Born"
            description="Achieve the impossible"
            icon={Gem}
            rarity="legendary"
          />
        </div>
      </section>
    </div>
  );
};

export default GamingUIRoute;
