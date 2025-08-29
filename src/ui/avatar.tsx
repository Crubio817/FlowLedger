import * as React from 'react';
import { cn } from './utils.js';

export function Avatar({ name, className }: { name?: string | null; className?: string }) {
  const initials = String(name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <span className={cn('avatar', className)} aria-hidden>
      {initials || '?'}
    </span>
  );
}

