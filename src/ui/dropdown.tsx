import * as React from 'react';
import { cn } from './utils.js';
import { Menu, MenuTrigger, MenuContent, MenuItem } from './popover.js';

// Compatibility wrapper: keep the old Dropdown API but implement it using the new Menu primitives.
// This allows existing files to keep importing DropdownMenu/DropdownTrigger/DropdownContent/DropdownItem
// without changes while the underlying implementation is consistent.

export const DropdownMenu: React.FC<React.PropsWithChildren> = ({ children }) => {
  // Render children as-is under Menu root — callers expect to pass DropdownTrigger and DropdownContent
  // inside this container; we just render a Menu.Root-equivalent using Menu as a wrapper.
  return <Menu>{children}</Menu>;
};

export const DropdownTrigger: React.FC<React.PropsWithChildren<{ asChild?: boolean; disabled?: boolean }>> = ({ children }) => {
  // Translate DropdownTrigger -> MenuTrigger
  return <MenuTrigger asChild>{children as React.ReactNode}</MenuTrigger>;
};

export function DropdownContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) {
  return <MenuContent className={cn(String(className || ''), '')} {...(props as any)}>{children}</MenuContent>;
}

export function DropdownItem({ className, inset, children, onSelect, disabled, ...props }: React.HTMLAttributes<HTMLDivElement> & { inset?: boolean; onSelect?: () => void; disabled?: boolean; children?: React.ReactNode }) {
  return (
    <MenuItem onSelect={onSelect} disabled={disabled} className={cn(String(className || ''), inset ? 'pl-8' : '')} {...(props as any)}>
      {children}
    </MenuItem>
  );
}

