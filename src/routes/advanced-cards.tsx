import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Zap, 
  Flame, 
  Star,
  Heart,
  Crown,
  Diamond,
  Gem,
  Rocket,
  Trophy,
  Target,
  Eye,
  Brain,
  Shield,
  Globe
} from 'lucide-react';
import { PageTitleEditorial } from '../components/PageTitles.tsx';

const AdvancedCardsRoute: React.FC = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedValue(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Holographic Cards
  const HolographicCard = ({ title, value, icon: Icon, gradient, index }: any) => (
    <div 
      className="relative group cursor-pointer"
      onMouseEnter={() => setHoveredCard(index)}
      onMouseLeave={() => setHoveredCard(null)}
    >
      {/* Holographic effect background */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
        style={{
          background: `conic-gradient(from 0deg, ${gradient[0]}, ${gradient[1]}, ${gradient[2]}, ${gradient[0]})`
        }}
      ></div>
      
      {/* Card */}
      <div 
        className="relative rounded-2xl p-6 border transition-all duration-500 transform group-hover:scale-105"
        style={{
          background: `linear-gradient(135deg, ${gradient[0]}15, ${gradient[1]}10, ${gradient[2]}05)`,
          border: `1px solid ${gradient[0]}30`,
          boxShadow: hoveredCard === index 
            ? `0 20px 60px ${gradient[0]}40, inset 0 1px 0 rgba(255,255,255,0.2)`
            : `0 8px 32px ${gradient[0]}20`
        }}
      >
        {/* Animated particles */}
        {hoveredCard === index && (
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full opacity-60 animate-pulse"
                style={{
                  background: gradient[i % 3],
                  left: `${20 + i * 15}%`,
                  top: `${10 + i * 10}%`,
                  animationDelay: `${i * 0.2}s`
                }}
              ></div>
            ))}
          </div>
        )}
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div 
              className="p-3 rounded-xl"
              style={{ 
                background: `${gradient[0]}25`,
                boxShadow: `0 0 20px ${gradient[0]}30`
              }}
            >
              <Icon className="w-6 h-6" style={{ color: gradient[0] }} />
            </div>
            <div className="text-right">
              <div className="text-xs text-white/60 mb-1">LIVE</div>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: gradient[1] }}></div>
            </div>
          </div>
          
          <div className="text-3xl font-bold text-white mb-2" style={{ textShadow: `0 0 20px ${gradient[0]}50` }}>
            {value}
          </div>
          <div className="text-sm text-white/80">{title}</div>
        </div>
      </div>
    </div>
  );

  // Cyberpunk Cards
  const CyberpunkCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="relative group">
      {/* Glitch effect overlay */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Main card */}
      <div 
        className="relative bg-black border-2 rounded-lg p-6 transform transition-all duration-300 group-hover:skew-x-1"
        style={{ borderColor: color }}
      >
        {/* Scan lines */}
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse mt-4" style={{ animationDelay: '1s' }}></div>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse mt-8" style={{ animationDelay: '2s' }}></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="p-2 rounded border"
              style={{ 
                borderColor: color,
                boxShadow: `0 0 15px ${color}40`
              }}
            >
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div className="text-xs font-mono tracking-wider text-white/60">#{Math.floor(Math.random() * 9999)}</div>
          </div>
          
          <div className="font-mono text-2xl font-bold mb-1" style={{ color, textShadow: `0 0 10px ${color}80` }}>
            {value}
          </div>
          <div className="text-sm text-white/70 font-mono">{title}</div>
        </div>
      </div>
    </div>
  );

  // Neumorphism Cards
  const NeumorphismCard = ({ title, value, icon: Icon, color }: any) => (
    <div 
      className="rounded-3xl p-8 transition-all duration-300 hover:scale-105 cursor-pointer"
      style={{
        background: 'linear-gradient(145deg, #1e293b, #334155)',
        boxShadow: `20px 20px 60px #0f172a, -20px -20px 60px #374151, inset 0 0 20px ${color}20`
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div 
          className="p-4 rounded-2xl"
          style={{
            background: 'linear-gradient(145deg, #374151, #1e293b)',
            boxShadow: `8px 8px 16px #0f172a, -8px -8px 16px #475569, inset 0 0 10px ${color}30`
          }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400 mb-1">STATUS</div>
          <div className="w-3 h-3 rounded-full" style={{ background: color }}></div>
        </div>
      </div>
      
      <div className="text-3xl font-bold text-white mb-2">{value}</div>
      <div className="text-sm text-slate-400">{title}</div>
    </div>
  );

  // Particle Cards
  const ParticleCard = ({ title, value, icon: Icon, colors }: any) => {
    const [particles, setParticles] = useState<Array<{x: number, y: number, color: string, delay: number}>>([]);
    
    useEffect(() => {
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: colors[i % colors.length],
        delay: Math.random() * 2
      }));
      setParticles(newParticles);
    }, [colors]);

    return (
      <div className="relative group rounded-2xl p-6 bg-zinc-900/80 border border-zinc-800 overflow-hidden">
        {/* Animated particles */}
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              background: particle.color,
              animationDelay: `${particle.delay}s`,
              boxShadow: `0 0 10px ${particle.color}`
            }}
          ></div>
        ))}
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div 
              className="p-3 rounded-xl backdrop-blur-sm"
              style={{ background: `${colors[0]}20` }}
            >
              <Icon className="w-6 h-6" style={{ color: colors[0] }} />
            </div>
            <div className="flex gap-1">
              {colors.slice(0, 3).map((color: string, i: number) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{ background: color }}
                ></div>
              ))}
            </div>
          </div>
          
          <div className="text-3xl font-bold text-white mb-2">{value}</div>
          <div className="text-sm text-zinc-400">{title}</div>
        </div>
      </div>
    );
  };

  // Glass Cards with Frosted Effect
  const GlassCard = ({ title, value, icon: Icon, tint }: any) => (
    <div className="relative group">
      {/* Backdrop blur background */}
      <div className="absolute inset-0 rounded-2xl backdrop-blur-2xl bg-white/5 border border-white/10"></div>
      
      {/* Frosted overlay */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${tint}15, transparent 70%)`
        }}
      ></div>
      
      {/* Card content */}
      <div className="relative p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div 
            className="px-2 py-1 rounded-full text-xs font-medium bg-white/10 backdrop-blur-sm"
            style={{ color: tint }}
          >
            LIVE
          </div>
        </div>
        
        <div className="text-3xl font-bold text-white mb-2">{value}</div>
        <div className="text-sm text-white/70">{title}</div>
      </div>
    </div>
  );

  // New: Parallax hover 3D card
  const ParallaxHoverCard: React.FC = () => {
    const [style, setStyle] = useState<React.CSSProperties>({});
    const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width; // 0..1
      const y = (e.clientY - rect.top) / rect.height; // 0..1
      const rx = (0.5 - y) * 10; // rotateX
      const ry = (x - 0.5) * 10; // rotateY
      setStyle({ transform: `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)` });
    };
    const onLeave = () => setStyle({ transform: 'rotateX(0deg) rotateY(0deg)' });
    return (
      <div className="[perspective:1000px]">
        <div
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          className="relative rounded-2xl p-6 border border-indigo-500/30 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 shadow-lg [transform-style:preserve-3d] transition-transform duration-150"
          style={style}
        >
          <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ boxShadow: 'inset 0 0 40px rgba(99,102,241,0.35)' }} />
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-5 h-5 text-indigo-300" />
            <h4 className="text-white font-semibold">Parallax Hover</h4>
          </div>
          <p className="text-sm text-zinc-300">Move your mouse to tilt the card in 3D.</p>
        </div>
      </div>
    );
  };

  // New: Swipe-to-reveal actions card
  const SwipeRevealCard: React.FC = () => {
    const [x, setX] = useState(0);
    const startRef = React.useRef<number | null>(null);
    const onDown = (clientX: number) => { startRef.current = clientX; };
    const onMove = (clientX: number) => {
      if (startRef.current == null) return;
      const dx = Math.min(120, Math.max(0, startRef.current - clientX));
      setX(dx);
    };
    const onUp = () => {
      if (startRef.current == null) return;
      setX(prev => (prev > 60 ? 120 : 0));
      startRef.current = null;
    };
    return (
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
        {/* Actions */}
        <div className="absolute inset-y-0 right-0 w-28 grid grid-rows-2">
          <button className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm">Edit</button>
          <button className="bg-rose-600 hover:bg-rose-500 text-white text-sm">Delete</button>
        </div>
        {/* Content layer */}
        <div
          className="relative p-5 transition-transform select-none touch-pan-x"
          style={{ transform: `translateX(-${x}px)` }}
          onMouseDown={e => onDown(e.clientX)}
          onMouseMove={e => onMove(e.clientX)}
          onMouseUp={onUp}
          onMouseLeave={onUp}
          onTouchStart={e => onDown(e.touches[0].clientX)}
          onTouchMove={e => onMove(e.touches[0].clientX)}
          onTouchEnd={onUp}
        >
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-teal-400" />
            <div>
              <div className="text-white font-semibold">Swipe Actions</div>
              <div className="text-sm text-zinc-400">Drag left to reveal Edit/Delete</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // New: Expandable details card
  const ExpandableDetailsCard: React.FC = () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60">
        <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-amber-400" />
            <span className="text-white font-semibold">Expandable Details</span>
          </div>
          <span className="text-sm text-zinc-400">{open ? 'Hide' : 'Show'}</span>
        </button>
        <div className={`grid transition-[grid-template-rows] duration-300 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'} px-5`}> 
          <div className="overflow-hidden">
            <div className="pb-5 text-sm text-zinc-300">
              Additional details, metrics, and context appear here. This block smoothly expands and collapses without affecting other layout sections.
            </div>
          </div>
        </div>
      </div>
    );
  };

  const holographicData = [
    { title: 'Neural Network', value: '99.7%', icon: Brain, gradient: ['#ff006e', '#8338ec', '#3a86ff'], index: 0 },
    { title: 'Quantum Core', value: '∞', icon: Zap, gradient: ['#06ffa5', '#00d2ff', '#7209b7'], index: 1 },
    { title: 'Energy Field', value: '2.4MW', icon: Flame, gradient: ['#ff9500', '#ff0040', '#ff006e'], index: 2 },
    { title: 'Star Rating', value: '5.0★', icon: Star, gradient: ['#ffbe0b', '#fb8500', '#ff006e'], index: 3 },
  ];

  const cyberpunkData = [
    { title: 'SYSTEM_STATUS', value: 'ONLINE', icon: Shield, color: '#00ff00' },
    { title: 'NET_TRAFFIC', value: '2.4TB/s', icon: Globe, color: '#00ffff' },
    { title: 'CPU_CORES', value: '64x', icon: Zap, color: '#ff0080' },
    { title: 'SECURITY_LVL', value: 'MAX', icon: Eye, color: '#ffff00' },
  ];

  const neumorphismData = [
    { title: 'Performance Score', value: '98.5', icon: Trophy, color: '#10b981' },
    { title: 'User Engagement', value: '87%', icon: Heart, color: '#f59e0b' },
    { title: 'Success Rate', value: '94.2%', icon: Target, color: '#3b82f6' },
    { title: 'Quality Index', value: '9.8/10', icon: Crown, color: '#8b5cf6' },
  ];

  const particleData = [
    { title: 'Cosmic Energy', value: '∞', icon: Sparkles, colors: ['#ff006e', '#8338ec', '#3a86ff'] },
    { title: 'Stardust Collection', value: '2.4M', icon: Diamond, colors: ['#06ffa5', '#00d2ff', '#7209b7'] },
    { title: 'Galaxy Rating', value: '5★', icon: Star, colors: ['#ffbe0b', '#fb8500', '#ff006e'] },
    { title: 'Nebula Index', value: '99.9%', icon: Gem, colors: ['#ff9500', '#ff0040', '#ff006e'] },
  ];

  const glassData = [
    { title: 'Transparency Index', value: '95%', icon: Eye, tint: '#06b6d4' },
    { title: 'Clarity Score', value: '9.8', icon: Diamond, tint: '#8b5cf6' },
    { title: 'Reflection Rate', value: '87%', icon: Sparkles, tint: '#10b981' },
    { title: 'Luminosity', value: '2.4K', icon: Star, tint: '#f59e0b' },
  ];

  return (
    <div className="p-6 space-y-12">
      <PageTitleEditorial
        eyebrow="Next-Gen Design"
        title="Advanced Card Gallery"
        subtitle="Cutting-edge card designs with advanced effects and animations"
      />

      {/* Holographic Cards */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Holographic Effects</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {holographicData.map((item) => (
            <HolographicCard key={item.index} {...item} />
          ))}
        </div>
      </section>

      {/* Cyberpunk Cards */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-green-500/20 border border-cyan-500/30">
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Cyberpunk Style</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cyberpunkData.map((item, index) => (
            <CyberpunkCard key={index} {...item} />
          ))}
        </div>
      </section>

      {/* Neumorphism Cards */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-r from-slate-500/20 to-gray-500/20 border border-slate-500/30">
            <Crown className="w-5 h-5 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Neumorphism Design</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {neumorphismData.map((item, index) => (
            <NeumorphismCard key={index} {...item} />
          ))}
        </div>
      </section>

      {/* Particle Effect Cards */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
            <Flame className="w-5 h-5 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Particle Effects</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {particleData.map((item, index) => (
            <ParticleCard key={index} {...item} />
          ))}
        </div>
      </section>

      {/* Glass Morphism Cards */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
            <Diamond className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Glass Morphism</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {glassData.map((item, index) => (
            <GlassCard key={index} {...item} />
          ))}
        </div>
      </section>

      {/* Animated Progress Cards */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
            <Rocket className="w-5 h-5 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Animated Progress</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Circular Progress */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Circular Progress</h3>
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#374151"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#10b981"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${animatedValue * 2.51} 251`}
                  className="transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{animatedValue}%</span>
              </div>
            </div>
          </div>

          {/* Wave Progress */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Wave Progress</h3>
            <div className="relative h-32 bg-zinc-800 rounded-xl overflow-hidden">
              <div 
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-500 to-blue-500 transition-all duration-300"
                style={{ height: `${animatedValue}%` }}
              >
                <div className="absolute top-0 left-0 right-0 h-4 bg-white/20 animate-pulse"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-white z-10">{animatedValue}%</span>
              </div>
            </div>
          </div>

          {/* Segmented Progress */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Segmented Progress</h3>
            <div className="space-y-3">
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    i < animatedValue / 10 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                      : 'bg-zinc-700'
                  }`}
                ></div>
              ))}
            </div>
            <div className="text-center mt-4">
              <span className="text-xl font-bold text-white">{Math.floor(animatedValue / 10)}/10</span>
            </div>
          </div>
        </div>
      </section>

      {/* New: Interactive Cards */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
            <Brain className="w-5 h-5 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Interactive Cards</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ParallaxHoverCard />
          <SwipeRevealCard />
          <ExpandableDetailsCard />
        </div>
      </section>
    </div>
  );
};

export default AdvancedCardsRoute;
