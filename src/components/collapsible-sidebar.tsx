import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import logoPng from '../assets/logo.png';
import {
  LayoutDashboard,
  BookMarked,
  Users2,
  Workflow,
  StickyNote,
  ChevronLeft,
  ChevronRight,
  Table,
} from 'lucide-react';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'clients', to: '/clients', icon: Users2, label: 'Clients' },
    { id: 'audits', to: '/audits', icon: StickyNote, label: 'Audits' },
    { id: 'projects', to: '/clients/engagements', icon: Workflow, label: 'Projects' },
    { id: 'onboarding', to: '/clients/onboarding', icon: BookMarked, label: 'Onboarding' },
    { id: 'sipoc', to: '/sipoc', icon: BookMarked, label: 'SIPOC' },
    { id: 'interviews', to: '/interviews', icon: Users2, label: 'Interviews' },
    { id: 'process-maps', to: '/process-maps', icon: Workflow, label: 'Process Maps' },
    { id: 'findings', to: '/findings', icon: StickyNote, label: 'Findings' },
    { id: 'templates', to: '/templates', icon: BookMarked, label: 'Templates' },
    { id: 'table-demo', to: '/table-demo', icon: Table, label: 'Table Demo' },
  ];

  return (
    <>
      {/* Spacer to reserve collapsed rail width so workspace doesn't shift */}
      <div className="w-20 shrink-0" aria-hidden="true" />
      {/* Fixed overlay sidebar; expands over workspace smoothly */}
      <div
        className={`${isCollapsed ? 'w-20' : 'w-64'} fixed left-0 top-0 z-40 bg-zinc-950 border-r border-zinc-800 flex flex-col shadow-2xl transition-[width] duration-300 ease-out`}
        style={{ minHeight: '100vh', overflow: 'hidden', willChange: 'width' }}
        onMouseEnter={() => isCollapsed && setIsCollapsed(false)}
        onMouseLeave={() => !isCollapsed && setIsCollapsed(true)}
      >
      {/* Header */}
      <div className={`border-b border-zinc-800 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 pt-4 pb-4`}>
        <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}> 
          <img src={logoPng} alt="FlowLedger" className="w-10 h-10 rounded" />
          {!isCollapsed && (
            <span className="text-white font-semibold text-lg tracking-wide">FlowLedger</span>
          )}
        </div>
      </div>
  {/* Menu Items */}
  <nav className={`flex-1 p-4 space-y-2 ${isCollapsed ? 'overflow-hidden' : 'overflow-y-auto scrollbar-hide'}`}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.to}
              title={item.label}
              className={({ isActive }) => `w-full flex items-center ${
                isCollapsed ? 'justify-center' : 'justify-start'
              } px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-[#4997D0] bg-opacity-10 text-[#4997D0] shadow-lg shadow-[#4997D0]/10' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              {({ isActive }) => (
                <>
                  <Icon 
                    size={20} 
                    className={`${isActive ? 'text-[#4997D0]' : 'text-zinc-400 group-hover:text-white'} transition-colors`}
                  />
                  {!isCollapsed && (
                    <span className="ml-3 font-medium transition-opacity duration-200 ease-out">{item.label}</span>
                  )}
                  {/* Tooltip for collapsed state, only show if not active */}
                  {isCollapsed && !isActive && (
                    <div className="fixed left-20 top-auto px-2 py-1 bg-zinc-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[9999] border border-zinc-700" style={{marginTop: '-8px'}}>
                      {item.label}
                    </div>
                  )}
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8" style={{backgroundColor: '#4997D0', borderRadius: '9999px', boxShadow: '0 0 8px #4997D0'}}></div>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
      {/* Bottom section removed per request */}
      </div>
    </>
  );
};

export default Sidebar;