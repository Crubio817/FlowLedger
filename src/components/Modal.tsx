import React, { useEffect, useRef } from 'react';

type Props = {
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
  className?: string;
};

export default function Modal({ title, children, footer, onClose, className }: Props) {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const titleId = React.useId ? React.useId() : 'modal-title';

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const el = innerRef.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const btn = el?.querySelector<HTMLButtonElement>('button:not([disabled])');
        if (btn) btn.click();
      }
    };

    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !el) return;
      const focusable = Array.from(el.querySelectorAll<HTMLElement>('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])')).filter(a => !a.hasAttribute('disabled'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('keydown', trap);
    setTimeout(() => {
      try {
        const focusable = el?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        (focusable || el)?.focus();
      } catch {}
    }, 0);

    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keydown', trap);
      if (prev && typeof prev.focus === 'function') prev.focus();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose} role="presentation">
      <div
        ref={innerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={`relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-[0_28px_80px_rgba(0,0,0,0.65)] bg-[var(--surface-2)] text-[var(--text-1)] ${className || ''}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[var(--surface-2)]/95 backdrop-blur">
          <h3 id={title ? titleId : undefined} className="font-semibold tracking-tight">{title}</h3>
          <button aria-label="Close" className="icon-btn rounded-full bg-white/5 hover:bg-white/10" onClick={onClose}>✕</button>
        </div>

        <div className="px-6 py-5 max-h-[70vh] overflow-auto">
          {children}
        </div>

        {footer && (
          <div className="modal-footer bg-[var(--surface-2)]/95 backdrop-blur">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
