import React from 'react';

export const StatCard: React.FC<{ label: string; value: number | string; onClick?: () => void }>= ({ label, value, onClick }) => (
  <button onClick={onClick} className="rounded-2xl bg-brand-blue-800 px-5 py-4 text-left shadow-soft hover:shadow-md focus-ring transition animate-slideUp">
    <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
    <div className="mt-1 text-2xl font-semibold text-brand-mint">{value}</div>
  </button>
);
