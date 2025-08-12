import React from 'react';

export const StatCard: React.FC<{ label: string; value: number | string; onClick?: () => void }>= ({ label, value, onClick }) => (
  <button onClick={onClick} className="panel neon px-5 py-4 text-left hover:shadow-glow focus-ring transition animate-slideUp">
    <div className="label">{label}</div>
    <div className="mt-1 text-2xl font-semibold text-brand-mint">{value}</div>
  </button>
);
