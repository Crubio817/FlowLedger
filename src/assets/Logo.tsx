import React from 'react';

export const Logo: React.FC<{ className?: string }>= ({ className }) => (
  <div className={`flex items-center gap-2 font-semibold tracking-wide ${className ?? ''}`}>
    <span className="w-3 h-3 rounded-sm bg-gradient-to-br from-brand-mint to-emerald-500 inline-block"></span>
    <span>FlowLedger</span>
  </div>
);
