import React from 'react';

export const PageHeader: React.FC<{ 
  title: string; 
  subtitle?: string; 
  actions?: React.ReactNode;
  eyebrow?: string;
}>= ({ title, subtitle, actions, eyebrow }) => (
  <header className="mb-8 animate-fadeIn">
    <div className="flex flex-col md:flex-row md:items-end gap-4">
      <div className="flex-1">
        {eyebrow && (
          <div className="text-xs font-medium text-[#4997D0] uppercase tracking-wide mb-2">
            {eyebrow}
          </div>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{title}</h1>
        {subtitle && (
          <p className="text-lg text-zinc-400 leading-relaxed">{subtitle}</p>
        )}
        <div className="mt-4 w-16 h-px bg-zinc-700"></div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  </header>
);
