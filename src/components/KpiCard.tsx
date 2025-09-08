import React, { useEffect, useRef, useState } from 'react';

export type KpiTrendPoint = number;

export interface KpiCardProps {
  title: string;
  value: number | string | null | undefined;
  icon?: React.ReactNode;
  tint?: string; // tailwind color e.g. '#4997D0'
  deltaPct?: number; // percent change vs previous period
}

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

function useCountUp(target: number, duration = 600) {
  const [val, setVal] = useState(0);
  const startTs = useRef<number | null>(null);
  useEffect(() => {
    if (typeof target !== 'number' || !isFinite(target)) {
      setVal(0);
      return;
    }
    startTs.current = null;
    let raf: number;
    const tick = (ts: number) => {
      if (!startTs.current) startTs.current = ts;
      const p = clamp((ts - startTs.current) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

// Sparkline removed per request

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, tint = '#4997D0', deltaPct }) => {
  const numeric = typeof value === 'number' ? value : Number(value ?? 0);
  const animated = useCountUp(isFinite(numeric) ? numeric : 0);
  const showAnimated = typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value));
  const stroke = tint;

  return (
    <div
      className={`w-full text-left rounded-2xl p-4 transition-all group`}
      style={{
        background: 'linear-gradient(180deg, rgba(24,24,27,0.9), rgba(24,24,27,0.6))',
        border: '1px solid rgba(63,63,70,0.6)',
        boxShadow: '0 8px 28px rgba(0,0,0,0.25)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] leading-4 text-zinc-400">{title}</p>
          <div className="mt-1.5 flex items-end gap-2">
            <p className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {showAnimated ? animated.toLocaleString() : String(value ?? '—')}
            </p>
            {typeof deltaPct === 'number' && (
              <span className={`text-xs px-1.5 py-0.5 rounded-md ${deltaPct >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                {deltaPct >= 0 ? '+' : ''}{deltaPct}%
              </span>
            )}
          </div>
        </div>
    <div className="flex items-center gap-3">
          {/* icon lip/pill */}
          <div
            className="relative isolate rounded-xl px-2.5 py-2 transition-transform group-hover:scale-105"
            style={{
              background: `linear-gradient(180deg, ${tint}1A, #00000000)`,
              boxShadow: `inset 0 0 0 1px ${tint}44, 0 6px 16px ${tint}22`
            }}
          >
            <div className="absolute inset-0 -z-10 rounded-xl blur-md opacity-40" style={{ background: `${tint}22` }} />
            <div className="w-5 h-5" style={{ color: tint }}>{icon}</div>
          </div>
        </div>
      </div>
  {/** progress bar removed by request **/}
  </div>
  );
};

export default KpiCard;
