import React from 'react';

export const Tile: React.FC<{ title: string; description: string; onClick?: () => void; icon?: React.ReactNode }>= ({ title, description, onClick, icon }) => (
  <button onClick={onClick} className="group rounded-2xl card hoverable p-5 text-left focus-ring transition flex flex-col gap-3">
    <div className="flex items-center gap-2 text-sm font-medium text-white">{icon}{title}</div>
    <p className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">{description}</p>
  </button>
);
