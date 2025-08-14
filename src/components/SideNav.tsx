import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
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
  const [collapsed, setCollapsed] = useState(true); // collapsed by default

  return (
    <aside
      className={`h-screen flex-shrink-0`}
      style={{
        background: '#191919',
        width: collapsed ? '48px' : '240px',
        transition: 'width 0.2s',
        borderRight: '1px solid #333',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {collapsed ? (
        <>
          <div className="flex flex-col items-center pt-8 pb-2">
            <div className="w-12 h-12 rounded-sm bg-orange-600 mb-2" />
            <button
              onClick={() => setCollapsed(false)}
              className="w-9 h-9 flex items-center justify-center text-gray-300"
              aria-label="Expand sidebar"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1 mt-4">
            {links.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `w-9 h-9 flex items-center justify-center text-gray-300 ${isActive ? 'bg-[#111111]' : ''}`
                }
                title={l.label}
              >
                {l.icon}
              </NavLink>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col items-center pt-8 pb-2">
            <div className="text-2xl font-bold mb-2">FlowLedger</div>
            <button
              onClick={() => setCollapsed(true)}
              className="w-9 h-9 flex items-center justify-center text-gray-300"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-auto px-2 py-3">
            <nav className="space-y-1">
              {links.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    isActive
                      ? 'flex items-center gap-3 px-3 py-2 cursor-pointer font-bold text-white text-lg'
                      : 'flex items-center gap-3 px-3 py-2 cursor-pointer text-gray-300 text-lg'
                  }
                >
                  <div className="w-6 text-gray-300">{link.icon}</div>
                  <div>{link.label}</div>
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="px-4 py-3 text-xs text-gray-400">
            © {new Date().getFullYear()}
          </div>
        </>
      )}
    </aside>
  );
};

