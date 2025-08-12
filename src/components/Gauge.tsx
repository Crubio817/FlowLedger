import React from 'react';

export function Gauge({ value = 53, size = 120, accent = 'var(--accent-mint)' }:{ value?: number; size?: number; accent?: string }) {
  const v = Math.max(0, Math.min(100, value));
  const style: React.CSSProperties = {
    ['--val' as any]: v,
    ['--accent' as any]: accent,
    width: size, height: size
  };
  return <div className="gauge" data-value={v} style={style} aria-label={`Progress ${v}%`} role="img"/>;
}
