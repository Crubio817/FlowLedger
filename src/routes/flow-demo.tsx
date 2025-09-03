import React from 'react';

type Swatch = { title: string; subtitle: string; gradient: string; glow: string };

const SWATCHES: Swatch[] = [
  { title: 'Red', subtitle: 'passion, love, anger', gradient: 'linear-gradient(90deg,#ff6b6b,#ff3b30)', glow: 'rgba(255,75,75,0.20)' },
  { title: 'Orange', subtitle: 'warmth, energy, happiness', gradient: 'linear-gradient(90deg,#ff9f43,#ff6b00)', glow: 'rgba(255,140,40,0.18)' },
  { title: 'Green', subtitle: 'nature, growth, health', gradient: 'linear-gradient(90deg,#32d583,#0fb27a)', glow: 'rgba(48,200,140,0.18)' },
  { title: 'Yellow', subtitle: 'sunshine, happiness, joy', gradient: 'linear-gradient(90deg,#ffd166,#ffb703)', glow: 'rgba(255,200,60,0.16)' },
  { title: 'Blue', subtitle: 'calmness, trust, loyalty', gradient: 'linear-gradient(90deg,#6ec1ff,#2b8cff)', glow: 'rgba(80,150,255,0.20)' },
  { title: 'Purple', subtitle: 'royalty, creativity, mystery', gradient: 'linear-gradient(90deg,#a78bfa,#7c3aed)', glow: 'rgba(150,110,255,0.18)' },
  { title: 'Pink', subtitle: 'innocence, femininity', gradient: 'linear-gradient(90deg,#ff85c0,#ff4d94)', glow: 'rgba(255,95,150,0.18)' },
  { title: 'Black', subtitle: 'power, sophistication', gradient: 'linear-gradient(90deg,#3a3a3a,#0b0b0b)', glow: 'rgba(20,20,20,0.28)' },
  { title: 'White', subtitle: 'purity, innocence, cleanliness', gradient: 'linear-gradient(90deg,#ffffff,#e6e6e6)', glow: 'rgba(220,220,220,0.12)' },
  { title: 'Brown', subtitle: 'earthiness, reliability', gradient: 'linear-gradient(90deg,#c98f65,#8b5e3c)', glow: 'rgba(160,110,70,0.16)' },
  { title: 'Silver', subtitle: 'modernity, sophistication', gradient: 'linear-gradient(90deg,#c0c6cc,#9aa3ab)', glow: 'rgba(150,160,170,0.16)' },
  { title: 'Gold', subtitle: 'luxury, wealth, success', gradient: 'linear-gradient(90deg,#ffd700,#e6b800)', glow: 'rgba(255,200,60,0.20)' },
];

function ColorSwatch({ title, subtitle, gradient, glow }: Swatch) {
  const containerStyle: React.CSSProperties = {
    boxShadow: `0 10px 30px ${glow}`,
    background: 'rgba(6,10,20,0.45)'
  };

  return (
    <div className="rounded-2xl border border-white/6 p-4 flex items-center gap-4" style={containerStyle}>
      <div className="w-14 h-14 rounded-lg flex-shrink-0" style={{ background: gradient }} />
      <div className="flex-1">
        <div className="text-sm font-semibold text-white/90">{title}</div>
        <div className="text-xs text-white/50">{subtitle}</div>
      </div>
      <div className="ml-2">
        <div className="px-2 py-1 text-xs rounded-xl bg-white/6 text-white">View</div>
      </div>
    </div>
  );
}

export default function FlowDemo() {
  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold text-white mb-6">Flow components demo</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div className="space-y-6">
          <div className="relative w-full p-4 rounded-2xl border border-white/6 bg-[rgba(6,10,20,0.45)] backdrop-blur-md shadow-[0_20px_40px_rgba(3,7,18,0.6)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-white/6 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 2v6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm text-white/90 font-semibold">Workflow trigger</div>
                <div className="text-xs text-white/50">starts the flow</div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl p-4 border border-white/6 min-h-[160px]" style={{ background: 'linear-gradient(180deg,#0b0f14 0%,#061018 100%)' }}>
          <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: '3px 3px' }} />
          <div className="relative z-10">
            <div className="text-sm text-white/70 mb-3">Playground</div>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-white/3">Placeholder slot 1</div>
              <div className="p-3 rounded-lg bg-white/3">Placeholder slot 2</div>
            </div>
          </div>
        </div>
      </div>

      {/* Color swatches section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Color swatches</h2>
          <div className="text-sm text-white/60">A simple preview of color cards</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {SWATCHES.map((s) => (
            <ColorSwatch key={s.title} {...s} />
          ))}
        </div>
      </section>

      <style>{`
        /* subtle hover */
        .rounded-2xl:hover { transform: translateY(-2px); }
      `}</style>
    </div>
  );
}
