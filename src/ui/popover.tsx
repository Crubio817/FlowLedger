import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from './utils.js';

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;

export function PopoverContent({ className, ...props }: React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content className={cn('popover p-1', className)} {...props} />
    </PopoverPrimitive.Portal>
  );
}

