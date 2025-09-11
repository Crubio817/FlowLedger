import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import logoPng from '../assets/logo.png';
import { QuickModuleAccess } from './GlobalModuleLauncher.tsx';
  import {
  LayoutDashboard,
  BookMarked,
  Users2,
  Workflow,
  StickyNote,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Table,
  Menu,
  X,
  Settings,
  Shield,
  BarChart3,
  Users,
  Handshake,
  ClipboardCheck,
  FileText,
  GitBranch,
  Search,
  MessageSquare,
  ClipboardList,
  Zap,
  CreditCard,
  TrendingUp,
  BookOpen,
  Wand2,
  Target,
  MessageCircle,
  Phone,
  UserCheck,
  UserPlus,
  Brain,
} from 'lucide-react';const Sidebar = () => {
  const EXPANDED_SECTIONS_STORAGE_KEY = 'ui:sidebarExpandedSections';
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['clients']));
  // Sections opened via hover (desktop only)
  const [hoveredSections, setHoveredSections] = useState<Set<string>>(new Set());
  // Timers for hover open/close delay
  const hoverTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Hydrate expanded sections from storage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(EXPANDED_SECTIONS_STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) setExpandedSections(new Set(arr));
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Persist expanded sections
  useEffect(() => {
    try { localStorage.setItem(EXPANDED_SECTIONS_STORAGE_KEY, JSON.stringify([...expandedSections])); } catch {}
  }, [expandedSections]);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
        setIsMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isMobileMenuOpen) {
        const sidebar = document.getElementById('mobile-sidebar');
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isMobileMenuOpen]);

  // Hover helpers with small delay (desktop only)
  const handleSectionHover = (sectionId: string, entering: boolean) => {
    if (isMobile) return; // don't use hover open on mobile
    const existing = hoverTimers.current.get(sectionId);
    if (existing) {
      clearTimeout(existing);
      hoverTimers.current.delete(sectionId);
    }
    const delay = entering ? 100 : 140; // ms
    const t = setTimeout(() => {
      setHoveredSections((prev) => {
        const next = new Set(prev);
        if (entering) next.add(sectionId); else next.delete(sectionId);
        return next;
      });
      hoverTimers.current.delete(sectionId);
    }, delay);
    hoverTimers.current.set(sectionId, t);
  };
  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      hoverTimers.current.forEach((t) => clearTimeout(t));
      hoverTimers.current.clear();
    };
  }, []);

  // Ensure an inherited CSS variable on the shared ancestor (.app-shell)
  // exposes the current sidebar width. Full-bleed headers live in the
  // workspace (a descendant of .app-shell) and read this variable.
  // Note: we intentionally do not set the CSS variable on the global
  // .app-shell here to avoid side-effects. The sidebar element itself
  // exposes --sidenav-width inline which allows descendants to read it
  // via inheritance through normal DOM ordering.

    const menuItems = [
    { icon: BarChart3, text: 'Dashboard', href: '/dashboard' },
    { icon: Zap, text: 'Modules', href: '/modules' },
    { 
      icon: TrendingUp, 
      text: 'Workstream', 
      href: '/workstream',
      type: 'expandable' as const,
      children: [
        { icon: BarChart3, text: 'Today Panel', href: '/workstream/today' },
        { icon: Zap, text: 'Enhanced Panel', href: '/workstream/enhanced' },
        { icon: Target, text: 'ICP Analysis', href: '/workstream/icp' },
        { icon: Brain, text: 'Spotlight', href: '/workstream/spotlight' },
        { icon: TrendingUp, text: 'Signals', href: '/workstream/signals' },
        { icon: Users, text: 'Candidates', href: '/workstream/candidates' },
        { icon: Target, text: 'Pursuits', href: '/workstream/pursuits' }
      ]
    },
    { icon: UserPlus, text: 'People', href: '/people' },
    { 
      icon: Users, 
      text: 'Clients', 
      href: '/clients',
      type: 'expandable' as const,
      children: [
        { icon: Search, text: 'Client Finder', href: '/client-finder' },
        { icon: ClipboardList, text: 'Onboarding', href: '/clients/onboarding' }
      ]
    },
    { 
      icon: Handshake, 
      text: 'Engagements', 
      href: '/engagements',
      type: 'expandable' as const,
      children: [
        { 
          icon: ClipboardCheck, 
          text: 'Audits', 
          href: '/audits',
          type: 'expandable' as const,
          children: [
            { icon: FileText, text: 'Templates', href: '/templates' },
            { icon: GitBranch, text: 'Process Maps', href: '/process-maps' },
            { icon: Search, text: 'Findings', href: '/findings' },
            { icon: MessageSquare, text: 'Interviews', href: '/interviews' }
          ]
        }
      ]
    },
  { icon: CreditCard, text: 'Billing', href: '/billing' },
  { icon: Zap, text: 'Automation', href: '/automation' },
    { 
      icon: MessageCircle, 
      text: 'Communication Hub', 
      href: '/comms',
      type: 'expandable' as const,
      children: [
        { icon: MessageCircle, text: 'Threads', href: '/comms/threads' },
        { icon: Search, text: 'Advanced Search', href: '/comms/search' },
        { icon: FileText, text: 'Email Templates', href: '/comms/templates' },
        { icon: UserCheck, text: 'Principals', href: '/settings/principals' }
      ]
    },
    { 
      icon: FileText, 
      text: 'Docs & Knowledge', 
      href: '/documents',
      type: 'expandable' as const,
      children: [
        { icon: FileText, text: 'Documents', href: '/documents' },
        { icon: BookOpen, text: 'Knowledge Base', href: '/knowledge' },
        { icon: Wand2, text: 'Templates', href: '/doc-templates' }
      ]
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-zinc-900/95 backdrop-blur-sm border border-zinc-800/50 rounded-lg shadow-lg lg:hidden"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5 text-zinc-300" />
          ) : (
            <Menu className="w-5 h-5 text-zinc-300" />
          )}
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" />
      )}

      {/* Spacer to reserve collapsed rail width so workspace doesn't shift - only on desktop */}
      {!isMobile && <div className="w-20 shrink-0" aria-hidden="true" />}
      
      {/* Sidebar */}
      <div
        id="mobile-sidebar"
        className={`${
          isMobile 
            ? `fixed left-0 top-0 z-50 w-80 transform transition-transform duration-300 ease-out ${
                isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : `${isCollapsed ? 'w-20' : 'w-64'} fixed left-0 top-0 z-40 transition-[width] duration-300 ease-out`
        } bg-zinc-950 border-r border-zinc-800 flex flex-col shadow-2xl`}
        style={{
          minHeight: '100vh',
          overflow: 'hidden',
          willChange: isMobile ? 'transform' : 'width',
          /* expose current sidebar width to CSS so headers can full-bleed correctly */
          ...(isMobile ? {} : ({ ['--sidenav-width']: isCollapsed ? '80px' : '280px' } as React.CSSProperties)),
        } as React.CSSProperties}
        onMouseEnter={() => !isMobile && isCollapsed && setIsCollapsed(false)}
        onMouseLeave={() => !isMobile && !isCollapsed && setIsCollapsed(true)}
      >
        {/* Header */}
        <div className={`border-b border-zinc-800 flex items-center ${
          isMobile ? 'justify-between px-4 pt-4 pb-4' 
          : isCollapsed ? 'justify-center px-4 pt-4 pb-4' 
          : 'justify-between px-4 pt-4 pb-4'
        }`}>
          <div className={`flex items-center space-x-3 ${
            !isMobile && isCollapsed ? 'justify-center' : ''
          }`}> 
            <img src={logoPng} alt="FlowLedger" className="w-8 h-8 rounded" />
            {(isMobile || !isCollapsed) && (
              <span className="text-white font-semibold text-base tracking-wide">FlowLedger</span>
            )}
          </div>
          {isMobile && (
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Menu Items */}
        <nav className={`flex-1 p-4 space-y-2 ${
          isMobile || !isCollapsed ? 'overflow-y-auto scrollbar-hide' : 'overflow-hidden'
        }`}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedSections.has(item.text);
            
            if (item.type === 'expandable') {
              return (
                <div
                  key={item.text}
                  onMouseEnter={() => handleSectionHover(item.text, true)}
                  onMouseLeave={() => handleSectionHover(item.text, false)}
                >
                  {/* Main expandable item */}
                  <div className="flex">
                    <NavLink
                      to={item.href}
                      title={item.text}
                      onClick={() => isMobile && setIsMobileMenuOpen(false)}
                      className={({ isActive }) => `flex-1 flex items-center ${
                        !isMobile && isCollapsed ? 'justify-center' : 'justify-start'
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
                          {(isMobile || !isCollapsed) && (
                            <span className="ml-3 font-medium transition-opacity duration-200 ease-out">{item.text}</span>
                          )}
                          {/* Tooltip for collapsed state */}
                          {!isMobile && isCollapsed && !isActive && (
                            <div className="fixed left-20 top-auto px-2 py-1 bg-zinc-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[9999] border border-zinc-700" style={{marginTop: '-8px'}}>
                              {item.text}
                            </div>
                          )}
                          {/* Active indicator */}
                          {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8" style={{backgroundColor: '#4997D0', borderRadius: '9999px', boxShadow: '0 0 8px #4997D0'}}></div>
                          )}
                        </>
                      )}
                    </NavLink>
                    {/* Expand/collapse button */}
                    {(isMobile || !isCollapsed) && item.children && (
                      <button
                        onClick={() => toggleSection(item.text)}
                        className="px-2 py-3 text-zinc-400 hover:text-white transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>
                    )}
                  </div>
                  
                  {/* Children items */}
                  {(isMobile || !isCollapsed) && item.children && (isExpanded || hoveredSections.has(item.text)) && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const isChildExpanded = expandedSections.has(child.text) || hoveredSections.has(child.text);
                        
                        if ('type' in child && child.type === 'expandable') {
                          return (
                            <div
                              key={child.text}
                              onMouseEnter={() => handleSectionHover(child.text, true)}
                              onMouseLeave={() => handleSectionHover(child.text, false)}
                            >
                              {/* Nested expandable item */}
                              <div className="flex">
                                <NavLink
                                  to={child.href}
                                  title={child.text}
                                  onClick={() => isMobile && setIsMobileMenuOpen(false)}
                                  className={({ isActive }) => `flex-1 flex items-center justify-start px-3 py-2 rounded-lg transition-all duration-200 group relative ${
                                    isActive 
                                      ? 'bg-[#4997D0] bg-opacity-10 text-[#4997D0] shadow-lg shadow-[#4997D0]/10' 
                                      : 'text-zinc-500 hover:text-white hover:bg-zinc-800/30'
                                  }`}
                                >
                                  {({ isActive }) => (
                                    <>
                                      <ChildIcon 
                                        size={16} 
                                        className={`${isActive ? 'text-[#4997D0]' : 'text-zinc-500 group-hover:text-white'} transition-colors`}
                                      />
                                      <span className="ml-3 font-medium text-sm transition-opacity duration-200 ease-out">{child.text}</span>
                                      {/* Active indicator for children */}
                                      {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6" style={{backgroundColor: '#4997D0', borderRadius: '9999px', boxShadow: '0 0 8px #4997D0'}}></div>
                                      )}
                                    </>
                                  )}
                                </NavLink>
                                <button
                                  className="flex items-center justify-center p-2 text-zinc-400 hover:text-white transition-colors"
                                  onClick={() => toggleSection(child.text)}
                                >
                                  {isChildExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>
                              </div>
                              
                              {/* Nested children */}
                              {isChildExpanded && 'children' in child && child.children && (
                                <div className="ml-6 mt-1 space-y-1">
                                  {'children' in child && child.children && child.children.map((grandChild: any) => {
                                    const GrandChildIcon = grandChild.icon;
                                    return (
                                      <NavLink
                                        key={grandChild.text}
                                        to={grandChild.href}
                                        title={grandChild.text}
                                        onClick={() => isMobile && setIsMobileMenuOpen(false)}
                                        className={({ isActive }) => `w-full flex items-center justify-start px-3 py-2 rounded-lg transition-all duration-200 group relative ${
                                          isActive 
                                            ? 'bg-[#4997D0] bg-opacity-10 text-[#4997D0] shadow-lg shadow-[#4997D0]/10' 
                                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/20'
                                        }`}
                                      >
                                        {({ isActive }) => (
                                          <>
                                            <GrandChildIcon 
                                              size={14} 
                                              className={`${isActive ? 'text-[#4997D0]' : 'text-zinc-400 group-hover:text-white'} transition-colors`}
                                            />
                                            <span className="ml-3 font-medium text-xs transition-opacity duration-200 ease-out">{grandChild.text}</span>
                                            {/* Active indicator for grandchildren */}
                                            {isActive && (
                                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5" style={{backgroundColor: '#4997D0', borderRadius: '9999px', boxShadow: '0 0 8px #4997D0'}}></div>
                                            )}
                                          </>
                                        )}
                                      </NavLink>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        } else {
                          // Regular child item
                          return (
                            <NavLink
                              key={child.text}
                              to={child.href}
                              title={child.text}
                              onClick={() => isMobile && setIsMobileMenuOpen(false)}
                              className={({ isActive }) => `w-full flex items-center justify-start px-3 py-2 rounded-lg transition-all duration-200 group relative ${
                                isActive 
                                  ? 'bg-[#4997D0] bg-opacity-10 text-[#4997D0] shadow-lg shadow-[#4997D0]/10' 
                                  : 'text-zinc-500 hover:text-white hover:bg-zinc-800/30'
                              }`}
                            >
                              {({ isActive }) => (
                                <>
                                  <ChildIcon 
                                    size={16} 
                                    className={`${isActive ? 'text-[#4997D0]' : 'text-zinc-500 group-hover:text-white'} transition-colors`}
                                  />
                                  <span className="ml-3 font-medium text-sm transition-opacity duration-200 ease-out">{child.text}</span>
                                  {/* Active indicator for children */}
                                  {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6" style={{backgroundColor: '#4997D0', borderRadius: '9999px', boxShadow: '0 0 8px #4997D0'}}></div>
                                  )}
                                </>
                              )}
                            </NavLink>
                          );
                        }
                      })}
                    </div>
                  )}
                </div>
              );
            } else {
              // Regular menu item
              return (
                <NavLink
                  key={item.text}
                  to={item.href}
                  title={item.text}
                  onClick={() => isMobile && setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `w-full flex items-center ${
                    !isMobile && isCollapsed ? 'justify-center' : 'justify-start'
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
                      {(isMobile || !isCollapsed) && (
                        <span className="ml-3 font-medium transition-opacity duration-200 ease-out">{item.text}</span>
                      )}
                      {/* Tooltip for collapsed state, only show if not active and not mobile */}
                      {!isMobile && isCollapsed && !isActive && (
                        <div className="fixed left-20 top-auto px-2 py-1 bg-zinc-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[9999] border border-zinc-700" style={{marginTop: '-8px'}}>
                          {item.text}
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
            }
          })}
          
          {/* Quick Module Access */}
          {(isMobile || !isCollapsed) && (
            <div className="mt-4 pt-4 border-t border-zinc-700/50">
              <QuickModuleAccess />
            </div>
          )}
        </nav>

        {/* Settings at bottom */}
        <div className="p-4 border-t border-zinc-700">
          <NavLink
            to="/settings"
            title="Settings"
            onClick={() => isMobile && setIsMobileMenuOpen(false)}
            className={({ isActive }) => `w-full flex items-center ${
              !isMobile && isCollapsed ? 'justify-center' : 'justify-start'
            } px-3 py-3 rounded-xl transition-all duration-200 group relative ${
              isActive 
                ? 'bg-[#4997D0] bg-opacity-10 text-[#4997D0] shadow-lg shadow-[#4997D0]/10' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            {({ isActive }) => (
              <>
                <Settings 
                  size={20} 
                  className={`${isActive ? 'text-[#4997D0]' : 'text-zinc-400 group-hover:text-white'} transition-colors`}
                />
                {(isMobile || !isCollapsed) && (
                  <span className="ml-3 font-medium transition-opacity duration-200 ease-out">Settings</span>
                )}
                {/* Tooltip for collapsed state */}
                {!isMobile && isCollapsed && !isActive && (
                  <div className="fixed left-20 top-auto px-2 py-1 bg-zinc-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[9999] border border-zinc-700" style={{marginTop: '-8px'}}>
                    Settings
                  </div>
                )}
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8" style={{backgroundColor: '#4997D0', borderRadius: '9999px', boxShadow: '0 0 8px #4997D0'}}></div>
                )}
              </>
            )}
          </NavLink>
        </div>
      {/* Bottom section removed per request */}
      </div>
    </>
  );
};

export default Sidebar;
