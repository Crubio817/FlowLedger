import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Star,
  Zap,
  Activity,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle,
  Trophy,
  Heart,
  Coffee,
  Brain,
  Shield,
  Globe
} from 'lucide-react';
import { PageTitleEditorial } from '../components/PageTitles.tsx';
import KpiCard from '../components/KpiCard.tsx';

const KpiSamplesRoute: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sample KPI designs with different styles
  const colorfulMetrics = [
    { id: 'revenue', label: 'Revenue', value: '$2.4M', change: '+12.5%', color: '#10b981', icon: DollarSign, trend: [40, 45, 52, 48, 61, 55, 67] },
    { id: 'users', label: 'Active Users', value: '12.4K', change: '+8.2%', color: '#3b82f6', icon: Users, trend: [30, 35, 42, 38, 45, 52, 48] },
    { id: 'conversions', label: 'Conversions', value: '89.2%', change: '+2.1%', color: '#8b5cf6', icon: Target, trend: [80, 82, 85, 83, 87, 89, 92] },
    { id: 'satisfaction', label: 'Satisfaction', value: '4.8★', change: '+0.3', color: '#f59e0b', icon: Star, trend: [4.2, 4.3, 4.5, 4.4, 4.6, 4.7, 4.8] },
    { id: 'performance', label: 'Performance', value: '98.7%', change: '+1.2%', color: '#ef4444', icon: Zap, trend: [95, 96, 97, 96, 98, 99, 98] },
    { id: 'engagement', label: 'Engagement', value: '76%', change: '+5.8%', color: '#06b6d4', icon: Activity, trend: [65, 68, 72, 70, 74, 76, 78] }
  ];

  // Standard KpiCard examples (existing component)
  const standardKpis = [
    { title: 'Total Revenue', value: 2400000, icon: <DollarSign className="w-5 h-5" />, tint: '#10b981', deltaPct: 12.5 },
    { title: 'Active Users', value: 12400, icon: <Users className="w-5 h-5" />, tint: '#3b82f6', deltaPct: 8.2 },
    { title: 'Conversion Rate', value: '89.2%', icon: <Target className="w-5 h-5" />, tint: '#8b5cf6', deltaPct: 2.1 },
    { title: 'Satisfaction Score', value: '4.8', icon: <Star className="w-5 h-5" />, tint: '#f59e0b', deltaPct: 0.3 }
  ];

  // Minimal card style
  const MinimalCard = ({ metric }: { metric: any }) => (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <metric.icon className="w-5 h-5 text-zinc-400" />
        <span className="text-xs text-zinc-500 font-mono">{metric.change}</span>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
      <div className="text-sm text-zinc-400">{metric.label}</div>
    </div>
  );

  // Glass morphism card style
  const GlassCard = ({ metric }: { metric: any }) => (
    <div className="relative rounded-xl p-6 backdrop-blur-md border border-white/10 bg-white/5">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent"></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-white/10">
            <metric.icon className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs text-emerald-400 font-medium">{metric.change}</span>
        </div>
        <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
        <div className="text-sm text-white/70">{metric.label}</div>
      </div>
    </div>
  );

  // Neon glow card style
  const NeonCard = ({ metric }: { metric: any }) => (
    <div 
      className="relative rounded-xl p-6 border transition-all duration-300 hover:scale-105"
      style={{
        background: `linear-gradient(135deg, ${metric.color}15, ${metric.color}05)`,
        border: `1px solid ${metric.color}50`,
        boxShadow: `0 0 20px ${metric.color}30, inset 0 1px 0 rgba(255,255,255,0.1)`
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div 
          className="p-3 rounded-lg"
          style={{ 
            background: `${metric.color}30`,
            boxShadow: `0 0 15px ${metric.color}40`
          }}
        >
          <metric.icon 
            className="w-5 h-5" 
            style={{ color: metric.color }}
          />
        </div>
        <span 
          className="text-xs font-bold px-2 py-1 rounded-full"
          style={{ 
            color: metric.color,
            background: `${metric.color}20`,
            textShadow: `0 0 10px ${metric.color}80`
          }}
        >
          {metric.change}
        </span>
      </div>
      <div className="text-2xl font-bold text-white mb-1" style={{ textShadow: '0 0 20px rgba(255,255,255,0.5)' }}>
        {metric.value}
      </div>
      <div className="text-sm text-zinc-300">{metric.label}</div>
    </div>
  );

  return (
    <div className="p-6 space-y-8">
      <PageTitleEditorial
        eyebrow="Design System"
        title="KPI Card Samples"
        subtitle="Collection of different KPI card designs to choose from"
      />

      {/* Current KpiCard Component */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Current KpiCard Component</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {standardKpis.map((kpi, index) => (
            <KpiCard
              key={index}
              title={kpi.title}
              value={kpi.value}
              icon={kpi.icon}
              tint={kpi.tint}
              deltaPct={kpi.deltaPct}
            />
          ))}
        </div>
      </section>

      {/* Colorful Animated Cards */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Colorful Animated Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {colorfulMetrics.map((metric) => (
            <div 
              key={metric.id}
              className={`group relative rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${
                selectedMetric === metric.id ? 'ring-2 ring-white/20' : ''
              }`}
              style={{
                background: `linear-gradient(135deg, ${metric.color}15, ${metric.color}05)`,
                border: `1px solid ${metric.color}30`,
                boxShadow: `0 8px 32px ${metric.color}20`
              }}
              onClick={() => setSelectedMetric(selectedMetric === metric.id ? null : metric.id)}
            >
              {/* Animated glow */}
              <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
                style={{ background: `${metric.color}30` }}
              ></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="p-3 rounded-xl"
                    style={{ 
                      background: `${metric.color}20`,
                      border: `1px solid ${metric.color}40`
                    }}
                  >
                    <metric.icon 
                      className="w-6 h-6" 
                      style={{ color: metric.color }}
                    />
                  </div>
                  <div className="text-right">
                    <div 
                      className="text-sm font-medium px-2 py-1 rounded-full"
                      style={{ 
                        color: metric.color,
                        background: `${metric.color}15`
                      }}
                    >
                      {metric.change}
                    </div>
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className="text-3xl font-bold text-white mb-1">
                    {metric.value}
                  </div>
                  <div className="text-zinc-400 text-sm">
                    {metric.label}
                  </div>
                </div>

                {/* Mini trend chart */}
                <div className="flex items-end gap-1 h-8">
                  {metric.trend.map((value, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t transition-all duration-300"
                      style={{
                        height: `${(value / Math.max(...metric.trend)) * 100}%`,
                        background: `${metric.color}60`,
                        minHeight: '4px'
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Minimal Style Cards */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Minimal Style</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {colorfulMetrics.slice(0, 4).map((metric) => (
            <MinimalCard key={metric.id} metric={metric} />
          ))}
        </div>
      </section>

      {/* Glass Morphism Style */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Glass Morphism</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {colorfulMetrics.slice(0, 4).map((metric) => (
            <GlassCard key={metric.id} metric={metric} />
          ))}
        </div>
      </section>

      {/* Neon Glow Style */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Neon Glow</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {colorfulMetrics.slice(0, 4).map((metric) => (
            <NeonCard key={metric.id} metric={metric} />
          ))}
        </div>
      </section>

      {/* Fun Interactive Elements */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Interactive Elements</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Live Clock Card */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">Live Time</h3>
            </div>
            <div className="text-2xl font-mono font-bold text-cyan-400">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="text-sm text-zinc-400 mt-1">
              {currentTime.toLocaleDateString()}
            </div>
          </div>

          {/* Animated Progress */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">Progress</h3>
            </div>
            <div className="text-2xl font-bold text-white mb-2">87%</div>
            <div className="w-full bg-zinc-700 rounded-full h-2">
              <div 
                className="bg-emerald-400 h-2 rounded-full transition-all duration-1000"
                style={{ width: '87%' }}
              ></div>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <h3 className="text-lg font-semibold text-white">System Status</h3>
            </div>
            <div className="text-2xl font-bold text-emerald-400 mb-1">Online</div>
            <div className="text-sm text-zinc-400">All systems operational</div>
          </div>
        </div>
      </section>

      {/* Extra Samples (5 new compact components) */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Extra Samples</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 1) KPI Chip */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-400 mb-1">NPS</div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-white">68</div>
              <span className="text-emerald-400 text-xs font-medium">+6</span>
            </div>
          </div>

          {/* 2) Ring Progress */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 grid place-items-center">
            <div className="relative w-20 h-20" style={{
              background: 'conic-gradient(#22c55e 72%, rgba(255,255,255,0.08) 0)'
            }}>
              <div className="absolute inset-1 bg-zinc-900/80 rounded-full grid place-items-center border border-zinc-800">
                <div className="text-white text-sm font-semibold">72%</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-zinc-400">Goal Attainment</div>
          </div>

          {/* 3) Delta Bar */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-400 mb-2">Churn</div>
            <div className="w-full h-2 rounded bg-zinc-700 overflow-hidden">
              <div className="h-2 bg-rose-400" style={{ width: '3.2%' }}></div>
            </div>
            <div className="mt-2 text-sm text-white">3.2%</div>
          </div>

          {/* 4) Countdown */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-400 mb-1">SLA Window</div>
            <div className="font-mono text-xl font-bold text-amber-400">
              {`${String(23 - currentTime.getHours()).padStart(2,'0')}:${String(59 - currentTime.getMinutes()).padStart(2,'0')}:${String(59 - currentTime.getSeconds()).padStart(2,'0')}`}
            </div>
          </div>

          {/* 5) Leaderboard mini */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-400 mb-2">Top Reps</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-zinc-300">A. Patel</span><span className="text-emerald-400 font-semibold">$84k</span></div>
              <div className="flex justify-between"><span className="text-zinc-300">R. Chen</span><span className="text-emerald-400 font-semibold">$78k</span></div>
              <div className="flex justify-between"><span className="text-zinc-300">L. Gomez</span><span className="text-emerald-400 font-semibold">$73k</span></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default KpiSamplesRoute;
