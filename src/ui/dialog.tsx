import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from './utils.js';
import { Button } from './button.js';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
      <DialogPrimitive.Content
        className={cn(
          'fixed z-50 w-full max-w-2xl rounded-2xl border border-white/10 bg-[var(--surface-2)] text-[var(--text-1)] shadow-[0_28px_80px_rgba(0,0,0,0.65)] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 focus:outline-none',
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({ title, description, onClose }: { title: string; description?: string; onClose?: () => void }) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[var(--surface-2)]/95 backdrop-blur rounded-t-2xl">
      <div>
        <DialogPrimitive.Title className="font-semibold tracking-tight">{title}</DialogPrimitive.Title>
        {description && <DialogPrimitive.Description className="text-sm text-[var(--text-2)] mt-0.5">{description}</DialogPrimitive.Description>}
      </div>
      <DialogPrimitive.Close asChild>
        <Button variant="ghost" size="sm" aria-label="Close">Close</Button>
      </DialogPrimitive.Close>
    </div>
  );
}

export function DialogBody({ children }: { children: React.ReactNode }) {
  return <div className="px-6 py-5 max-h-[70vh] overflow-auto">{children}</div>;
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="modal-footer bg-[var(--surface-2)]/95 backdrop-blur">{children}</div>;
}

