import * as React from 'react';
import { cn } from './utils.js';

export function Badge({ variant = 'muted', className, ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: 'muted' | 'success' }) {
  const base = 'badge';
  const style = variant === 'success' ? 'badge-emerald' : 'badge-muted';
  return <span className={cn(base, style, className)} {...props} />;
}

