import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getModulesRegistry, type Module } from '../services/api.ts';
import { toast } from '../lib/toast.ts';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '../ui/button.tsx';

// Import your existing module components
import ClientFinderModule from './modules/client-finder.tsx';

export default function ModuleRoute() {
  const { moduleKey } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadModule = async () => {
      if (!moduleKey) return;
      
      try {
        setLoading(true);
        const response = await getModulesRegistry();
        const foundModule = response.data?.find(m => m.key === moduleKey);
        
        if (foundModule) {
          setModule(foundModule);
          
          // Apply the module color theme to the body
          document.documentElement.style.setProperty('--module-accent', foundModule.color);
          document.body.setAttribute('data-module', moduleKey);
        } else {
          toast.error(`Module "${moduleKey}" not found`);
          navigate('/modules');
        }
      } catch (error) {
        toast.error('Failed to load module');
        navigate('/modules');
      } finally {
        setLoading(false);
      }
    };

    loadModule();

    // Cleanup: remove module theme when leaving
    return () => {
      document.documentElement.style.removeProperty('--module-accent');
      document.body.removeAttribute('data-module');
    };
  }, [moduleKey, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#101010] text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full mx-auto"></div>
          <p className="text-[var(--text-2)]">Loading module...</p>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-[#101010] text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl opacity-20 mb-4">⚠️</div>
          <h2 className="text-xl font-semibold">Module not found</h2>
          <p className="text-[var(--text-2)]">The requested module could not be loaded.</p>
          <Button onClick={() => navigate('/modules')} variant="primary">
            Back to Module Selector
          </Button>
        </div>
      </div>
    );
  }

  const renderModuleContent = () => {
    switch (moduleKey) {
      case 'client-finder':
        return <ClientFinderModule module={module} />;
      default:
        return <DefaultModuleContent module={module} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#101010] text-white">
      {/* Module Header */}
      <div className="sticky top-0 z-10 bg-[#101010]/80 backdrop-blur-sm border-b border-[var(--border-subtle)]">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/modules')}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Modules
            </Button>
            
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${module.color}20` }}
              >
                <Sparkles size={20} style={{ color: module.color }} />
              </div>
              <div>
                <h1 className="font-semibold">{module.name}</h1>
                <p className="text-xs text-[var(--text-2)]">{module.scope} • {module.key}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-2 bg-[var(--module-accent)]/20 border border-[var(--module-accent)]/30 rounded-full backdrop-blur-sm">
            <Sparkles size={14} style={{ color: module.color }} />
            <span className="text-xs font-medium" style={{ color: module.color }}>MODULE ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Module Content */}
      <div className="module-content">
        {renderModuleContent()}
      </div>
    </div>
  );
}

// Default content for modules that don't have custom components yet
function DefaultModuleContent({ module }: { module: Module }) {
  return (
    <div className="p-6 space-y-6">
      {/* Module Overview */}
      <div className="relative">
        {/* Glow Effect */}
        <div className="absolute -inset-4 bg-gradient-to-r opacity-20 rounded-2xl blur-xl"
             style={{ background: `linear-gradient(45deg, ${module.color}20, ${module.color}40, ${module.color}20)` }}>
        </div>
        
        {/* Content Container */}
        <div className="relative bg-[#181818] border border-[var(--module-accent)]/20 rounded-xl p-8 backdrop-blur-sm">
          <div className="text-center space-y-6">
            <div 
              className="w-16 h-16 mx-auto rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${module.color}20` }}
            >
              <Sparkles size={32} style={{ color: module.color }} />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-2">{module.name}</h2>
              <p className="text-[var(--text-2)] text-lg">{module.description || 'No description available'}</p>
            </div>
            
            <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: module.color }}>Ready</div>
                <div className="text-xs text-[var(--text-2)]">Status</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: module.color }}>{module.scope}</div>
                <div className="text-xs text-[var(--text-2)]">Scope</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: module.color }}>v1.0</div>
                <div className="text-xs text-[var(--text-2)]">Version</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Message */}
      <div className="bg-[var(--bg-subtle)] rounded-lg border border-[var(--border-subtle)] p-8 text-center">
        <h3 className="font-semibold mb-2">Module Interface Coming Soon</h3>
        <p className="text-[var(--text-2)]">
          The user interface for this module is currently under development. 
          The module system is active and ready for custom implementations.
        </p>
      </div>
    </div>
  );
}
