import React from 'react';
import { NavLink } from 'react-router-dom';
import { Logo } from '../assets/Logo.tsx';
import { useAppStore } from '../store/useAppStore.ts';
import { Sun, Moon } from 'lucide-react';

export const NavBar: React.FC = () => {
  const accent = useAppStore(s => s.accent);
  const toggleAccent = useAppStore(s => s.toggleAccent);
  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-brand-blue-800 shadow-soft">
      <Logo />
      <div className="flex items-center gap-6 text-sm">
        <NavLink to="/dashboard" className={({isActive}) => isActive ? 'text-brand-mint font-medium' : 'hover:text-brand-mint transition-colors'}>Dashboard</NavLink>
        <NavLink to="/sipoc" className={({isActive}) => isActive ? 'text-brand-mint font-medium' : 'hover:text-brand-mint transition-colors'}>SIPOC</NavLink>
        <NavLink to="/interviews" className={({isActive}) => isActive ? 'text-brand-mint font-medium' : 'hover:text-brand-mint transition-colors'}>Interviews</NavLink>
  <NavLink to="/process-maps" className={({isActive}) => isActive ? 'text-brand-mint font-medium' : 'hover:text-brand-mint transition-colors'}>Process Maps</NavLink>
        <NavLink to="/findings" className={({isActive}) => isActive ? 'text-brand-mint font-medium' : 'hover:text-brand-mint transition-colors'}>Findings</NavLink>
        <button onClick={toggleAccent} className="rounded-full p-1 bg-brand-blue-900 hover:bg-brand-mint/10 transition-colors" aria-label="Toggle accent color">
          {accent === 'mint' ? <Sun size={16}/> : <Moon size={16}/>}      
        </button>
      </div>
    </nav>
  );
};
