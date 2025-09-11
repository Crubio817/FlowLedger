import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Sparkles, 
  Zap, 
  Activity, 
  Target, 
  Eye,
  Gamepad2,
  Terminal,
  Smartphone,
  Coins
} from 'lucide-react';
import { PageTitleEditorial } from '../components/PageTitles.tsx';
import TransparentAuroraHeader from '../components/TransparentAuroraHeader.tsx';
import StandardHeader from '../components/StandardHeader.tsx';

const DashboardRoute: React.FC = () => {
  const Pills: React.FC<{ items: { label: string; to: string }[]; colorClasses?: string }> = ({ items, colorClasses = '' }) => (
    <div className="mt-4 flex flex-wrap gap-2">
      {items.map((it) => (
        <Link
          key={it.label}
          to={it.to}
          className={`text-xs font-medium rounded-full px-2.5 py-1 border transition-colors ${
            colorClasses || 'text-zinc-300 border-white/15 hover:bg-white/5'
          }`}
        >
          {it.label}
        </Link>
      ))}
    </div>
  );

  const [hue, setHue] = useState<
    'cyan' | 'purple' | 'amber' | 'emerald' | 'pink' | 'blue' | 'teal' | 'indigo' | 'violet' | 'red' | 'lime' | 'orange'
  >('cyan');

  const headerColors = useMemo(() => {
    const map: Record<typeof hue, { sweep: string; aurora1: string; aurora2: string }> = {
      cyan:    { sweep: 'rgba(6,182,212,0.25)', aurora1: 'rgba(14,165,233,0.12)', aurora2: 'rgba(56,189,248,0.10)' },
      purple:  { sweep: 'rgba(147,51,234,0.25)', aurora1: 'rgba(124,58,237,0.15)', aurora2: 'rgba(196,181,253,0.10)' },
      amber:   { sweep: 'rgba(245,158,11,0.25)', aurora1: 'rgba(217,119,6,0.12)', aurora2: 'rgba(252,211,77,0.08)' },
      emerald: { sweep: 'rgba(5,150,105,0.25)', aurora1: 'rgba(16,185,129,0.12)', aurora2: 'rgba(110,231,183,0.08)' },
      pink:    { sweep: 'rgba(219,39,119,0.25)', aurora1: 'rgba(190,24,93,0.15)', aurora2: 'rgba(251,182,206,0.08)' },
      blue:    { sweep: 'rgba(37,99,235,0.25)', aurora1: 'rgba(29,78,216,0.12)', aurora2: 'rgba(147,197,253,0.08)' },
      teal:    { sweep: 'rgba(13,148,136,0.25)', aurora1: 'rgba(15,118,110,0.12)', aurora2: 'rgba(153,246,228,0.08)' },
      indigo:  { sweep: 'rgba(79,70,229,0.25)', aurora1: 'rgba(67,56,202,0.15)', aurora2: 'rgba(199,210,254,0.08)' },
      violet:  { sweep: 'rgba(124,58,237,0.25)', aurora1: 'rgba(109,40,217,0.15)', aurora2: 'rgba(221,214,254,0.08)' },
      red:     { sweep: 'rgba(220,38,38,0.25)', aurora1: 'rgba(185,28,28,0.15)', aurora2: 'rgba(252,165,165,0.08)' },
      lime:    { sweep: 'rgba(101,163,13,0.25)', aurora1: 'rgba(77,124,15,0.15)', aurora2: 'rgba(217,249,157,0.08)' },
      orange:  { sweep: 'rgba(234,88,12,0.25)', aurora1: 'rgba(194,65,12,0.15)', aurora2: 'rgba(253,186,116,0.08)' },
    };
    return map[hue];
  }, [hue]);

  return (
    <div className="p-0" data-testid="dashboard-page">
      {/* Standardized Ethereal Aurora Header */}
      <StandardHeader
        title="Dashboard"
        subtitle="Real-time insights and key metrics for your organization"
        color={hue}
        variant="compact"
      />

      {/* Temporary light color toggle */}
      <div className="px-4 md:px-8 mt-4 mb-4 flex items-center justify-start gap-2 text-xs text-zinc-400">
        <span>Light color:</span>
        {([
          ['cyan','text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/10'],
          ['purple','text-purple-300 border-purple-500/40 hover:bg-purple-500/10'],
          ['amber','text-amber-300 border-amber-500/40 hover:bg-amber-500/10'],
          ['emerald','text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/10'],
          ['pink','text-pink-300 border-pink-500/40 hover:bg-pink-500/10'],
          ['blue','text-blue-300 border-blue-500/40 hover:bg-blue-500/10'],
          ['teal','text-teal-300 border-teal-500/40 hover:bg-teal-500/10'],
          ['indigo','text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/10'],
          ['violet','text-violet-300 border-violet-500/40 hover:bg-violet-500/10'],
          ['red','text-red-300 border-red-500/40 hover:bg-red-500/10'],
          ['lime','text-lime-300 border-lime-500/40 hover:bg-lime-500/10'],
          ['orange','text-orange-300 border-orange-500/40 hover:bg-orange-500/10'],
        ] as const).map(([key, cls]) => (
          <button
            key={key}
            onClick={() => setHue(key)}
            className={`rounded-full px-2.5 py-1 border transition-colors ${cls} ${hue===key ? 'bg-white/5' : ''}`}
          >
            {key}
          </button>
        ))}
      </div>
      <div className="mt-2 px-4">
        <div className="content-container p-8">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Dashboard coming soon...</h3>
            <p className="text-zinc-400 mb-6">In the meantime, check out our amazing component showcase!</p>
          </div>
          
          {/* Component Showcase Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link 
              to="/kpi-samples"
              className="group bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-6 hover:bg-cyan-500/20 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-cyan-500/20 border border-cyan-500/40">
                  <BarChart3 className="w-6 h-6 text-cyan-400" />
                </div>
                <h4 className="text-xl font-bold text-cyan-400">KPI Samples</h4>
              </div>
              <p className="text-cyan-300/80 text-sm mb-4">
                Collection of different KPI card designs with animations and effects
              </p>
              <div className="text-cyan-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                Explore Designs →
              </div>
              <Pills
                colorClasses="text-cyan-300 border-cyan-400/30 hover:bg-cyan-500/10"
                items={[
                  { label: 'Trends', to: '/kpi-samples?ex=trends' },
                  { label: 'Sparklines', to: '/kpi-samples?ex=spark' },
                  { label: 'Targets', to: '/kpi-samples?ex=targets' },
                  { label: 'Deltas', to: '/kpi-samples?ex=deltas' },
                  { label: 'Badges', to: '/kpi-samples?ex=badges' },
                ]}
              />
            </Link>
            
            <Link 
              to="/component-gallery"
              className="group bg-purple-500/10 border border-purple-500/30 rounded-xl p-6 hover:bg-purple-500/20 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-purple-500/20 border border-purple-500/40">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </div>
                <h4 className="text-xl font-bold text-purple-400">Component Gallery</h4>
              </div>
              <p className="text-purple-300/80 text-sm mb-4">
                Basic UI components: buttons, badges, cards, and animations
              </p>
              <div className="text-purple-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                Browse Components →
              </div>
              <Pills
                colorClasses="text-purple-300 border-purple-400/30 hover:bg-purple-500/10"
                items={[
                  { label: 'Buttons', to: '/component-gallery?tab=buttons' },
                  { label: 'Badges', to: '/component-gallery?tab=badges' },
                  { label: 'Cards', to: '/component-gallery?tab=cards' },
                  { label: 'Animations', to: '/component-gallery?tab=animations' },
                  { label: 'Overlays', to: '/component-gallery?tab=overlays' },
                ]}
              />
            </Link>

            <Link 
              to="/advanced-cards"
              className="group bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 hover:bg-emerald-500/20 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40">
                  <Zap className="w-6 h-6 text-emerald-400" />
                </div>
                <h4 className="text-xl font-bold text-emerald-400">Advanced Cards</h4>
              </div>
              <p className="text-emerald-300/80 text-sm mb-4">
                Next-gen card designs: holographic, cyberpunk, neumorphism, and more
              </p>
              <div className="text-emerald-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                See Advanced →
              </div>
              <Pills
                colorClasses="text-emerald-300 border-emerald-400/30 hover:bg-emerald-500/10"
                items={[
                  { label: 'Holographic', to: '/advanced-cards?demo=holo' },
                  { label: 'Cyberpunk', to: '/advanced-cards?demo=cyber' },
                  { label: 'Glass', to: '/advanced-cards?demo=glass' },
                  { label: 'Neumorph', to: '/advanced-cards?demo=neumorph' },
                  { label: 'Frosted', to: '/advanced-cards?demo=frosted' },
                ]}
              />
            </Link>

            <Link 
              to="/interactive-elements"
              className="group bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 hover:bg-amber-500/20 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-amber-500/20 border border-amber-500/40">
                  <Activity className="w-6 h-6 text-amber-400" />
                </div>
                <h4 className="text-xl font-bold text-amber-400">Interactive Elements</h4>
              </div>
              <p className="text-amber-300/80 text-sm mb-4">
                Media players, sliders, ratings, toggles, and interactive animations
              </p>
              <div className="text-amber-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                Play Around →
              </div>
              <Pills
                colorClasses="text-amber-300 border-amber-400/30 hover:bg-amber-500/10"
                items={[
                  { label: 'Sliders', to: '/interactive-elements?ex=sliders' },
                  { label: 'Ratings', to: '/interactive-elements?ex=ratings' },
                  { label: 'Toggles', to: '/interactive-elements?ex=toggles' },
                  { label: 'Media', to: '/interactive-elements?ex=media' },
                  { label: 'Loaders', to: '/interactive-elements?ex=loaders' },
                ]}
              />
            </Link>

            <Link 
              to="/data-visualization"
              className="group bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 hover:bg-blue-500/20 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-500/40">
                  <Target className="w-6 h-6 text-blue-400" />
                </div>
                <h4 className="text-xl font-bold text-blue-400">Data Visualization</h4>
              </div>
              <p className="text-blue-300/80 text-sm mb-4">
                Beautiful charts: bar charts, line graphs, donut charts, heatmaps
              </p>
              <div className="text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                View Charts →
              </div>
              <Pills
                colorClasses="text-blue-300 border-blue-400/30 hover:bg-blue-500/10"
                items={[
                  { label: 'Bar', to: '/data-visualization?ex=bar' },
                  { label: 'Line', to: '/data-visualization?ex=line' },
                  { label: 'Donut', to: '/data-visualization?ex=donut' },
                  { label: 'Heatmap', to: '/data-visualization?ex=heatmap' },
                  { label: 'Scatter', to: '/data-visualization?ex=scatter' },
                ]}
              />
            </Link>

            <Link 
              to="/gaming-ui"
              className="group bg-pink-500/10 border border-pink-500/30 rounded-xl p-6 hover:bg-pink-500/20 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-pink-500/20 border border-pink-500/40">
                  <Gamepad2 className="w-6 h-6 text-pink-400" />
                </div>
                <h4 className="text-xl font-bold text-pink-400">Gaming UI</h4>
              </div>
              <p className="text-pink-300/80 text-sm mb-4">
                Futuristic gaming interfaces with HUDs, stats, and achievements
              </p>
              <div className="text-pink-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                Enter Game →
              </div>
              <Pills
                colorClasses="text-pink-300 border-pink-400/30 hover:bg-pink-500/10"
                items={[
                  { label: 'HUD', to: '/gaming-ui?ex=hud' },
                  { label: 'Stats', to: '/gaming-ui?ex=stats' },
                  { label: 'Quests', to: '/gaming-ui?ex=quests' },
                  { label: 'Inventory', to: '/gaming-ui?ex=inventory' },
                  { label: 'Achievements', to: '/gaming-ui?ex=achievements' },
                ]}
              />
            </Link>

            <Link 
              to="/futuristic-dashboard"
              className="group bg-green-500/10 border border-green-500/30 rounded-xl p-6 hover:bg-green-500/20 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/40">
                  <Terminal className="w-6 h-6 text-green-400" />
                </div>
                <h4 className="text-xl font-bold text-green-400">Command Center</h4>
              </div>
              <p className="text-green-300/80 text-sm mb-4">
                Matrix-style dashboard with radar, terminal, and system monitoring
              </p>
              <div className="text-green-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                Access Matrix →
              </div>
              <Pills
                colorClasses="text-green-300 border-green-400/30 hover:bg-green-500/10"
                items={[
                  { label: 'Radar', to: '/futuristic-dashboard?ex=radar' },
                  { label: 'Terminal', to: '/futuristic-dashboard?ex=terminal' },
                  { label: 'Logs', to: '/futuristic-dashboard?ex=logs' },
                  { label: 'System', to: '/futuristic-dashboard?ex=system' },
                  { label: 'Network', to: '/futuristic-dashboard?ex=network' },
                ]}
              />
            </Link>

            <Link 
              to="/mobile-ui"
              className="group bg-rose-500/10 border border-rose-500/30 rounded-xl p-6 hover:bg-rose-500/20 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-500/40">
                  <Smartphone className="w-6 h-6 text-rose-400" />
                </div>
                <h4 className="text-xl font-bold text-rose-400">Mobile UI</h4>
              </div>
              <p className="text-rose-300/80 text-sm mb-4">
                Modern mobile app interfaces: home, music, chat, notifications
              </p>
              <div className="text-rose-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                Touch & Swipe →
              </div>
              <Pills
                colorClasses="text-rose-300 border-rose-400/30 hover:bg-rose-500/10"
                items={[
                  { label: 'Home', to: '/mobile-ui?ex=home' },
                  { label: 'Music', to: '/mobile-ui?ex=music' },
                  { label: 'Chat', to: '/mobile-ui?ex=chat' },
                  { label: 'Profile', to: '/mobile-ui?ex=profile' },
                  { label: 'Notifications', to: '/mobile-ui?ex=notifications' },
                ]}
              />
            </Link>

            <Link 
              to="/web3-dashboard"
              className="group bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 hover:bg-yellow-500/20 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-yellow-500/20 border border-yellow-500/40">
                  <Coins className="w-6 h-6 text-yellow-400" />
                </div>
                <h4 className="text-xl font-bold text-yellow-400">Web3 Dashboard</h4>
              </div>
              <p className="text-yellow-300/80 text-sm mb-4">
                Crypto portfolio, DeFi protocols, NFT collection, trading interface
              </p>
              <div className="text-yellow-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                To The Moon →
              </div>
              <Pills
                colorClasses="text-yellow-300 border-yellow-400/30 hover:bg-yellow-500/10"
                items={[
                  { label: 'Portfolio', to: '/web3-dashboard?ex=portfolio' },
                  { label: 'DeFi', to: '/web3-dashboard?ex=defi' },
                  { label: 'NFTs', to: '/web3-dashboard?ex=nfts' },
                  { label: 'Trading', to: '/web3-dashboard?ex=trading' },
                  { label: 'Wallet', to: '/web3-dashboard?ex=wallet' },
                ]}
              />
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-zinc-800/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">100+</div>
              <div className="text-sm text-zinc-400">Components</div>
            </div>
            <div className="bg-zinc-800/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">9</div>
              <div className="text-sm text-zinc-400">Showcases</div>
            </div>
            <div className="bg-zinc-800/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">50+</div>
              <div className="text-sm text-zinc-400">Card Styles</div>
            </div>
            <div className="bg-zinc-800/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">∞</div>
              <div className="text-sm text-zinc-400">Possibilities</div>
            </div>
          </div>
        </div>
      </div>

      {/* Component Library Link */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Component Library</h3>
            <p className="text-zinc-400 text-sm">Explore our comprehensive design system and component collection</p>
          </div>
          <Link 
            to="/components" 
            className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 rounded-lg hover:bg-cyan-500/20 transition-colors text-sm"
          >
            Open Component Library →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-800/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">15</div>
            <div className="text-sm text-zinc-400">Categories</div>
          </div>
          <div className="bg-zinc-800/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">300+</div>
            <div className="text-sm text-zinc-400">Components</div>
          </div>
          <div className="bg-zinc-800/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">50+</div>
            <div className="text-sm text-zinc-400">Variations</div>
          </div>
          <div className="bg-zinc-800/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">∞</div>
            <div className="text-sm text-zinc-400">Possibilities</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardRoute;
