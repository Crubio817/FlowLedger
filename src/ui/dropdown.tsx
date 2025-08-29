import * as React from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { cn } from './utils.js';

export const DropdownMenu = Dropdown.Root;
export const DropdownTrigger = Dropdown.Trigger;
export const DropdownPortal = Dropdown.Portal;

export function DropdownContent({ className, ...props }: React.ComponentPropsWithoutRef<typeof Dropdown.Content>) {
  return (
    <Dropdown.Portal>
      <Dropdown.Content className={cn('popover p-1', className)} align="end" sideOffset={6} {...props} />
    </Dropdown.Portal>
  );
}

export function DropdownItem({ className, inset, ...props }: React.ComponentPropsWithoutRef<typeof Dropdown.Item> & { inset?: boolean }) {
  return <Dropdown.Item className={cn('item', inset && 'pl-8', className)} {...props} />;
}

