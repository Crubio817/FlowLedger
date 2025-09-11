import React, { useEffect, useRef } from 'react';

type Props = {
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
  className?: string;
  closeOnBackdrop?: boolean;
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
  }, []);

  return (
    <div className="modal-backdrop fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" style={{ margin: 0, padding: '1rem' }} onClick={e => { /* default: do not close on backdrop click */ }} role="presentation">
      <div
        ref={innerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={`relative w-full max-w-[900px] max-h-[90vh] mx-auto rounded-xl overflow-hidden border border-zinc-700/50 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(6,182,212,0.05)] bg-zinc-900/95 backdrop-blur-xl text-zinc-100 ${className || ''}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Subtle glass overlay */}
        <div className="absolute inset-[1px] bg-gradient-to-b from-white/5 via-transparent to-transparent rounded-xl opacity-40 pointer-events-none"></div>
        
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700/50 bg-zinc-900/90 backdrop-blur-xl shrink-0">
            <h3 id={title ? titleId : undefined} className="font-semibold tracking-tight text-zinc-100">{title}</h3>
            <button 
              aria-label="Close" 
              className="p-2 rounded-lg bg-zinc-800/60 hover:bg-zinc-700/80 border border-zinc-600/40 hover:border-zinc-500/60 transition-all duration-200 text-zinc-400 hover:text-zinc-200" 
              onClick={onClose}
            >
              <span>✕</span>
            </button>
          </div>

          <div className="flex-1 overflow-auto p-6 pt-4">
            {children}
          </div>

          {footer && (
            <div className="shrink-0 border-t border-zinc-700/50 bg-zinc-900/90 backdrop-blur-xl">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
