import React from 'react';
import { useAppStore } from '../store/useAppStore.ts';
import { Sun, Moon } from 'lucide-react';

export const NavBar: React.FC = () => {
  const theme = useAppStore(s => s.theme);
  const toggleTheme = useAppStore(s => s.toggleTheme);
  return (
    <nav className="flex items-center gap-4">
      <button onClick={toggleTheme} className="rounded-md px-2 py-1 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border-subtle)] text-[var(--text-2)] text-xs tracking-wide" aria-label="Toggle theme mode">
        {theme === 'dark' ? <Sun size={14}/> : <Moon size={14}/>}
      </button>
    </nav>
  );
};
