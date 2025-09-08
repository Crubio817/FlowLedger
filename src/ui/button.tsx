import * as React from 'react';
import { cn } from './utils.js';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline' | 'minimal' | 'subtle' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  loading?: boolean;
  block?: boolean;
}

const Spinner: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={cn('animate-spin', className)} viewBox="0 0 24 24" width="16" height="16" aria-hidden>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
    <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
  </svg>
);

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = 'primary',
  size = 'md',
  leadingIcon,
  trailingIcon,
  loading,
  block,
  children,
  disabled,
  ...props
}, ref) => {
  const base = 'inline-flex items-center justify-center select-none whitespace-nowrap font-semibold transition-all focus-visible:outline-none disabled:cursor-not-allowed rounded-xl gap-2';

  const vcls = (
    variant === 'primary' ?
      'text-white bg-[var(--accent-active)] shadow-[0_10px_24px_rgba(0,0,0,0.25)] hover:brightness-110 active:brightness-95 focus-visible:ring-2 ring-cyan-400/30 disabled:bg-zinc-700 disabled:text-zinc-300'
    : variant === 'outline' ?
      'text-zinc-100 border border-white/15 bg-transparent hover:bg-white/[0.06] focus-visible:ring-2 ring-white/20'
    : variant === 'ghost' ?
      'text-zinc-200 bg-transparent hover:bg-white/[0.06] focus-visible:ring-2 ring-white/10'
    : variant === 'minimal' ?
      'text-zinc-300 bg-transparent hover:text-white focus-visible:ring-2 ring-white/10'
    : variant === 'subtle' ?
      'text-zinc-100 bg-zinc-800/60 border border-zinc-700/60 hover:bg-zinc-800 focus-visible:ring-2 ring-white/10'
    : /* destructive */
      'text-white bg-rose-600 hover:bg-rose-500 focus-visible:ring-2 ring-rose-300/40'
  );

  const scls = (
    size === 'sm' ? 'text-sm h-8 px-3'
    : size === 'lg' ? 'text-base h-11 px-5'
    : 'text-sm h-9 px-4'
  );

  const width = block ? 'w-full' : '';
  const iconGap = children ? 'gap-2' : 'gap-0';

  return (
    <button
      ref={ref}
      className={cn(base, vcls, scls, width, iconGap, className)}
      disabled={disabled || loading}
      aria-busy={loading ? true : undefined}
      {...props}
    >
      {loading && <Spinner className="text-current" />}
      {!loading && leadingIcon}
      {children}
      {!loading && trailingIcon}
    </button>
  );
});
Button.displayName = 'Button';
