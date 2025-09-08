import React, { useState, useEffect } from 'react';
import { ModulePicker } from './ModulePicker.tsx';

export const useModuleLauncher = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + M to open module launcher
      if ((event.ctrlKey || event.metaKey) && event.key === 'm') {
        event.preventDefault();
        setIsOpen(true);
      }
      // ESC to close
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [isOpen]);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(!isOpen)
  };
};

interface GlobalModuleLauncherProps {
  className?: string;
}

export const GlobalModuleLauncher: React.FC<GlobalModuleLauncherProps> = ({ 
  className = "" 
}) => {
  const { isOpen, open, close } = useModuleLauncher();

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={open}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 
                   rounded-full shadow-lg hover:shadow-xl transition-all duration-300 
                   hover:scale-110 group ${className}`}
        title="Module Launcher (Ctrl+M)"
      >
        {/* Icon */}
        <div className="relative w-full h-full flex items-center justify-center">
          <svg 
            className="w-6 h-6 text-white transition-transform group-hover:rotate-12" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
            />
          </svg>
          
          {/* Pulse Animation */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 
                         animate-ping opacity-20"></div>
        </div>

        {/* Keyboard Shortcut Hint */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-black/80 rounded-full 
                       flex items-center justify-center opacity-0 group-hover:opacity-100 
                       transition-opacity">
          <span className="text-xs text-white font-mono">M</span>
        </div>
      </button>

      {/* Module Picker Modal */}
      <ModulePicker 
        isOpen={isOpen} 
        onClose={close}
        trigger="global"
      />
    </>
  );
};

// Quick Access Component for Navigation
export const QuickModuleAccess: React.FC = () => {
  const { open } = useModuleLauncher();

  return (
    <button
      onClick={open}
      className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white 
                 hover:bg-white/10 rounded-lg transition-all duration-200 group"
      title="Quick Module Access (Ctrl+M)"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      <span>Modules</span>
      <kbd className="ml-auto px-1.5 py-0.5 text-xs bg-white/10 rounded border border-white/20 
                     opacity-0 group-hover:opacity-100 transition-opacity">
        ⌘M
      </kbd>
    </button>
  );
};
