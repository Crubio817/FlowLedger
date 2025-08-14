import React from 'react';

type Props = {
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
  className?: string;
};

export default function Modal({ title, children, footer, onClose, className }: Props) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className={`bg-white dark:bg-[var(--raiders-black)] rounded-2xl shadow-lg w-full max-w-lg overflow-hidden ${className || ''}`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
          <h3 className="font-semibold">{title}</h3>
          <button aria-label="Close" className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="p-4">
          {children}
        </div>
        {footer && (
          <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--surface-2)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
