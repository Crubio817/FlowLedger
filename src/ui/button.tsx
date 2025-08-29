import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils.js';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-full border text-sm font-semibold transition-colors select-none disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent-active)] focus-visible:outline-offset-2',
  {
    variants: {
      variant: {
        primary: 'bg-[color-mix(in_srgb,var(--accent-active)_85%,#111_15%)] text-black border-white/20 hover:brightness-95',
        ghost: 'bg-transparent text-[var(--text-1)] border-white/20 hover:bg-white/5',
        outline: 'bg-transparent text-[var(--text-1)] border-white/20 hover:bg-white/5',
        minimal: 'bg-transparent text-[var(--text-1)] border-white/15 hover:bg-white/5 font-semibold',
        subtle: 'bg-[var(--surface-3)] text-[var(--text-1)] border-white/10 hover:bg-white/10',
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-9 px-4',
        lg: 'h-10 px-5',
      },
    },
    defaultVariants: { variant: 'ghost', size: 'md' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = 'Button';

export { buttonVariants };

