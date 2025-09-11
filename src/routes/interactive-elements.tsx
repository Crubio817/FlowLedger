import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Download,
  Share,
  Heart,
  Star,
  Zap,
  Target,
  Activity,
  TrendingUp,
  Users,
  Globe,
  Shield,
  Brain,
  Rocket,
  Eye,
  Sparkles,
  Crown,
  Trophy,
  Flame
} from 'lucide-react';
import { PageTitleEditorial } from '../components/PageTitles.tsx';

const InteractiveElementsRoute: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [progress, setProgress] = useState(30);
  const [rating, setRating] = useState(0);
  const [liked, setLiked] = useState(false);
  const [switchState, setSwitchState] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [sliderValue, setSliderValue] = useState(50);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated canvas background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles: Array<{x: number, y: number, vx: number, vy: number, color: string}> = [];
    
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        color: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'][Math.floor(Math.random() * 5)]
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }, []);

  // Media Player Component
  const MediaPlayer = () => (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-6 border border-zinc-700">
      <h3 className="text-xl font-bold text-white mb-6">Interactive Media Player</h3>
      
      {/* Album Art */}
      <div className="relative w-48 h-48 mx-auto mb-6 rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 animate-pulse"></div>
        <div className="absolute inset-4 bg-zinc-900/80 rounded-lg flex items-center justify-center">
          <Sparkles className="w-16 h-16 text-white" />
        </div>
      </div>

      {/* Song Info */}
      <div className="text-center mb-6">
        <h4 className="text-lg font-semibold text-white">Synthetic Dreams</h4>
        <p className="text-zinc-400">Neon Pulse</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-zinc-400 mb-2">
          <span>1:23</span>
          <span>3:45</span>
        </div>
        <div 
          className="h-2 bg-zinc-700 rounded-full cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = (x / rect.width) * 100;
            setProgress(percentage);
          }}
        >
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 w-4 h-4 bg-white rounded-full transform -translate-y-1/2 translate-x-1/2 shadow-lg"></div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <button className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors">
          <SkipBack className="w-5 h-5 text-white" />
        </button>
        <button 
          className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 transition-transform"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white ml-1" />
          )}
        </button>
        <button className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors">
          <SkipForward className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-3">
        <button onClick={() => setVolume(volume > 0 ? 0 : 75)}>
          {volume > 0 ? (
            <Volume2 className="w-5 h-5 text-white" />
          ) : (
            <VolumeX className="w-5 h-5 text-white" />
          )}
        </button>
        <div className="flex-1 h-2 bg-zinc-700 rounded-full">
          <div 
            className="h-full bg-white rounded-full"
            style={{ width: `${volume}%` }}
          ></div>
        </div>
        <span className="text-sm text-zinc-400 w-8">{volume}</span>
      </div>
    </div>
  );

  // Interactive Sliders
  const SliderShowcase = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white mb-4">Interactive Sliders</h3>
      
      {/* Gradient Slider */}
      <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
        <h4 className="text-lg font-semibold text-white mb-4">Rainbow Slider</h4>
        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            value={sliderValue}
            onChange={(e) => setSliderValue(Number(e.target.value))}
            className="w-full h-3 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 rounded-full appearance-none cursor-pointer"
            style={{
              background: 'linear-gradient(to right, #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6)'
            }}
          />
          <div 
            className="absolute top-0 w-6 h-6 bg-white rounded-full border-2 border-zinc-400 transform -translate-y-1.5 -translate-x-3 shadow-lg"
            style={{ left: `${sliderValue}%` }}
          ></div>
        </div>
        <div className="mt-2 text-center">
          <span className="text-white font-semibold">{sliderValue}%</span>
        </div>
      </div>

      {/* Multi-handle Slider */}
      <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
        <h4 className="text-lg font-semibold text-white mb-4">Range Slider</h4>
        <div className="relative h-3 bg-zinc-700 rounded-full">
          <div 
            className="absolute h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
            style={{ left: '20%', width: '50%' }}
          ></div>
          <div className="absolute top-0 left-[20%] w-6 h-6 bg-white rounded-full border-2 border-cyan-500 transform -translate-y-1.5 -translate-x-3 shadow-lg cursor-pointer"></div>
          <div className="absolute top-0 left-[70%] w-6 h-6 bg-white rounded-full border-2 border-blue-500 transform -translate-y-1.5 -translate-x-3 shadow-lg cursor-pointer"></div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-zinc-400">
          <span>20</span>
          <span>70</span>
        </div>
      </div>
    </div>
  );

  // Rating Component
  const RatingComponent = () => (
    <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
      <h3 className="text-xl font-bold text-white mb-4">Interactive Rating</h3>
      
      <div className="flex items-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setRating(star)}
            className="transition-all duration-200 transform hover:scale-110"
          >
            <Star 
              className={`w-8 h-8 ${
                star <= rating 
                  ? 'text-yellow-400 fill-yellow-400' 
                  : 'text-zinc-600'
              }`}
            />
          </button>
        ))}
      </div>
      
      <div className="text-center">
        <span className="text-white font-semibold">
          {rating > 0 ? `${rating} out of 5 stars` : 'Click to rate'}
        </span>
      </div>
    </div>
  );

  // Toggle Switches
  const ToggleSwitches = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white mb-4">Toggle Switches</h3>
      
      {/* Modern Toggle */}
      <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
        <div className="flex items-center justify-between">
          <span className="text-white font-medium">Enable Notifications</span>
          <button
            onClick={() => setSwitchState(!switchState)}
            className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
              switchState ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-zinc-700'
            }`}
          >
            <div 
              className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${
                switchState ? 'transform translate-x-7' : 'transform translate-x-1'
              }`}
            ></div>
          </button>
        </div>
      </div>

      {/* Neon Toggle */}
      <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
        <div className="flex items-center justify-between">
          <span className="text-white font-medium">Dark Mode</span>
          <button
            className={`relative w-16 h-9 rounded-full border-2 transition-all duration-300 ${
              switchState 
                ? 'bg-purple-900/50 border-purple-500 shadow-lg shadow-purple-500/50' 
                : 'bg-zinc-800 border-zinc-600'
            }`}
          >
            <div 
              className={`absolute top-0.5 w-7 h-7 rounded-full transition-all duration-300 ${
                switchState 
                  ? 'transform translate-x-7 bg-purple-400 shadow-lg shadow-purple-400/50' 
                  : 'transform translate-x-0.5 bg-zinc-400'
              }`}
            ></div>
          </button>
        </div>
      </div>
    </div>
  );

  // Animated Buttons
  const AnimatedButtons = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white mb-4">Animated Buttons</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Pulse Button */}
        <button className="relative overflow-hidden bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold py-4 px-6 rounded-xl hover:scale-105 transition-transform group">
          <span className="relative z-10 flex items-center gap-2">
            <Rocket className="w-5 h-5" />
            Launch
          </span>
          <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
        </button>

        {/* Ripple Button */}
        <button className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-4 px-6 rounded-xl group">
          <span className="relative z-10 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Connect
          </span>
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-colors"></div>
        </button>

        {/* Glow Button */}
        <button className="relative bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/50 group">
          <span className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 group-hover:animate-spin" />
            Magic
          </span>
        </button>

        {/* Loading Button */}
        <button className="relative bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-4 px-6 rounded-xl hover:scale-105 transition-transform group">
          <span className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="group-hover:hidden">Process</span>
            <span className="hidden group-hover:inline">Processing...</span>
          </span>
        </button>

        {/* Heart Button */}
        <button 
          className={`relative py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
            liked 
              ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white scale-105' 
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
          onClick={() => setLiked(!liked)}
        >
          <span className="flex items-center gap-2">
            <Heart className={`w-5 h-5 transition-all duration-300 ${liked ? 'fill-white animate-pulse' : ''}`} />
            {liked ? 'Liked!' : 'Like'}
          </span>
        </button>

        {/* Download Button */}
        <button className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-4 px-6 rounded-xl group">
          <span className="relative z-10 flex items-center gap-2">
            <Download className="w-5 h-5 group-hover:animate-bounce" />
            Download
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-600 transform translate-y-full group-hover:translate-y-0 transition-transform"></div>
        </button>
      </div>
    </div>
  );

  // Mini Kanban Board
  type KanbanTask = { id: string; text: string };
  type KanbanCols = { todo: KanbanTask[]; doing: KanbanTask[]; done: KanbanTask[] };
  const MiniKanban: React.FC = () => {
    const [cols, setCols] = useState<KanbanCols>({
      todo: [
        { id: 't1', text: 'Design wireframes' },
        { id: 't2', text: 'Prep dataset' },
      ],
      doing: [
        { id: 't3', text: 'Build components' },
      ],
      done: [
        { id: 't4', text: 'Create repo' },
      ],
    });

    const findTask = (id: string): { col: keyof KanbanCols; idx: number } | null => {
      for (const col of ['todo', 'doing', 'done'] as (keyof KanbanCols)[]) {
        const idx = cols[col].findIndex(t => t.id === id);
        if (idx !== -1) return { col, idx };
      }
      return null;
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetCol: keyof KanbanCols) => {
      e.preventDefault();
      const id = e.dataTransfer.getData('text/plain');
      if (!id) return;
      const loc = findTask(id);
      if (!loc) return;
      if (loc.col === targetCol) return;
      setCols(prev => {
        const task = prev[loc.col][loc.idx];
        const next: KanbanCols = {
          todo: [...prev.todo],
          doing: [...prev.doing],
          done: [...prev.done],
        };
        next[loc.col].splice(loc.idx, 1);
        next[targetCol].push(task);
        return next;
      });
    };

    const Column = ({ title, colKey, accent }: { title: string; colKey: keyof KanbanCols; accent: string }) => (
      <div
        className="rounded-xl p-4 bg-zinc-900/60 border border-zinc-800 min-h-[220px]"
        onDragOver={e => e.preventDefault()}
        onDrop={e => handleDrop(e, colKey)}
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white font-semibold">{title}</h4>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${accent}22`, color: accent }}>
            {cols[colKey].length}
          </span>
        </div>
        <div className="space-y-3">
          {cols[colKey].map(task => (
            <div
              key={task.id}
              draggable
              onDragStart={e => e.dataTransfer.setData('text/plain', task.id)}
              className="p-3 rounded-lg bg-zinc-800/80 border border-zinc-700 hover:border-zinc-600 cursor-grab active:cursor-grabbing"
            >
              <div className="text-sm text-white">{task.text}</div>
            </div>
          ))}
        </div>
      </div>
    );

    return (
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Mini Kanban</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Column title="To Do" colKey="todo" accent="#f59e0b" />
          <Column title="In Progress" colKey="doing" accent="#3b82f6" />
          <Column title="Done" colKey="done" accent="#10b981" />
        </div>
      </div>
    );
  };

  // Confetti Demo
  const ConfettiDemo: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const launch = () => {
      const canvas = canvasRef.current;
      const host = containerRef.current;
      if (!canvas || !host) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const rect = host.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = 200;
      const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
      const particles = Array.from({ length: 120 }, () => ({
        x: canvas.width / 2,
        y: canvas.height,
        vx: (Math.random() - 0.5) * 6,
        vy: -Math.random() * 8 - 6,
        g: 0.22,
        s: Math.random() * 3 + 2,
        c: colors[Math.floor(Math.random() * colors.length)],
        a: 1,
        r: Math.random() * Math.PI,
      }));
      let running = true;
      const start = performance.now();
      const step = (t: number) => {
        if (!running || !ctx) return;
        const dt = 16;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.g;
          p.r += 0.1;
          p.a *= 0.992;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.r);
          ctx.fillStyle = p.c;
          ctx.globalAlpha = Math.max(0, p.a);
          ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 1.6);
          ctx.restore();
        });
        if (t - start < 1500) requestAnimationFrame(step);
        else running = false;
      };
      requestAnimationFrame(step);
    };

    return (
      <div className="space-y-4" ref={containerRef}>
        <h4 className="text-lg font-semibold text-white">Confetti Button</h4>
        <div className="relative rounded-xl p-6 bg-zinc-900/60 border border-zinc-800 overflow-hidden">
          <button
            onClick={launch}
            className="relative z-10 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:scale-105 transition-transform"
          >
            Celebrate
          </button>
          <canvas ref={canvasRef} className="absolute left-0 right-0 bottom-0 h-52 pointer-events-none" />
        </div>
      </div>
    );
  };

  // Color Picker
  const ColorPicker: React.FC = () => {
    const [h, setH] = useState(200);
    const [s, setS] = useState(80);
    const [l, setL] = useState(50);
    const hsl = `hsl(${h} ${s}% ${l}%)`;

    const hslToHex = (h: number, s: number, l: number) => {
      s /= 100; l /= 100;
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = l - c / 2;
      let r = 0, g = 0, b = 0;
      if (0 <= h && h < 60) { r = c; g = x; b = 0; }
      else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
      else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
      else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
      else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
      else { r = c; g = 0; b = x; }
      const to255 = (v: number) => Math.round((v + m) * 255);
      const hex = (n: number) => n.toString(16).padStart(2, '0');
      return `#${hex(to255(r))}${hex(to255(g))}${hex(to255(b))}`;
    };

    const hex = hslToHex(h, s, l);

    const copy = async () => {
      try { await navigator.clipboard.writeText(hex); } catch {}
    };

    return (
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">HSL Color Picker</h4>
        <div className="rounded-xl p-6 bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-lg border" style={{ background: hsl, borderColor: '#3f3f46' }} />
            <div>
              <div className="text-white font-semibold">{hex}</div>
              <div className="text-sm text-zinc-400">{hsl}</div>
            </div>
            <button onClick={copy} className="ml-auto px-3 py-1.5 rounded-lg bg-zinc-800 text-white text-sm border border-zinc-700 hover:bg-zinc-700">
              Copy
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-zinc-400"><span>Hue</span><span>{h}</span></div>
              <input type="range" min={0} max={360} value={h} onChange={e => setH(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <div className="flex justify-between text-xs text-zinc-400"><span>Saturation</span><span>{s}%</span></div>
              <input type="range" min={0} max={100} value={s} onChange={e => setS(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <div className="flex justify-between text-xs text-zinc-400"><span>Lightness</span><span>{l}%</span></div>
              <input type="range" min={0} max={100} value={l} onChange={e => setL(Number(e.target.value))} className="w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-12 relative">
      {/* Animated Canvas Background */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
      ></canvas>

      <div className="relative z-10">
        <PageTitleEditorial
          eyebrow="Interactive Design"
          title="Interactive Elements"
          subtitle="Advanced interactive components with animations and effects"
        />

        {/* Media Player */}
        <section>
          <MediaPlayer />
        </section>

        {/* Rating and Toggles */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RatingComponent />
            <ToggleSwitches />
          </div>
        </section>

        {/* Sliders */}
        <section>
          <SliderShowcase />
        </section>

        {/* Animated Buttons */}
        <section>
          <AnimatedButtons />
        </section>

        {/* Interactive Cards */}
        <section>
          <h3 className="text-xl font-bold text-white mb-6">Interactive Cards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Flip Card */}
            <div className="group perspective-1000 h-48">
              <div className="relative w-full h-full transition-transform duration-700 preserve-3d group-hover:rotate-y-180">
                {/* Front */}
                <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 flex items-center justify-center">
                  <div className="text-center">
                    <Crown className="w-12 h-12 text-white mx-auto mb-2" />
                    <h4 className="text-white font-bold">Hover Me</h4>
                  </div>
                </div>
                {/* Back */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 flex items-center justify-center">
                  <div className="text-center">
                    <Trophy className="w-12 h-12 text-white mx-auto mb-2" />
                    <h4 className="text-white font-bold">Surprise!</h4>
                    <p className="text-white/80 text-sm">You found the secret</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tilt Card */}
            <div className="group">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl p-6 h-48 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105">
                <div className="text-center">
                  <Brain className="w-12 h-12 text-white mx-auto mb-4" />
                  <h4 className="text-white font-bold mb-2">Smart Card</h4>
                  <p className="text-white/80 text-sm">I tilt when you hover</p>
                </div>
              </div>
            </div>

            {/* Glow Card */}
            <div className="group">
              <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-6 h-48 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-amber-500/50">
                <div className="text-center">
                  <Flame className="w-12 h-12 text-white mx-auto mb-4 group-hover:animate-pulse" />
                  <h4 className="text-white font-bold mb-2">Glow Card</h4>
                  <p className="text-white/80 text-sm">I glow with power</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* New: Mini Kanban, Confetti, Color Picker */}
        <section>
          <h3 className="text-xl font-bold text-white mb-6">More Interactive Widgets</h3>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Mini Kanban */}
            <MiniKanban />

            {/* Confetti Button */}
            <ConfettiDemo />

            {/* Color Picker */}
            <ColorPicker />
          </div>
        </section>
      </div>
    </div>
  );
};

export default InteractiveElementsRoute;
