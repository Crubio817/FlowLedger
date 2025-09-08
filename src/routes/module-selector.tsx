import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTitleEditorial } from '../components/PageTitles.tsx';
import { getModulesRegistry, type Module } from '../services/api.ts';
import { toast } from '../lib/toast.ts';
import { Search, Zap, ArrowRight, Settings, Grid3X3 } from 'lucide-react';
import { Input } from '../ui/input.tsx';

export default function ModuleSelectorRoute() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadModules = async () => {
      try {
        setLoading(true);
        const response = await getModulesRegistry();
        setModules(response.data || []);
      } catch (error) {
        toast.error('Failed to load modules');
        console.error('Error loading modules:', error);
      } finally {
        setLoading(false);
      }
    };

    loadModules();
  }, []);

  const filteredModules = modules.filter(module => {
    if (!search.trim()) return true;
    const searchLower = search.toLowerCase();
    return (
      module.name.toLowerCase().includes(searchLower) ||
      module.description?.toLowerCase().includes(searchLower) ||
      module.scope.toLowerCase().includes(searchLower) ||
      module.key.toLowerCase().includes(searchLower)
    );
  });

  const handleModuleSelect = (module: Module) => {
    // Navigate to the module route using the module key
    navigate(`/modules/${module.key}`);
  };

  return (
    <div className="min-h-screen bg-[#101010] text-white">
      <div className="p-6 space-y-6">
        <PageTitleEditorial
          eyebrow="Platform"
          title="Module Selector"
          subtitle="Choose a module to access specialized tools and features"
        />
        
        {/* Search Section */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-2)]" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search modules..."
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2 text-sm text-[var(--text-2)]">
            <Grid3X3 size={16} />
            {filteredModules.length} module{filteredModules.length !== 1 ? 's' : ''} available
          </div>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <ModuleCardSkeleton key={i} />
            ))
          ) : filteredModules.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl opacity-20 mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2">No modules found</h3>
              <p className="text-[var(--text-2)]">
                {search.trim() ? 'Try adjusting your search terms' : 'No modules are currently available'}
              </p>
            </div>
          ) : (
            filteredModules.map((module) => (
              <ModuleCard
                key={module.module_id}
                module={module}
                onSelect={() => handleModuleSelect(module)}
              />
            ))
          )}
        </div>

        {/* Module Management Link */}
        <div className="mt-12 content-container p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Module Management</h3>
              <p className="text-sm text-[var(--text-2)]">
                Configure modules, manage versions, and edit settings
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/modules')}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)]/20 hover:bg-[var(--accent)]/30 border border-[var(--accent)]/30 rounded-lg text-[var(--accent)] transition-colors"
            >
              <Settings size={16} />
              Manage Modules
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ModuleCardProps {
  module: Module;
  onSelect: () => void;
}

function ModuleCard({ module, onSelect }: ModuleCardProps) {
  const colorStyle = {
    '--module-color': module.color,
  } as React.CSSProperties;

  return (
    <div 
      className="relative group cursor-pointer"
      onClick={onSelect}
      style={colorStyle}
    >
      {/* Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl blur-lg"
           style={{ background: `linear-gradient(45deg, ${module.color}20, ${module.color}40, ${module.color}20)` }}>
      </div>
      
      {/* Card Content */}
      <div className="relative card-container group-hover:border-[var(--module-color)] transition-all duration-200"
           style={{ borderColor: 'rgba(39, 39, 42, 0.3)' }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div 
            className="p-3 rounded-lg"
            style={{ backgroundColor: `${module.color}20` }}
          >
            <Zap size={24} style={{ color: module.color }} />
          </div>
          
          <div className="flex items-center gap-2">
            <span 
              className="text-xs px-2 py-1 rounded-full border"
              style={{ 
                backgroundColor: `${module.color}15`,
                borderColor: `${module.color}30`,
                color: module.color
              }}
            >
              {module.scope}
            </span>
            <ArrowRight 
              size={16} 
              className="text-[var(--text-2)] group-hover:text-[var(--module-color)] transition-colors" 
            />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg group-hover:text-[var(--module-color)] transition-colors">
              {module.name}
            </h3>
            <p className="text-xs text-[var(--text-2)] font-mono">
              {module.key}
            </p>
          </div>
          
          {module.description && (
            <p className="text-sm text-[var(--text-2)] line-clamp-2">
              {module.description}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-2)]">
            <span>Click to access</span>
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: module.color }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleCardSkeleton() {
  return (
    <div className="bg-[#1a1a1a] border border-[var(--border-subtle)] rounded-lg p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-[var(--bg-subtle)] rounded-lg"></div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-5 bg-[var(--bg-subtle)] rounded-full"></div>
          <div className="w-4 h-4 bg-[var(--bg-subtle)] rounded"></div>
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="w-32 h-6 bg-[var(--bg-subtle)] rounded mb-1"></div>
          <div className="w-24 h-4 bg-[var(--bg-subtle)] rounded"></div>
        </div>
        <div className="w-full h-10 bg-[var(--bg-subtle)] rounded"></div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-[var(--border-subtle)]">
        <div className="flex items-center justify-between">
          <div className="w-20 h-3 bg-[var(--bg-subtle)] rounded"></div>
          <div className="w-2 h-2 bg-[var(--bg-subtle)] rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
