import React from 'react';
import { ActivityItem } from '../store/types.ts';
import { formatUtc } from '@utils/date.ts';

export const ActivityList: React.FC<{ items: ActivityItem[] }>= ({ items }) => (
  <ul className="divide-y divide-[var(--border-subtle)] rounded-2xl card">
    {items.map(i => (
  <li key={i.id} className="px-4 py-3 text-sm flex justify-between hover:bg-[var(--surface-3)] transition-colors">
        <span className="text-slate-300">{i.title}</span>
  <time dateTime={i.timestamp} className="text-slate-500 text-xs tabular-nums">{formatUtc(i.timestamp)}</time>
      </li>
    ))}
    {items.length === 0 && <li className="px-4 py-6 text-center text-slate-500 text-sm">No recent activity.</li>}
  </ul>
);
