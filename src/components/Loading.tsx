import React from 'react';

export const Loading: React.FC<{ label?: string }>= ({ label = 'Loading' }) => (
  <div className="flex items-center gap-3 text-slate-400 text-sm">
    <span className="h-2 w-2 rounded-full bg-brand-mint animate-pulse"></span>
    {label}
  </div>
);
