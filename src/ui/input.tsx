import * as React from 'react';
import { cn } from './utils.js';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'input rounded-full border border-white/10 bg-[var(--surface-1)] text-[var(--text-1)] px-4 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent-active)]',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

