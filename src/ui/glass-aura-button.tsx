import * as React from 'react';
import { cn } from './utils.js';
import '../styles/glass-aura.css';

export type GlassAuraTone =
  | 'blue'
  | 'green'
  | 'pink'
  | 'violet'
  | 'amber'
  | 'crimson'
  | 'sky'
  | 'mint'
  | 'coral'
  | 'lavender'
  | 'orange'
  | 'emerald';

export interface GlassAuraButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: GlassAuraTone;
  block?: boolean;
  animated?: 'odd' | 'even' | false;
}

export const GlassAuraButton = React.forwardRef<HTMLButtonElement, GlassAuraButtonProps>(
  ({ className, tone = 'blue', block, animated = false, children, ...props }, ref) => {
    const toneClass = `glass-aura-${tone}`;
    const animClass = animated === 'odd' ? 'float-odd' : animated === 'even' ? 'float-even' : '';
    return (
      <button
        ref={ref}
        className={cn('glass-aura', toneClass, block ? 'w-full' : '', animClass, className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
GlassAuraButton.displayName = 'GlassAuraButton';

