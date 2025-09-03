import React from 'react';
export const ActiveBadge: React.FC<{ active?: boolean }> = ({ active }) => (
  <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/60'}`}>{active ? 'Active' : 'Inactive'}</span>
);
