import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore.ts';
import { NavLink } from 'react-router-dom';
import { Logo } from '../assets/Logo.tsx';
import { LayoutDashboard, BookMarked, Users2, Workflow, StickyNote, ChevronLeft, ChevronRight } from 'lucide-react';

const links: { to: string; label: string; icon: React.ReactNode }[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16}/> },
  { to: '/clients', label: 'Clients', icon: <Users2 size={16}/> },
  { to: '/sipoc', label: 'SIPOC', icon: <BookMarked size={16}/> },
  { to: '/interviews', label: 'Interviews', icon: <Users2 size={16}/> },
  { to: '/process-maps', label: 'Process Maps', icon: <Workflow size={16}/> },
  { to: '/findings', label: 'Findings', icon: <StickyNote size={16}/> }
];

export const SideNav: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
<<<<<<< Updated upstream
  const theme = useAppStore(s => s.theme);
  const toggleTheme = useAppStore(s => s.toggleTheme);
=======
  // theme toggle removed: app is dark-only now
>>>>>>> Stashed changes
  return (
    <aside className={"sidenav" + (collapsed ? ' collapsed' : '')}>
      <div className="logo-row">
        <Logo />
<<<<<<< Updated upstream
        <span className="text-sm font-medium tracking-wide">FlowLedger</span>
      </div>
      <div className="nav-section">
        <button className="collapse-btn" onClick={() => setCollapsed(c => !c)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? <ChevronRight size={18}/> : <ChevronLeft size={18}/>}
        </button>
      </div>
      <div className="nav-section">
=======
      </div>
      <div className="nav-section">
        <button className="collapse-btn" onClick={() => setCollapsed(c => !c)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {/* plain chevron glyph; CSS rotates when collapsed */}
          <span className={"chev" + (collapsed ? ' rotated' : '')} aria-hidden>
            <ChevronLeft size={18} />
          </span>
        </button>
      </div>
      <div className="nav-section">
        <div className="nav-heading">Primary</div>
>>>>>>> Stashed changes
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) => isActive ? 'active' : undefined}
          >
            {l.icon}
            <span className="label-text">{l.label}</span>
          </NavLink>
        ))}
      </div>
<<<<<<< Updated upstream
      <div className="meta footer-text flex flex-col gap-2">
          <button onClick={toggleTheme} className="icon-btn" aria-label="Toggle theme" title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}>
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
  <div className="text-[11px] opacity-70">© {new Date().getFullYear()}</div>
=======
      <div className="footer-bar">
        <div className="meta">© {new Date().getFullYear()}</div>
>>>>>>> Stashed changes
      </div>
    </aside>
  );
};

// Minimal inline icons to avoid extra imports (reuse existing lucide stroke style)
const SunIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l1.41-1.41m8.5-8.5 1.41-1.41"/></svg>
);
const MoonIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 1 0 21 12.79z"/></svg>
);
