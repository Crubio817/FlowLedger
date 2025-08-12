import React from 'react';

export const PageHeader: React.FC<{ title: string; subtitle?: string; actions?: React.ReactNode }>= ({ title, subtitle, actions }) => (
  <header className="mb-6 flex flex-col md:flex-row md:items-end gap-3 animate-fadeIn">
    <div className="flex-1">
      <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
      {subtitle && <p className="text-sm text-slate-400 mt-1 max-w-2xl">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </header>
);
