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
        // delegate to first button if present
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
    // focus first focusable element or the inner container
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose} role="presentation">
      <div
        ref={innerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={`bg-white dark:bg-[var(--raiders-black)] rounded-2xl shadow-lg w-full max-w-lg overflow-hidden ${className || ''}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
          <h3 id={title ? titleId : undefined} className="font-semibold">{title}</h3>
          <button aria-label="Close" className="icon-btn" onClick={onClose}>✕</button>
        </div>

        <div className="p-4">
          {children}
        </div>

        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
