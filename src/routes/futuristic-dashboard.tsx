import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu,
  Database,
  Shield,
  Zap,
  Globe,
  Wifi,
  Activity,
  Users,
  TrendingUp,
  BarChart3,
  PieChart,
  Target,
  Rocket,
  Brain,
  Eye,
  Radar,
  Satellite,
  Signal,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Map,
  Navigation,
  Terminal,
  Code,
  Server,
  CloudLightning,
  Sparkles
} from 'lucide-react';
import { PageTitleEditorial } from '../components/PageTitles.tsx';

const FuturisticDashboardRoute: React.FC = () => {
  const [cpuUsage, setCpuUsage] = useState(45);
  const [memoryUsage, setMemoryUsage] = useState(67);
  const [networkLoad, setNetworkLoad] = useState(23);
  const [securityLevel, setSecurityLevel] = useState(89);
  const [activeConnections, setActiveConnections] = useState(1247);
  const [threatLevel, setThreatLevel] = useState('LOW');
  const [isScanning, setIsScanning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const radarRef = useRef<HTMLCanvasElement>(null);

  // Animated metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 20)));
      setMemoryUsage(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 15)));
      setNetworkLoad(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 25)));
      setSecurityLevel(prev => Math.max(70, Math.min(100, prev + (Math.random() - 0.5) * 10)));
      setActiveConnections(prev => prev + Math.floor((Math.random() - 0.5) * 100));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Matrix Rain Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const columns = Math.floor(canvas.width / 20);
    const drops: number[] = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00ff41';
      ctx.font = '15px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = String.fromCharCode(Math.random() * 128);
        ctx.fillText(text, i * 20, drops[i] * 20);

        if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);
    return () => clearInterval(interval);
  }, []);

  // Radar Animation
  useEffect(() => {
    const canvas = radarRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 200;
    canvas.height = 200;

    let angle = 0;

    const drawRadar = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 80;

      // Draw radar circles
      ctx.strokeStyle = '#00ff41';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, (radius / 3) * i, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // Draw cross lines
      ctx.beginPath();
      ctx.moveTo(centerX - radius, centerY);
      ctx.lineTo(centerX + radius, centerY);
      ctx.moveTo(centerX, centerY - radius);
      ctx.lineTo(centerX, centerY + radius);
      ctx.stroke();

      // Draw sweep line
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);
      
      const gradient = ctx.createLinearGradient(0, 0, radius, 0);
      gradient.addColorStop(0, 'rgba(0, 255, 65, 0.8)');
      gradient.addColorStop(1, 'rgba(0, 255, 65, 0)');
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(radius, 0);
      ctx.stroke();
      
      ctx.restore();

      // Draw blips
      const blips = [
        { x: 30, y: -20, size: 3 },
        { x: -40, y: 35, size: 2 },
        { x: 60, y: 45, size: 4 },
        { x: -25, y: -50, size: 2 }
      ];

      ctx.fillStyle = '#ff4444';
      blips.forEach(blip => {
        ctx.beginPath();
        ctx.arc(centerX + blip.x, centerY + blip.y, blip.size, 0, 2 * Math.PI);
        ctx.fill();
      });

      angle += 0.05;
    };

    const interval = setInterval(drawRadar, 50);
    return () => clearInterval(interval);
  }, []);

  // Holographic Status Panel
  const HolographicPanel = () => (
    <div className="relative bg-black/90 border border-cyan-500/50 rounded-xl p-6 overflow-hidden">
      {/* Holographic grid */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        ></div>
      </div>

      {/* Animated corners */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400 animate-pulse"></div>
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400 animate-pulse"></div>

      <div className="relative z-10">
        <h3 className="text-xl font-bold text-cyan-400 mb-6 font-mono tracking-wider">
          SYSTEM STATUS
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* CPU */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-400 font-mono">CPU</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono mb-1">{cpuUsage.toFixed(1)}%</div>
            <div className="h-2 bg-zinc-800 rounded overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000"
                style={{ width: `${cpuUsage}%` }}
              ></div>
            </div>
          </div>

          {/* Memory */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-5 h-5 text-purple-400" />
              <span className="text-purple-400 font-mono">MEMORY</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono mb-1">{memoryUsage.toFixed(1)}%</div>
            <div className="h-2 bg-zinc-800 rounded overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                style={{ width: `${memoryUsage}%` }}
              ></div>
            </div>
          </div>

          {/* Network */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Wifi className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-mono">NETWORK</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono mb-1">{networkLoad.toFixed(1)}%</div>
            <div className="h-2 bg-zinc-800 rounded overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000"
                style={{ width: `${networkLoad}%` }}
              ></div>
            </div>
          </div>

          {/* Security */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-mono">SECURITY</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono mb-1">{securityLevel.toFixed(1)}%</div>
            <div className="h-2 bg-zinc-800 rounded overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-1000"
                style={{ width: `${securityLevel}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Command Terminal
  const CommandTerminal = () => {
    const [commands] = useState([
      '> SYSTEM INITIALIZED',
      '> CONNECTING TO MAINFRAME...',
      '> AUTHENTICATION SUCCESSFUL',
      '> LOADING SECURITY PROTOCOLS...',
      '> NETWORK SCAN COMPLETE',
      '> READY FOR COMMANDS'
    ]);

    return (
      <div className="bg-black border border-green-500/50 rounded-xl p-4 font-mono">
        <div className="flex items-center gap-2 mb-4">
          <Terminal className="w-5 h-5 text-green-400" />
          <span className="text-green-400 font-bold">COMMAND_TERMINAL</span>
          <div className="flex gap-2 ml-auto">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>

        <div className="space-y-1 text-green-400 text-sm max-h-40 overflow-hidden">
          {commands.map((cmd, i) => (
            <div 
              key={i} 
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.5}s` }}
            >
              {cmd}
            </div>
          ))}
          <div className="flex items-center">
            <span>&gt; </span>
            <div className="w-2 h-4 bg-green-400 ml-1 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  };

  // Threat Detection
  const ThreatDetection = () => (
    <div className="bg-zinc-900/90 border border-red-500/50 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-red-400" />
        <h3 className="text-xl font-bold text-red-400 font-mono">THREAT DETECTION</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-black/50 rounded border border-green-500/30">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-mono">FIREWALL</span>
          </div>
          <span className="text-green-400 font-mono">ACTIVE</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-black/50 rounded border border-yellow-500/30">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-mono">INTRUSION DETECTION</span>
          </div>
          <span className="text-yellow-400 font-mono">MONITORING</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-black/50 rounded border border-red-500/30">
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400 font-mono">MALWARE SCAN</span>
          </div>
          <span className="text-red-400 font-mono">THREATS FOUND</span>
        </div>

        <div className="mt-6 text-center">
          <div className="text-sm text-zinc-400 font-mono mb-2">THREAT LEVEL</div>
          <div className={`text-2xl font-bold font-mono ${
            threatLevel === 'LOW' ? 'text-green-400' :
            threatLevel === 'MEDIUM' ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {threatLevel}
          </div>
        </div>
      </div>
    </div>
  );

  // New: Spectrum Analyzer (audio-like bars)
  const SpectrumAnalyzer: React.FC = () => {
    const [bars, setBars] = useState<number[]>(() => Array.from({ length: 36 }, () => Math.random() * 100));
    useEffect(() => {
      let raf: number;
      const tick = () => {
        setBars(prev => prev.map((v, i) => {
          const n = (Math.sin(Date.now() / 300 + i) + 1) * 50 + Math.random() * 20;
          return Math.max(10, Math.min(100, n));
        }));
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, []);
    return (
      <div className="bg-black/80 border border-indigo-500/40 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-indigo-400" />
          <span className="text-indigo-400 font-mono text-sm">SPECTRUM</span>
        </div>
        <div className="h-28 flex items-end gap-1">
          {bars.map((v, i) => (
            <div key={i} className="flex-1 rounded-t" style={{ height: `${v}%`, background: 'linear-gradient(180deg,#6366f1,#22d3ee)' }} />
          ))}
        </div>
      </div>
    );
  };

  // New: Toggle matrix
  const ToggleMatrix: React.FC = () => {
    const [state, setState] = useState<boolean[]>(() => Array.from({ length: 16 }, () => Math.random() > 0.5));
    const toggle = (i: number) => setState(prev => prev.map((v, idx) => idx === i ? !v : v));
    const active = state.filter(Boolean).length;
    return (
      <div className="bg-black/80 border border-cyan-500/40 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Grid4x4Icon />
            <span className="text-cyan-400 font-mono text-sm">TOGGLE_MATRIX</span>
          </div>
          <span className="text-cyan-400 font-mono text-xs">{active}/16</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {state.map((on, i) => (
            <button
              key={i}
              onClick={() => toggle(i)}
              className={`h-10 rounded border ${on ? 'bg-cyan-500/30 border-cyan-500' : 'bg-zinc-900 border-zinc-700'}`}
            />
          ))}
        </div>
      </div>
    );
  };

  // helper icon for matrix grid
  const Grid4x4Icon: React.FC = () => (
    <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" />
      <rect x="10" y="1" width="5" height="5" rx="1" stroke="currentColor" />
      <rect x="1" y="10" width="5" height="5" rx="1" stroke="currentColor" />
      <rect x="10" y="10" width="5" height="5" rx="1" stroke="currentColor" />
    </svg>
  );

  // New: Packet Monitor (simple live line)
  const PacketMonitor: React.FC = () => {
    const [points, setPoints] = useState<number[]>(() => Array.from({ length: 80 }, () => 50));
    useEffect(() => {
      const id = setInterval(() => {
        setPoints(prev => {
          const next = prev.slice(1);
          const last = prev[prev.length - 1] ?? 50;
          const v = Math.max(0, Math.min(100, last + (Math.random() - 0.5) * 12));
          next.push(v);
          return next;
        });
      }, 250);
      return () => clearInterval(id);
    }, []);
    const w = 400, h = 120, max = 100;
    const d = points.map((p, i) => `L ${(i / (points.length - 1)) * w} ${h - (p / max) * h}`).join(' ').replace(/^L/, 'M');
    return (
      <div className="bg-black/80 border border-emerald-500/40 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Wifi className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-400 font-mono text-sm">PACKETS/s</span>
        </div>
        <svg className="w-full h-32" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
          <path d={d} stroke="#22c55e" strokeWidth="2" fill="none" />
        </svg>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Matrix Rain Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-20"
      ></canvas>

      <div className="relative z-10 p-6 space-y-8">
        <PageTitleEditorial
          eyebrow="Futuristic Interface"
          title="Command Center Dashboard"
          subtitle="Advanced monitoring and control systems with real-time data visualization"
        />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* System Status */}
          <div className="lg:col-span-2">
            <HolographicPanel />
          </div>

          {/* Radar Display */}
          <div className="bg-black/90 border border-green-500/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-green-400 mb-4 font-mono">RADAR SCAN</h3>
            <div className="flex justify-center">
              <canvas ref={radarRef} className="border border-green-500/30 rounded"></canvas>
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsScanning(!isScanning)}
                className={`px-4 py-2 rounded font-mono font-bold border transition-all duration-300 ${
                  isScanning
                    ? 'bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30'
                    : 'bg-green-500/20 border-green-500 text-green-400 hover:bg-green-500/30'
                }`}
              >
                {isScanning ? 'STOP SCAN' : 'START SCAN'}
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CommandTerminal />
          <ThreatDetection />
        </div>

        {/* New: Systems Add-ons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <SpectrumAnalyzer />
          <ToggleMatrix />
          <PacketMonitor />
        </div>

        {/* Status Bar */}
        <div className="bg-black/90 border border-cyan-500/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-mono">ONLINE</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400 font-mono">{activeConnections} CONNECTIONS</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 font-mono">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
              <span className="text-yellow-400 font-mono font-bold">ALL SYSTEMS OPERATIONAL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuturisticDashboardRoute;
