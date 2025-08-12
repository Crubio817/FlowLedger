import React from 'react';

export const EmptyState: React.FC<{ title: string; message?: string; action?: React.ReactNode }>= ({ title, message, action }) => (
  <div className="text-center p-10 border border-dashed border-slate-700 rounded-2xl">
    <h3 className="font-medium text-slate-200">{title}</h3>
    {message && <p className="text-slate-500 text-sm mt-1">{message}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
