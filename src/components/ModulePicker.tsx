import React, { useState, useEffect } from 'react';
import { Dialog } from '../ui/dialog.tsx';
import { Button } from '../ui/button.tsx';
import { useNavigate } from 'react-router-dom';
import { getModulesRegistry } from '../services/api.ts';
import type { Module } from '../services/api.ts';

interface ModulePickerProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: 'global' | 'nav' | 'shortcut';
}

export const ModulePicker: React.FC<ModulePickerProps> = ({ 
  isOpen, 
  onClose,
  trigger = 'global'
}) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      loadModules();
    }
  }, [isOpen]);

  const loadModules = async () => {
    setLoading(true);
    try {
      const response = await getModulesRegistry();
      setModules(response.data);
    } catch (error) {
      console.error('Failed to load modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredModules = modules.filter(module =>
    module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (module.description && module.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleModuleSelect = (module: Module, openInNewTab: boolean = false) => {
    const url = `/modules/${module.key}`;
    
    if (openInNewTab) {
      window.open(url, '_blank');
    } else {
      navigate(url);
      onClose();
    }
  };

  const getModuleGlow = (color: string) => ({
    boxShadow: `0 0 20px ${color}20, 0 0 40px ${color}10`,
    borderColor: `${color}40`
  });

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={onClose}
      className="max-w-4xl max-h-[80vh] overflow-hidden"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Module Launcher
            </h2>
            <p className="text-sm text-white/60 mt-1">
              Quick access to all your modules
            </p>
          </div>
          <div className="flex gap-2">
            <kbd className="px-2 py-1 text-xs bg-white/10 rounded border border-white/20">
              Ctrl + M
            </kbd>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search modules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl 
                         text-white placeholder-white/50 focus:outline-none focus:ring-2 
                         focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              autoFocus
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredModules.map((module) => (
                <div
                  key={module.module_id}
                  className="group relative p-4 bg-white/5 border border-white/10 rounded-xl 
                           hover:bg-white/10 transition-all duration-300 cursor-pointer"
                  style={getModuleGlow(module.color)}
                >
                  {/* Module Icon/Color Indicator */}
                  <div className="flex items-start gap-3 mb-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: `${module.color}30`, color: module.color }}
                    >
                      {module.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{module.name}</h3>
                      <p className="text-xs text-white/60 mt-1 line-clamp-2">
                        {module.description || 'No description available'}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      onClick={() => handleModuleSelect(module, false)}
                      className="flex-1 h-8 text-xs bg-white/10 hover:bg-white/20 border-white/20"
                    >
                      Open
                    </Button>
                    <Button
                      onClick={() => handleModuleSelect(module, true)}
                      className="h-8 px-3 text-xs bg-white/5 hover:bg-white/15 border-white/20"
                      title="Open in new tab"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Button>
                  </div>

                  {/* Hover Glow Effect */}
                  <div 
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none"
                    style={{ 
                      background: `linear-gradient(45deg, ${module.color}20, transparent, ${module.color}20)` 
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredModules.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className="text-white/60">
                {searchTerm ? 'No modules found matching your search' : 'No modules available'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-white/50">
            <div className="flex gap-4">
              <span>• Click to open in current tab</span>
              <span>• Click arrow to open in new tab</span>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              ESC to close
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
