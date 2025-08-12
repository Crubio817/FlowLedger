import React from 'react';
import { NavLink } from 'react-router-dom';
import { Logo } from '../assets/Logo.tsx';
import { useAppStore } from '../store/useAppStore.ts';
import { Sun, Moon } from 'lucide-react';

export const NavBar: React.FC = () => {
  const accent = useAppStore(s => s.accent);
  const toggleAccent = useAppStore(s => s.toggleAccent);
  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-white/5 backdrop-blur-md border-b border-white/10 shadow-soft relative">
      <Logo />
      <div className="flex items-center gap-6 text-sm">
        <NavLink to="/dashboard" className={({isActive}) => isActive ? 'relative text-brand-mint font-medium after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:bg-brand-mint after:opacity-90 after:shadow-glow' : 'hover:text-brand-mint transition-colors'}>Dashboard</NavLink>
        <NavLink to="/sipoc" className={({isActive}) => isActive ? 'relative text-brand-mint font-medium after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:bg-brand-mint after:opacity-90 after:shadow-glow' : 'hover:text-brand-mint transition-colors'}>SIPOC</NavLink>
        <NavLink to="/interviews" className={({isActive}) => isActive ? 'relative text-brand-mint font-medium after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:bg-brand-mint after:opacity-90 after:shadow-glow' : 'hover:text-brand-mint transition-colors'}>Interviews</NavLink>
  <NavLink to="/process-maps" className={({isActive}) => isActive ? 'relative text-brand-mint font-medium after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:bg-brand-mint after:opacity-90 after:shadow-glow' : 'hover:text-brand-mint transition-colors'}>Process Maps</NavLink>
        <NavLink to="/findings" className={({isActive}) => isActive ? 'relative text-brand-mint font-medium after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:bg-brand-mint after:opacity-90 after:shadow-glow' : 'hover:text-brand-mint transition-colors'}>Findings</NavLink>
        <button onClick={toggleAccent} className="rounded-full p-1 bg-white/10 hover:bg-white/20 border border-white/10 transition-colors" aria-label="Toggle accent color">
          {accent === 'mint' ? <Sun size={16}/> : <Moon size={16}/>}      
        </button>
      </div>
    </nav>
  );
};
