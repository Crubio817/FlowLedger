import * as React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from './utils.js';

// Small accessible dropdown menu wrapper using Radix
export const Menu = DropdownMenu.Root;
export const MenuTrigger = DropdownMenu.Trigger;

export function MenuContent({ children, className, ...props }: React.ComponentProps<typeof DropdownMenu.Content>) {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        {...props}
        sideOffset={8}
        className={cn('bg-black/80 p-2 rounded shadow z-50 min-w-[160px] text-sm', className)}
      >
        {children}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  );
}

export const MenuItem: React.FC<React.PropsWithChildren<{ onSelect?: () => void; disabled?: boolean; className?:string }>> = ({ children, onSelect, disabled, className }) => {
  return (
    <DropdownMenu.Item
      className={cn('px-3 py-1 text-left rounded hover:bg-white/5 disabled:opacity-50', className)}
      onSelect={(e)=>{ if (disabled) { e.preventDefault(); return; } if (onSelect) onSelect(); }}
      disabled={disabled}
    >
      {children}
    </DropdownMenu.Item>
  );
};

export const MenuSeparator = DropdownMenu.Separator;

// --- Legacy Popover API (compat layer) ---
export type PopoverContextShape = {
  open: boolean;
  setOpen: (v: boolean) => void;
  anchorEl: HTMLElement | null;
  setAnchorEl: (el: HTMLElement | null) => void;
};

export const PopoverContext = React.createContext<PopoverContextShape | null>(null);

export const Popover: React.FC<React.PropsWithChildren<{ open?: boolean; onOpenChange?: (o: boolean) => void }>> = ({ children, open: controlledOpen, onOpenChange }) => {
  const [openState, setOpenState] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = controlledOpen ?? openState;
  const setOpen = (v: boolean) => {
    if (onOpenChange) onOpenChange(v);
    setOpenState(v);
  };
  return <PopoverContext.Provider value={{ open, setOpen, anchorEl, setAnchorEl }}>{children}</PopoverContext.Provider>;
};

export const PopoverTrigger: React.FC<React.PropsWithChildren<{ asChild?: boolean }>> = ({ children }) => {
  const ctx = React.useContext(PopoverContext);
  const child = React.Children.only(children) as React.ReactElement;
  if (!ctx) return child;
  const handleClick = (e: React.MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    ctx.setAnchorEl(target);
    ctx.setOpen(!ctx.open);
    if (child.props.onClick) child.props.onClick(e);
  };
  return React.cloneElement(child, { onClick: handleClick });
};

export function PopoverContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) {
  const ctx = React.useContext(PopoverContext);
  if (!ctx || !ctx.open) return null;
  const [style, setStyle] = React.useState<React.CSSProperties | null>(null);
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useLayoutEffect(() => {
    const anchor = ctx.anchorEl;
    if (!anchor) {
      setStyle({ position: 'absolute' });
      return;
    }
    const rect = anchor.getBoundingClientRect();
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const maxWidth = Math.min(360, vw - 32);
    const left = Math.max(8, Math.min(rect.left, vw - maxWidth - 8));
    const top = rect.bottom + window.scrollY + 8;
    setStyle({ position: 'absolute', left: Math.round(left) + 'px', top: Math.round(top) + 'px', maxWidth: maxWidth + 'px', overflow: 'auto', maxHeight: '60vh' });
  }, [ctx.anchorEl, ctx.open]);

  return (
    <div ref={ref} style={style ?? undefined} className={cn('popover p-1', className)} {...props}>
      {children}
    </div>
  );
}

