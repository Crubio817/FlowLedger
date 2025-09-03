import * as React from 'react';
import { cn } from './utils.js';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline' | 'minimal' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, children, ...props }, ref) => {
  const base = 'inline-flex items-center justify-center rounded-full px-3 py-2 font-semibold';
  const vcls = variant === 'primary'
    ? 'bg-[var(--accent-active)] text-white hover:bg-[color-mix(in_srgb,var(--accent-active)_85%,#3F84B6_15%)] disabled:bg-[#2A2A2A] disabled:text-[#888]'
    : variant === 'outline'
    ? 'border border-white/10 bg-transparent'
    : 'bg-transparent';
  const scls = size === 'sm' ? 'text-sm px-2 py-1' : size === 'lg' ? 'text-base px-4 py-3' : 'text-sm px-3 py-2';
  return (
    <button ref={ref} className={cn(base, vcls, scls, className)} {...props}>
      {children}
    </button>
  );
});
Button.displayName = 'Button';
