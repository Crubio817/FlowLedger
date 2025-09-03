import * as React from 'react';
import OutlinedInput, { OutlinedInputProps } from '@mui/material/OutlinedInput';
import { cn } from './utils.js';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => {
  return <input ref={ref} className={cn('input', className)} {...props} />;
});
Input.displayName = 'Input';
Input.displayName = 'Input';
