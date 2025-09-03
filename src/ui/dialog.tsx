import * as React from 'react';
import Modal from '../components/Modal.tsx';

export function Dialog({ open, onOpenChange, children, className }: { open?: boolean; onOpenChange?: (v:boolean)=>void; children?: React.ReactNode; className?:string }) {
  if (!open) return null;
  // Attempt to read a title string from children if a DialogHeader was provided
  let title: React.ReactNode | undefined = undefined;
  React.Children.forEach(children, child => {
    // crude extraction: if child is an element with props.title use it
    if (React.isValidElement(child) && (child as any).props && (child as any).props.children) {
      const inner = (child as any).props.children;
      if (React.isValidElement(inner) && (inner as any).props && (inner as any).props.title) {
        title = (inner as any).props.title;
      }
    }
  });

  return (
    <Modal title={typeof title === 'string' ? title : undefined} onClose={() => onOpenChange?.(false)} className={className} closeOnBackdrop={false}>
      {children}
    </Modal>
  );
}

export const DialogTrigger = ({ children }: { children?: React.ReactNode }) => <>{children}</>;

export const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ children, className, ...props }, ref) => (
  <div ref={ref} className={className} {...props}>{children}</div>
));
DialogContent.displayName = 'DialogContent';

export function DialogHeader({ title, subtitle, className }: { title?: React.ReactNode; subtitle?: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="flex items-start justify-between gap-3 px-6 py-4">
        <div>
          {title && <div className="text-lg font-semibold">{title}</div>}
          {subtitle && <div className="text-sm text-[var(--text-2)]">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}

export const DialogBody = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);

export const DialogFooter = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);

export const DialogClose = ({ onClick }: { onClick?: ()=>void }) => (
  <button aria-label="close" className="icon-btn" onClick={onClick}>✕</button>
);

export default Dialog;


