import React from 'react';
export const StatusScopeBadge: React.FC<{ scope?: 'active'|'prospect'|null }>=({ scope })=>{
  if (!scope) return null;
  const cls = scope === 'active' ? 'bg-sky-500/20 text-sky-300' : 'bg-amber-500/20 text-amber-300';
  return <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${cls}`}>{scope === 'active' ? 'Active' : 'Prospect'}</span>;
};
