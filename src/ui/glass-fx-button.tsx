import * as React from 'react';
import { cn } from './utils.js';
import '../styles/glass-fx.css';

export type GlassFxVariant =
  | 'neon-blue'
  | 'neon-cyan'
  | 'neon-magenta'
  | 'neon-lime'
  | 'holo'
  | 'double-border'
  | 'gradient-border'
  | 'frosted'
  | 'pulse-aura'
  | 'electric'
  | 'crystal'
  | 'plasma';

export interface GlassFxButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: GlassFxVariant;
  block?: boolean;
}

export const GlassFxButton = React.forwardRef<HTMLButtonElement, GlassFxButtonProps>(
  ({ className, variant = 'neon-blue', block, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn('glass-btn', variant, block ? 'w-full' : '', className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
GlassFxButton.displayName = 'GlassFxButton';

