import React from 'react';

export const Logo: React.FC<{ className?: string }>= ({ className }) => (
  <div className={`flex items-center gap-2 font-semibold tracking-wide ${className ?? ''}`}>
    <span>FlowLedger</span>
  </div>
);
