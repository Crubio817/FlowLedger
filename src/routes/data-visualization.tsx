import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Activity,
  Target,
  Zap,
  Users,
  DollarSign,
  Calendar,
  Globe,
  Star,
  Trophy,
  Rocket,
  Crown,
  Shield,
  Eye
} from 'lucide-react';
import { PageTitleEditorial } from '../components/PageTitles.tsx';

const DataVisualizationRoute: React.FC = () => {
  const [animatedData, setAnimatedData] = useState([40, 65, 30, 80, 45, 90, 55]);
  const [selectedChart, setSelectedChart] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedData(prev => prev.map(() => Math.random() * 100));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Animated Bar Chart
  const AnimatedBarChart = () => (
    <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
          <BarChart3 className="w-5 h-5 text-blue-400" />
        </div>
        <h3 className="text-xl font-bold text-white">Animated Bar Chart</h3>
      </div>

      <div className="flex items-end gap-3 h-64 mb-4">
        {animatedData.map((value, index) => (
          <div 
            key={index}
            className="flex-1 relative group cursor-pointer"
            onMouseEnter={() => setHoverIndex(index)}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <div 
              className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all duration-1000 hover:from-purple-500 hover:to-pink-400"
              style={{ height: `${value}%` }}
            ></div>
            
            {/* Tooltip */}
            {hoverIndex === index && (
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-zinc-800 text-white px-3 py-1 rounded-lg text-sm font-medium">
                {Math.round(value)}%
              </div>
            )}
            
            {/* Label */}
            <div className="text-center mt-2 text-sm text-zinc-400">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-zinc-400 text-sm">
        Weekly Performance Overview
      </div>
    </div>
  );

  // Circular Progress Charts
  const CircularCharts = () => {
    const data = [
      { label: 'CPU Usage', value: 68, color: '#ef4444', icon: Zap },
      { label: 'Memory', value: 45, color: '#10b981', icon: Activity },
      { label: 'Storage', value: 82, color: '#f59e0b', icon: Target },
      { label: 'Network', value: 34, color: '#3b82f6', icon: Globe }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.map((item, index) => (
          <div key={index} className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
            <div className="flex items-center gap-2 mb-4">
              <item.icon className="w-5 h-5" style={{ color: item.color }} />
              <h4 className="text-white font-semibold">{item.label}</h4>
            </div>
            
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#374151"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke={item.color}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${item.value * 2.51} 251`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{item.value}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Line Chart with Area
  const AreaChart = () => {
    const dataPoints = [20, 45, 32, 68, 55, 78, 65, 89, 72, 95];
    const maxValue = Math.max(...dataPoints);
    
    return (
      <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Revenue Trend</h3>
        </div>

        <div className="relative h-64">
          <svg className="w-full h-full" viewBox="0 0 400 200">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line
                key={i}
                x1="0"
                y1={i * 40}
                x2="400"
                y2={i * 40}
                stroke="#374151"
                strokeWidth="1"
                opacity="0.3"
              />
            ))}

            {/* Area fill */}
            <path
              d={`M 0 ${200 - (dataPoints[0] / maxValue) * 200} ${dataPoints.map((point, i) => 
                `L ${(i / (dataPoints.length - 1)) * 400} ${200 - (point / maxValue) * 200}`
              ).join(' ')} L 400 200 L 0 200 Z`}
              fill="url(#areaGradient)"
            />

            {/* Line */}
            <path
              d={`M 0 ${200 - (dataPoints[0] / maxValue) * 200} ${dataPoints.map((point, i) => 
                `L ${(i / (dataPoints.length - 1)) * 400} ${200 - (point / maxValue) * 200}`
              ).join(' ')}`}
              stroke="#10b981"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {dataPoints.map((point, i) => (
              <circle
                key={i}
                cx={(i / (dataPoints.length - 1)) * 400}
                cy={200 - (point / maxValue) * 200}
                r="6"
                fill="#10b981"
                stroke="#fff"
                strokeWidth="2"
                className="hover:r-8 transition-all cursor-pointer"
              />
            ))}

            {/* Gradient definition */}
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="flex justify-between text-sm text-zinc-400 mt-4">
          <span>Jan</span>
          <span>Mar</span>
          <span>May</span>
          <span>Jul</span>
          <span>Sep</span>
          <span>Nov</span>
        </div>
      </div>
    );
  };

  // Donut Chart
  const DonutChart = () => {
    const data = [
      { label: 'Desktop', value: 45, color: '#3b82f6' },
      { label: 'Mobile', value: 35, color: '#10b981' },
      { label: 'Tablet', value: 20, color: '#f59e0b' }
    ];

    let cumulativePercentage = 0;

    return (
      <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
            <PieChart className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Device Usage</h3>
        </div>

        <div className="flex items-center gap-8">
          {/* Donut Chart */}
          <div className="relative w-48 h-48">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
              {data.map((item, index) => {
                const startAngle = cumulativePercentage * 3.6;
                const endAngle = (cumulativePercentage + item.value) * 3.6;
                const largeArcFlag = item.value > 50 ? 1 : 0;
                
                const x1 = 50 + 35 * Math.cos((startAngle * Math.PI) / 180);
                const y1 = 50 + 35 * Math.sin((startAngle * Math.PI) / 180);
                const x2 = 50 + 35 * Math.cos((endAngle * Math.PI) / 180);
                const y2 = 50 + 35 * Math.sin((endAngle * Math.PI) / 180);

                const pathData = `M 50 50 L ${x1} ${y1} A 35 35 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                
                cumulativePercentage += item.value;
                
                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={item.color}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                );
              })}
              
              {/* Center circle */}
              <circle cx="50" cy="50" r="20" fill="#18181b" />
            </svg>
            
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-sm text-zinc-400">Total</div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ background: item.color }}
                ></div>
                <span className="text-white font-medium">{item.label}</span>
                <span className="text-zinc-400">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Heatmap
  const Heatmap = () => {
    const generateHeatmapData = () => {
      const data = [];
      for (let week = 0; week < 53; week++) {
        for (let day = 0; day < 7; day++) {
          data.push({
            week,
            day,
            value: Math.random(),
            date: new Date(2024, 0, week * 7 + day + 1)
          });
        }
      }
      return data;
    };

    const heatmapData = generateHeatmapData();

    const getColor = (value: number) => {
      if (value < 0.2) return '#0e4429';
      if (value < 0.4) return '#006d32';
      if (value < 0.6) return '#26a641';
      if (value < 0.8) return '#39d353';
      return '#39d353';
    };

    return (
      <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-green-500/20 border border-green-500/30">
            <Calendar className="w-5 h-5 text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Activity Heatmap</h3>
        </div>

        <div className="overflow-x-auto">
          <div className="inline-flex gap-1">
            {Array.from({ length: 53 }, (_, week) => (
              <div key={week} className="flex flex-col gap-1">
                {Array.from({ length: 7 }, (_, day) => {
                  const dataPoint = heatmapData.find(d => d.week === week && d.day === day);
                  return (
                    <div
                      key={day}
                      className="w-3 h-3 rounded-sm cursor-pointer hover:ring-2 hover:ring-white/50 transition-all"
                      style={{ backgroundColor: getColor(dataPoint?.value || 0) }}
                      title={`${Math.round((dataPoint?.value || 0) * 100)} contributions`}
                    ></div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 text-sm text-zinc-400">
          <span>Less</span>
          <div className="flex gap-1">
            {[0.1, 0.3, 0.5, 0.7, 0.9].map((value, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: getColor(value) }}
              ></div>
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    );
  };

  // New: Live Sparkline
  const LiveSparkline: React.FC = () => {
    const [running, setRunning] = useState(true);
    const [speed, setSpeed] = useState(600);
    const [points, setPoints] = useState<number[]>(() => Array.from({ length: 50 }, () => 50 + Math.random() * 30));

    useEffect(() => {
      if (!running) return;
      const id = setInterval(() => {
        setPoints(prev => {
          const next = prev.slice(1);
          const last = prev[prev.length - 1] ?? 60;
          // Random walk
          const val = Math.max(0, Math.min(100, last + (Math.random() - 0.5) * 10));
          next.push(val);
          return next;
        });
      }, speed);
      return () => clearInterval(id);
    }, [running, speed]);

    const max = 100;
    const w = 400, h = 120;
    const path = points.map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - (p / max) * h;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    return (
      <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Live Sparkline</h3>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setRunning(r => !r)} className={`px-3 py-1.5 rounded-lg text-sm border ${running ? 'border-red-500 text-red-400' : 'border-emerald-500 text-emerald-400'}`}>
              {running ? 'Pause' : 'Play'}
            </button>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span>Speed</span>
              <input type="range" min={200} max={1200} step={100} value={speed} onChange={e => setSpeed(Number(e.target.value))} />
            </div>
          </div>
        </div>
        <div className="relative h-36">
          <svg className="w-full h-full" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
            <path d={path} stroke="#10b981" strokeWidth="2" fill="none" />
          </svg>
        </div>
      </div>
    );
  };

  // New: Histogram with adjustable bins
  const Histogram: React.FC = () => {
    const [bins, setBins] = useState(10);
    const [data] = useState<number[]>(() => {
      // Approx. normal-ish distribution using sum of uniforms
      return Array.from({ length: 300 }, () => {
        const u = (Math.random() + Math.random() + Math.random()) / 3; // 0..1
        return u * 100;
      });
    });

    const min = 0, max = 100;
    const width = (max - min) / bins;
    const counts = Array.from({ length: bins }, () => 0);
    data.forEach(v => {
      const idx = Math.min(bins - 1, Math.floor((v - min) / width));
      counts[idx]++;
    });
    const peak = Math.max(...counts, 1);

    return (
      <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
            <BarChart3 className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Histogram</h3>
        </div>
        <div className="flex items-center gap-3 mb-4 text-xs text-zinc-400">
          <span>Bins</span>
          <input type="range" min={5} max={25} value={bins} onChange={e => setBins(Number(e.target.value))} />
          <span>{bins}</span>
        </div>
        <div className="h-40 flex items-end gap-1">
          {counts.map((c, i) => (
            <div key={i} className="flex-1 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t" style={{ height: `${(c / peak) * 100}%` }} />
          ))}
        </div>
        <div className="flex justify-between text-xs text-zinc-500 mt-2">
          <span>{min.toFixed(0)}</span>
          <span>{max.toFixed(0)}</span>
        </div>
      </div>
    );
  };

  // Dashboard Cards with Charts
  const DashboardCards = () => {
    const cards = [
      {
        title: 'Total Revenue',
        value: '$124.5K',
        change: '+12.5%',
        positive: true,
        icon: DollarSign,
        color: '#10b981',
        chartData: [30, 45, 35, 60, 42, 70, 55]
      },
      {
        title: 'Active Users',
        value: '8,432',
        change: '+8.2%',
        positive: true,
        icon: Users,
        color: '#3b82f6',
        chartData: [20, 35, 45, 30, 55, 45, 65]
      },
      {
        title: 'Conversion Rate',
        value: '3.2%',
        change: '-2.1%',
        positive: false,
        icon: Target,
        color: '#f59e0b',
        chartData: [50, 45, 40, 35, 30, 25, 32]
      },
      {
        title: 'Avg. Rating',
        value: '4.8',
        change: '+0.3',
        positive: true,
        icon: Star,
        color: '#8b5cf6',
        chartData: [4.2, 4.3, 4.5, 4.4, 4.6, 4.7, 4.8]
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div 
            key={index}
            className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div 
                className="p-3 rounded-xl"
                style={{ 
                  background: `${card.color}20`,
                  border: `1px solid ${card.color}40`
                }}
              >
                <card.icon className="w-6 h-6" style={{ color: card.color }} />
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                card.positive 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {card.change}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-3xl font-bold text-white mb-1">{card.value}</div>
              <div className="text-sm text-zinc-400">{card.title}</div>
            </div>

            {/* Mini chart */}
            <div className="flex items-end gap-1 h-8">
              {card.chartData.map((value, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t transition-all duration-300 group-hover:opacity-80"
                  style={{
                    height: `${(value / Math.max(...card.chartData)) * 100}%`,
                    background: card.color,
                    minHeight: '4px'
                  }}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-12">
      <PageTitleEditorial
        eyebrow="Data Analytics"
        title="Data Visualization"
        subtitle="Beautiful charts and graphs to visualize your data"
      />

      {/* Dashboard Cards */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h2>
        <DashboardCards />
      </section>

      {/* Bar Chart */}
      <section>
        <AnimatedBarChart />
      </section>

      {/* Circular Progress */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">System Metrics</h2>
        <CircularCharts />
      </section>

      {/* Area Chart and Donut Chart */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AreaChart />
          <DonutChart />
        </div>
      </section>

      {/* Heatmap */}
      <section>
        <Heatmap />
      </section>

      {/* New: Live Sparkline and Histogram */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <LiveSparkline />
          <Histogram />
        </div>
      </section>
    </div>
  );
};

export default DataVisualizationRoute;
