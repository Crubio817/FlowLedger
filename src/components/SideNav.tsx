import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import * as Tooltip from '@radix-ui/react-tooltip';
import { cn } from '../ui/utils.js';
import {
  LayoutDashboard,
  BookMarked,
  Users2,
  Workflow,
  StickyNote,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

type LinkItem = { to: string; label: string; icon: React.ReactNode };

const links: LinkItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/clients', label: 'Clients', icon: <Users2 size={18} /> },
  { to: '/sipoc', label: 'SIPOC', icon: <BookMarked size={18} /> },
  { to: '/interviews', label: 'Interviews', icon: <Users2 size={18} /> },
  { to: '/process-maps', label: 'Process Maps', icon: <Workflow size={18} /> },
  { to: '/findings', label: 'Findings', icon: <StickyNote size={18} /> },
];

export const SideNav: React.FC = () => {
  const storageKey = 'ui:sidebarCollapsed';
  const [collapsed, setCollapsed] = useState<boolean>(true);

  // hydrate from localStorage and persist changes
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw != null) setCollapsed(raw === '1');
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    try { localStorage.setItem(storageKey, collapsed ? '1' : '0'); } catch {}
  }, [collapsed]);

  return (
    <aside className={cn('sidenav', collapsed && 'collapsed')}>
      {/* header */}
      {collapsed ? (
        <div className="nav-section items-center">
          <div className="flex flex-col items-center gap-2 pt-1">
            <span role="img" aria-label="logo" className="text-xl">😊</span>
            <button
              className="collapse-btn"
              aria-label="Expand sidebar"
              aria-expanded={!collapsed}
              onClick={() => setCollapsed(false)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="nav-section">
          <div className={cn('logo-row', 'flex items-center justify-between pl-2')}
               aria-label="Brand">
            <span className="inline-flex items-center gap-2">
              <span role="img" aria-label="logo" className="text-xl">😊</span>
              <span className="font-semibold">FlowLedger</span>
            </span>
            <button
              className="collapse-btn"
              aria-label="Collapse sidebar"
              aria-expanded={!collapsed}
              onClick={() => setCollapsed(true)}
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        </div>
      )}

      {/* primary nav */}
      {collapsed ? (
        <Tooltip.Provider delayDuration={400} skipDelayDuration={200}>
          <nav aria-label="Primary" className="nav-section items-center">
            {links.map((l) => (
              <Tooltip.Root key={l.to}>
                <Tooltip.Trigger asChild>
                  <NavLink to={l.to} className={({ isActive }) => cn('icon-btn', isActive && 'active')}>
                    {l.icon}
                  </NavLink>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className="popover px-2 py-1 text-xs" side="right" sideOffset={8}>
                    {l.label}
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            ))}
          </nav>
        </Tooltip.Provider>
      ) : (
        <nav aria-label="Primary" className="nav-section">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg',
                  isActive ? 'active bg-[rgba(255,255,255,0.03)] text-white font-semibold' : 'text-[#f5f6f7]'
                )
              }
            >
              <span className="w-5 h-5 inline-flex items-center justify-center">{link.icon}</span>
              <span className="label-text">{link.label}</span>
            </NavLink>
          ))}
        </nav>
      )}

      {/* footer/meta placeholder */}
      <div className="meta text-xs opacity-70">
        <div className="footer-text">v1.0</div>
      </div>
    </aside>
  );
};
