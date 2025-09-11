import React, { useEffect, useMemo, useRef, useState } from 'react';

export type CommandItem = {
  id: string;
  label: string;
  hint?: string;
  onSelect: () => void;
  icon?: React.ReactNode;
};

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  items: CommandItem[];
  placeholder?: string;
}

export default function CommandPalette({ open, onOpenChange, items, placeholder = 'Search commands…' }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === 'Escape' && open) onOpenChange(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
    else setQuery('');
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(i => i.label.toLowerCase().includes(q) || (i.hint && i.hint.toLowerCase().includes(q)));
  }, [items, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-6 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)}>
      <div className="w-full max-w-xl rounded-2xl border border-zinc-700 bg-zinc-950 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
          <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-zinc-800 text-zinc-300 border border-zinc-700">⌘K</kbd>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-white placeholder-zinc-500"
          />
        </div>
        <div className="max-h-80 overflow-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-sm text-zinc-500">No results</div>
          ) : (
            filtered.map(item => (
              <button
                key={item.id}
                onClick={() => { item.onSelect(); onOpenChange(false); }}
                className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-zinc-900/60 border-b border-zinc-900/40 last:border-b-0"
              >
                {item.icon && <div className="w-4 h-4 text-zinc-400">{item.icon}</div>}
                <span className="text-white">{item.label}</span>
                {item.hint && <span className="ml-auto text-xs text-zinc-500">{item.hint}</span>}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

