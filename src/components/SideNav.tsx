import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Logo } from '../assets/Logo.tsx';
import {
  LayoutDashboard,
  BookMarked,
  Users2,
  Workflow,
  StickyNote,
  ChevronLeft,
} from 'lucide-react';

const links: { to: string; label: string; icon: React.ReactNode }[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/clients', label: 'Clients', icon: <Users2 size={18} /> },
  { to: '/sipoc', label: 'SIPOC', icon: <BookMarked size={18} /> },
  { to: '/interviews', label: 'Interviews', icon: <Users2 size={18} /> },
  { to: '/process-maps', label: 'Process Maps', icon: <Workflow size={18} /> },
  { to: '/findings', label: 'Findings', icon: <StickyNote size={18} /> },
];

export const SideNav: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside className={`sidenav${collapsed ? ' collapsed' : ''}`}>
      <div className="logo-row">
        <Logo />
        <span className="text-sm font-medium tracking-wide">FlowLedger</span>
      </div>
      <div className="nav-section">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => (isActive ? 'active' : undefined)}
          >
            {link.icon}
            <span className="label-text">{link.label}</span>
          </NavLink>
        ))}
      </div>
      <div className="nav-section">
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(c => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft
            size={18}
            className={collapsed ? 'transition-transform rotate-180' : 'transition-transform'}
          />
        </button>
      </div>
      <div className="footer-bar">
        <div className="meta footer-text">© {new Date().getFullYear()}</div>
      </div>
    </aside>
  );
};

