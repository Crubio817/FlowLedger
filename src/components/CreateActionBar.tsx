import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, ChevronDown, Users, Briefcase, FileText, Calendar, Building2, UserPlus, Search, ClipboardList } from 'lucide-react';

interface CreateAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  onClick: () => void;
}

const CreateActionBar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get context-aware primary action based on current route
  const getPrimaryAction = (): CreateAction => {
    const path = location.pathname;
    
    if (path.includes('/engagements')) {
      return {
        id: 'create-engagement',
        label: 'Create Engagement',
        icon: <Briefcase className="w-4 h-4" />,
        description: 'Start a new client engagement',
        onClick: () => {
          console.log('Create Engagement clicked');
          // TODO: Open create engagement modal/page
        }
      };
    }
    
    if (path.includes('/templates')) {
      return {
        id: 'create-template',
        label: 'Create Template',
        icon: <FileText className="w-4 h-4" />,
        description: 'Create a new process template',
        onClick: () => {
          console.log('Create Template clicked');
          // TODO: Open create template modal/page
        }
      };
    }
    
    if (path.includes('/interviews')) {
      return {
        id: 'schedule-interview',
        label: 'Schedule Interview',
        icon: <Calendar className="w-4 h-4" />,
        description: 'Schedule a client interview',
        onClick: () => {
          console.log('Schedule Interview clicked');
          // TODO: Open schedule interview modal/page
        }
      };
    }

    if (path.includes('/audits')) {
      return {
        id: 'create-audit',
        label: 'Create Audit',
        icon: <ClipboardList className="w-4 h-4" />,
        description: 'Start a new audit process',
        onClick: () => {
          console.log('Create Audit clicked');
          // TODO: Open create audit modal/page
        }
      };
    }
    
    // Default action
    return {
      id: 'create-engagement',
      label: 'Create Engagement',
      icon: <Briefcase className="w-4 h-4" />,
      description: 'Start a new client engagement',
      onClick: () => {
        console.log('Create Engagement clicked');
        // TODO: Open create engagement modal/page
      }
    };
  };

  const getAllSecondaryActions = (): CreateAction[] => [
    {
      id: 'create-engagement',
      label: 'Create Engagement',
      icon: <Briefcase className="w-4 h-4" />,
      description: 'Start a new client engagement',
      onClick: () => {
        console.log('Create Engagement clicked');
        // TODO: Open create engagement modal/page
      }
    },
    {
      id: 'add-contact',
      label: 'Add Contact',
      icon: <UserPlus className="w-4 h-4" />,
      description: 'Add a new contact to existing client',
      onClick: () => {
        console.log('Add Contact clicked');
        // TODO: Open add contact modal/page
      }
    },
    {
      id: 'schedule-interview',
      label: 'Schedule Interview',
      icon: <Calendar className="w-4 h-4" />,
      description: 'Schedule a client interview',
      onClick: () => {
        console.log('Schedule Interview clicked');
        // TODO: Open schedule interview modal/page
      }
    },
    {
      id: 'create-template',
      label: 'Create Template',
      icon: <FileText className="w-4 h-4" />,
      description: 'Create a new process template',
      onClick: () => {
        console.log('Create Template clicked');
        // TODO: Open create template modal/page
      }
    },
    {
      id: 'create-audit',
      label: 'Create Audit',
      icon: <ClipboardList className="w-4 h-4" />,
      description: 'Start a new audit process',
      onClick: () => {
        console.log('Create Audit clicked');
        // TODO: Open create audit modal/page
      }
    }
  ];

  const primaryAction = getPrimaryAction();
  const allActions = getAllSecondaryActions();
  // Filter out the primary action from secondary actions
  const secondaryActions = allActions.filter(action => action.id !== primaryAction.id);

  const handlePrimaryAction = () => {
    primaryAction.onClick();
  };

  const handleSecondaryAction = (action: CreateAction) => {
    action.onClick();
    setIsDropdownOpen(false);
  };

  return (
  <div className="fixed top-6 right-6 z-50 lg:right-8 xl:right-12 2xl:right-16">
      <div
        className="relative flex items-center rounded-full shadow-xl shadow-black/30"
        style={{
          background: 'linear-gradient(180deg, rgba(24,24,27,0.85), rgba(9,9,11,0.9))',
          border: '1px solid rgba(63,63,70,0.6)',
          backdropFilter: 'blur(10px)'
        }}
      >
        {/* Split-pill primary + dropdown */}
        <div className="flex items-stretch overflow-hidden rounded-full ring-1 ring-white/5">
          <button
            onClick={handlePrimaryAction}
            className="flex items-center gap-2.5 pl-4 pr-3 sm:pl-5 sm:pr-4 py-2.5 sm:py-3 text-white transition-all duration-300 text-sm"
            style={{
              background: 'radial-gradient(120% 120% at 0% 0%, rgba(56,189,248,0.24) 0%, rgba(56,189,248,0.08) 40%, rgba(56,189,248,0.02) 100%)'
            }}
          >
            <div className="p-1 rounded-md ring-1 ring-cyan-400/30 bg-cyan-400/10">
              {primaryAction.icon}
            </div>
            <span className="hidden xs:inline font-medium">{primaryAction.label}</span>
          </button>

          <div className="relative" ref={dropdownRef}>
            <div className="h-full w-px bg-white/10" />
            <button
              aria-haspopup="menu"
              aria-expanded={isDropdownOpen}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-center w-10 sm:w-12 h-10 sm:h-12 text-white transition-all duration-300 hover:bg-white/5"
            >
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div
                role="menu"
                className="absolute top-full right-0 mt-3 w-72 sm:w-80 rounded-2xl overflow-hidden shadow-2xl shadow-black/50"
                style={{
                  background: 'linear-gradient(180deg, rgba(24,24,27,0.96), rgba(24,24,27,0.9))',
                  border: '1px solid rgba(63,63,70,0.7)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="p-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 px-3 py-2 mb-2 rounded-lg bg-white/5 ring-1 ring-white/10">
                    <Plus className="w-3.5 h-3.5" />
                    Quick Actions
                  </div>
                  <div className="space-y-1">
                    {secondaryActions.map((action) => (
                      <button
                        key={action.id}
                        role="menuitem"
                        onClick={() => handleSecondaryAction(action)}
                        className="w-full flex items-start gap-3 p-3.5 rounded-lg transition-all duration-200 text-left group border border-transparent hover:border-zinc-700/60 hover:bg-white/5"
                      >
                        <div className="p-2.5 rounded-lg ring-1 ring-zinc-700/60 bg-zinc-800/60 group-hover:ring-cyan-400/30 group-hover:bg-cyan-400/10 transition-all">
                          <div className="text-zinc-300 group-hover:text-cyan-300 transition-colors">
                            {action.icon}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-zinc-100 group-hover:text-white">
                            {action.label}
                          </div>
                          <div className="text-xs text-zinc-400 group-hover:text-zinc-300 mt-1 leading-relaxed">
                            {action.description}
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronDown className="w-4 h-4 text-zinc-400 rotate-[-90deg]" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="border-t border-zinc-800/60 bg-zinc-900/60 p-3">
                  <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
                    <div className="w-1.5 h-1.5 bg-cyan-400/60 rounded-full animate-pulse"></div>
                    Context-aware creation options
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateActionBar;
