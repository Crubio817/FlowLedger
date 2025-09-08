import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Plus,
  ChevronDown,
  UserPlus,
  Users,
  Building,
  Mail,
  Upload,
  FileText,
  Calendar,
  ClipboardList,
  CheckSquare,
  Briefcase,
  Target
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import CreateClientModal from './CreateClientModalNew.tsx';
import { CreateTaskModal } from './CreateTaskModal.tsx';

const SplitButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading] = useState(false);
  const [openClientModal, setOpenClientModal] = useState(false);
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();

  // Get context-aware configuration based on current route
  const getContextConfig = () => {
    const path = location.pathname;
    
    if (path.includes('/onboarding')) {
      return {
        primaryAction: {
          label: 'Add Task',
          icon: ClipboardList,
          action: () => setOpenTaskModal(true)
        },
        dropdownItems: [
          { id: 'individual', icon: UserPlus, label: 'Add Individual', description: 'Add a single client' },
          { id: 'organization', icon: Building, label: 'Add Organization', description: 'Add company account' },
          { id: 'bulk', icon: Users, label: 'Bulk Import', description: 'Import from CSV/Excel' },
          { divider: true },
          { id: 'template-task', icon: CheckSquare, label: 'Task Template', description: 'Create from template' },
          { id: 'bulk-tasks', icon: ClipboardList, label: 'Bulk Tasks', description: 'Import multiple tasks' },
          { divider: true },
          { id: 'invite', icon: Mail, label: 'Send Invite', description: 'Email invitation' },
          { id: 'schedule', icon: Calendar, label: 'Schedule Import', description: 'Set up recurring import' },
        ]
      };
    }
    
    // Default to clients configuration
    return {
      primaryAction: {
        label: 'Add Client',
        icon: Plus,
        action: () => setOpenClientModal(true)
      },
      dropdownItems: [
        { id: 'individual', icon: UserPlus, label: 'Add Individual', description: 'Add a single client' },
        { id: 'bulk', icon: Users, label: 'Bulk Import', description: 'Import from CSV/Excel' },
        { id: 'organization', icon: Building, label: 'Add Organization', description: 'Add company account' },
        { id: 'invite', icon: Mail, label: 'Send Invite', description: 'Email invitation' },
        { divider: true },
        { id: 'upload', icon: Upload, label: 'Upload File', description: 'Upload client list' },
        { id: 'template', icon: FileText, label: 'From Template', description: 'Use existing template' },
        { id: 'schedule', icon: Calendar, label: 'Schedule Import', description: 'Set up recurring import' },
      ]
    };
  };

  const config = getContextConfig();
  const PrimaryIcon = config.primaryAction.icon;

  // Type definition for menu items
  type MenuItem = { id?: string; icon?: LucideIcon; label?: string; description?: string; divider?: boolean };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMainAction = () => {
    config.primaryAction.action();
  };

  const handleMenuItemClick = (item: MenuItem) => {
    console.log('Selected:', item.label);
    setIsOpen(false);
    if (item.id === 'individual' || item.id === 'organization') {
      setOpenClientModal(true);
    } else if (item.id === 'template-task' || item.id === 'bulk-tasks') {
      setOpenTaskModal(true);
    }
  };

  const handleTaskCreated = () => {
    setOpenTaskModal(false);
    // Trigger page refresh or data reload if needed
    window.location.reload();
  };

  return (
    <div className="fixed top-6 right-6 z-50 lg:right-8 xl:right-12 2xl:right-16">
      <div className="relative" ref={dropdownRef}>
        <div className="flex">
          {/* Main Action Button */}
          <button
            onClick={handleMainAction}
            disabled={isLoading}
            className="
              px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500
              text-white font-medium rounded-l-xl shadow-lg shadow-black/30 ring-1 ring-white/10
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-2
            "
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <PrimaryIcon size={18} />
                <span>{config.primaryAction.label}</span>
              </>
            )}
          </button>
          
          {/* Dropdown Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="
              px-3 py-2.5 bg-gradient-to-r from-sky-600 to-cyan-700 hover:from-sky-500 hover:to-cyan-600
              text-white rounded-r-xl border-l border-white/10 shadow-lg shadow-black/30 ring-1 ring-white/10
              transition-all duration-200
            "
          >
            <ChevronDown 
              size={18} 
              className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-72 bg-zinc-950/95 backdrop-blur-md border border-zinc-800 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
            <div className="py-1">
              {config.dropdownItems.map((item: MenuItem, index: number) => {
                if (item.divider) {
                  return <div key={index} className="my-1 border-t border-zinc-800"></div>;
                }
                
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuItemClick(item)}
                    className="
                      w-full px-4 py-2.5
                      flex items-center gap-3
                      hover:bg-zinc-900/70
                      transition-colors duration-150
                      text-left
                    "
                  >
                    {Icon ? <Icon size={18} className="text-cyan-400" /> : null}
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">{item.label}</div>
                      <div className="text-zinc-500 text-xs">{item.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <CreateClientModal
        open={openClientModal}
        onClose={() => setOpenClientModal(false)}
        onCreated={(res: any) => {
          const newId = res?.data?.client?.client_id || res?.data?.client_id;
          if (newId) window.location.href = `/clients/${newId}`;
        }}
      />
      <CreateTaskModal
        open={openTaskModal}
        clientId={1} // Default client ID, could be made configurable
        onClose={() => setOpenTaskModal(false)}
        onSuccess={handleTaskCreated}
      />
    </div>
  );
};

export default SplitButton;