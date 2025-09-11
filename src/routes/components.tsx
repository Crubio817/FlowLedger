import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Palette, Eye, Code, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import TransparentAuroraHeader from '../components/TransparentAuroraHeader.tsx';
import StandardHeader from '../components/StandardHeader.tsx';
import { Button } from '../ui/button.tsx';
import { GlassAuraButton } from '../ui/glass-aura-button.tsx';
import { GlassFxButton } from '../ui/glass-fx-button.tsx';
import '../styles/celebration-effects.css';

const ComponentsModule: React.FC = () => {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>('default');
  
  const componentCategories = [
    {
      id: 'headers',
      name: 'Headers',
      description: 'Page headers with different styles and effects',
      count: 6,
      icon: '📄'
    },
    {
      id: 'celebrations',
      name: 'Celebrations',
      description: 'Subtle full-screen visual effects',
      count: 8,
      icon: '🎉'
    },
    {
      id: 'buttons',
      name: 'Buttons',
      description: 'Interactive button components with various styles',
      count: 35,
      icon: '🔘'
    },
    {
      id: 'badges',
      name: 'Badges',
      description: 'Status indicators and labels',
      count: 25,
      icon: '�️'
    },
    {
      id: 'cards',
      name: 'Cards',
      description: 'Information cards and containers',
      count: 30,
      icon: '🃏'
    },
    {
      id: 'kpis',
      name: 'KPI Cards',
      description: 'Key performance indicator displays',
      count: 15,
      icon: '�'
    },
    {
      id: 'forms',
      name: 'Forms',
      description: 'Input fields and form elements',
      count: 20,
      icon: '📝'
    },
    {
      id: 'overlays',
      name: 'Overlays',
      description: 'Modals, popovers, and floating elements',
      count: 12,
      icon: '🗂️'
    },
    {
      id: 'animations',
      name: 'Animations',
      description: 'Hover effects and loading animations',
      count: 18,
      icon: '✨'
    },
    {
      id: 'advanced',
      name: 'Advanced Cards',
      description: 'Holographic, cyberpunk, and futuristic designs',
      count: 25,
      icon: '🌟'
    },
    {
      id: 'interactive',
      name: 'Interactive Elements',
      description: 'Sliders, ratings, toggles, and media players',
      count: 22,
      icon: '🎛️'
    },
    {
      id: 'data-viz',
      name: 'Data Visualization',
      description: 'Charts, graphs, and data displays',
      count: 15,
      icon: '📈'
    },
    {
      id: 'gaming',
      name: 'Gaming UI',
      description: 'Futuristic gaming interfaces and HUDs',
      count: 20,
      icon: '🎮'
    },
    {
      id: 'mobile',
      name: 'Mobile UI',
      description: 'Modern mobile app interfaces',
      count: 18,
      icon: '📱'
    },
    {
      id: 'web3',
      name: 'Web3 Dashboard',
      description: 'Crypto and blockchain interfaces',
      count: 16,
      icon: '🪙'
    },
    {
      id: 'neumorphism',
      name: 'Neumorphism',
      description: 'Soft UI and 3D effect components',
      count: 12,
      icon: '�'
    }
  ];

  const headerVariants = [
    { id: 'plasma', name: 'Plasma Wave', preview: '#ff6b9d' },
    { id: 'electric', name: 'Electric Storm', preview: '#00d4ff' },
    { id: 'solar', name: 'Solar Flare', preview: '#ffa500' },
    { id: 'cyberpunk', name: 'Cyberpunk', preview: '#00ff41' },
    { id: 'holographic', name: 'Holographic', preview: 'linear-gradient(45deg, #ff006e, #8338ec, #3a86ff)' },
    { id: 'ethereal', name: 'Ethereal', preview: '#a855f7' }
  ];

  return (
    <div className="space-y-8">
      {/* Standardized Header */}
      <StandardHeader
        title="Component Library"
        subtitle="Manage and preview all UI components across FlowLedger"
        color="blue"
        variant="default"
      />

      <div className="p-6">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              to="/dashboard" 
              className="p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800/50"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="text-zinc-300 text-sm">
              Dashboard → Component Library
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Component Categories Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-zinc-300 mb-3">Categories</h3>
            <div className="space-y-1">
              {componentCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedComponent(category.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between ${
                    selectedComponent === category.id
                      ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300'
                      : 'hover:bg-zinc-800/50 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{category.icon}</span>
                    <div>
                      <div className="font-medium text-sm">{category.name}</div>
                      <div className="text-xs opacity-75">{category.count} items</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-4 border-t border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-300 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-2 p-2 text-sm text-zinc-400 hover:text-white transition-colors">
                <Palette className="w-4 h-4" />
                Theme Builder
              </button>
              <button className="w-full flex items-center gap-2 p-2 text-sm text-zinc-400 hover:text-white transition-colors">
                <Code className="w-4 h-4" />
                Export Code
              </button>
              <button className="w-full flex items-center gap-2 p-2 text-sm text-zinc-400 hover:text-white transition-colors">
                <Download className="w-4 h-4" />
                Download Pack
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {selectedComponent === 'headers' ? (
            <HeadersSection />
          ) : selectedComponent === 'buttons' ? (
            <ButtonsSection />
          ) : selectedComponent === 'badges' ? (
            <BadgesSection />
          ) : selectedComponent === 'cards' ? (
            <CardsSection />
          ) : selectedComponent === 'kpis' ? (
            <KPIsSection />
          ) : selectedComponent === 'forms' ? (
            <FormsSection />
          ) : selectedComponent === 'overlays' ? (
            <OverlaysSection />
          ) : selectedComponent === 'animations' ? (
            <AnimationsSection />
          ) : selectedComponent === 'advanced' ? (
            <AdvancedCardsSection />
          ) : selectedComponent === 'interactive' ? (
            <InteractiveElementsSection />
          ) : selectedComponent === 'data-viz' ? (
            <DataVisualizationSection />
          ) : selectedComponent === 'gaming' ? (
            <GamingUISection />
          ) : selectedComponent === 'mobile' ? (
            <MobileUISection />
          ) : selectedComponent === 'web3' ? (
            <Web3DashboardSection />
          ) : selectedComponent === 'neumorphism' ? (
            <NeumorphismSection />
          ) : selectedComponent === 'celebrations' ? (
            <CelebrationEffectsSection />
          ) : selectedComponent ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-xl font-semibold text-white mb-2">Coming Soon</h3>
              <p className="text-zinc-400">
                {componentCategories.find(c => c.id === selectedComponent)?.name} components are being built
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👈</div>
              <h3 className="text-xl font-semibold text-white mb-2">Select a Category</h3>
              <p className="text-zinc-400">Choose a component category from the sidebar to get started</p>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

// Headers Section Component
const HeadersSection: React.FC = () => {
  const [selectedColor, setSelectedColor] = useState('cyan');
  const [selectedStyle, setSelectedStyle] = useState('aurora');
  
  const colorOptions = [
    { name: 'Cyan', value: 'cyan', colors: ['#06b6d4', '#0891b2'], solid: '#0891b2' },
    { name: 'Purple', value: 'purple', colors: ['#a855f7', '#7c3aed'], solid: '#7c3aed' },
    { name: 'Pink', value: 'pink', colors: ['#ec4899', '#be185d'], solid: '#be185d' },
    { name: 'Blue', value: 'blue', colors: ['#3b82f6', '#1d4ed8'], solid: '#1d4ed8' },
    { name: 'Emerald', value: 'emerald', colors: ['#10b981', '#059669'], solid: '#059669' },
    { name: 'Orange', value: 'orange', colors: ['#f97316', '#ea580c'], solid: '#ea580c' },
    { name: 'Red', value: 'red', colors: ['#ef4444', '#dc2626'], solid: '#dc2626' },
    { name: 'Violet', value: 'violet', colors: ['#8b5cf6', '#7c3aed'], solid: '#7c3aed' },
    { name: 'Teal', value: 'teal', colors: ['#14b8a6', '#0d9488'], solid: '#0d9488' },
    { name: 'Indigo', value: 'indigo', colors: ['#6366f1', '#4f46e5'], solid: '#4f46e5' },
    { name: 'Rose', value: 'rose', colors: ['#f43f5e', '#e11d48'], solid: '#e11d48' },
    { name: 'Amber', value: 'amber', colors: ['#f59e0b', '#d97706'], solid: '#d97706' }
  ];

  const styleOptions = [
    { name: 'Aurora Flow', value: 'aurora', description: 'Flowing gradient with transparency' },
    { name: 'Solid Block', value: 'solid', description: 'Solid color background' },
    { name: 'Glass Blur', value: 'glass', description: 'Frosted glass effect' },
    { name: 'Neon Glow', value: 'neon', description: 'Glowing border effect' },
    { name: 'Gradient Wave', value: 'wave', description: 'Animated wave gradient' },
    { name: 'Holographic', value: 'holo', description: 'Shifting holographic colors' }
  ];

  const getHeaderStyle = (colors: string[], solid: string, style: string) => {
    switch (style) {
      case 'solid':
        return {
          background: solid,
          backdropFilter: 'none',
          border: 'none'
        };
      case 'glass':
        return {
          background: `linear-gradient(135deg, ${colors[0]}20, ${colors[1]}20)`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${colors[0]}50`
        };
      case 'neon':
        return {
          background: 'rgba(0, 0, 0, 0.8)',
          border: `2px solid ${colors[0]}`,
          boxShadow: `0 0 20px ${colors[0]}50, inset 0 0 20px ${colors[0]}20`
        };
      case 'wave':
        return {
          background: `linear-gradient(270deg, ${colors[0]}, ${colors[1]}, ${colors[0]})`,
          backgroundSize: '400% 400%',
          animation: 'waveGradient 3s ease infinite'
        };
      case 'holo':
        return {
          background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, #8b5cf6, ${colors[0]})`,
          backgroundSize: '400% 400%',
          animation: 'holoShift 4s ease infinite'
        };
      default: // aurora
        return {
          background: `linear-gradient(135deg, ${colors[0]}80, ${colors[1]}80)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${colors[0]}30`
        };
    }
  };

  const selectedColorData = colorOptions.find(c => c.value === selectedColor) || colorOptions[0];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Header Components</h2>
          <p className="text-zinc-400 text-sm">Different header styles with multiple colors and effects</p>
        </div>
      </div>

      {/* Color Picker */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Colors</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-12 gap-2">
          {colorOptions.map((color) => (
            <button
              key={color.value}
              onClick={() => setSelectedColor(color.value)}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                selectedColor === color.value
                  ? 'border-white/50 scale-105'
                  : 'border-zinc-700 hover:border-zinc-600'
              }`}
              style={{ backgroundColor: color.solid + '20' }}
            >
              <div 
                className="w-full h-4 rounded mb-1"
                style={{ background: `linear-gradient(135deg, ${color.colors[0]}, ${color.colors[1]})` }}
              />
              <div className="text-xs text-white font-medium">{color.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Style Picker */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Flow Styles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {styleOptions.map((style) => (
            <button
              key={style.value}
              onClick={() => setSelectedStyle(style.value)}
              className={`p-4 rounded-lg border transition-all duration-200 text-left ${
                selectedStyle === style.value
                  ? 'border-cyan-500/50 bg-cyan-500/10'
                  : 'border-zinc-700 hover:border-zinc-600 bg-zinc-800/30'
              }`}
            >
              <div className="text-sm font-medium text-white mb-1">{style.name}</div>
              <div className="text-xs text-zinc-400">{style.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Live Preview */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Live Preview</h3>
        
        {/* Original TransparentAuroraHeader */}
        <div className="border border-zinc-800 rounded-xl overflow-hidden mb-6">
          <div className="p-4 bg-zinc-900/50 border-b border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-300">
                Original Ethereal Aurora Header • {selectedColorData.name}
              </span>
              <button className="text-xs px-2 py-1 bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors">
                Copy Code
              </button>
            </div>
          </div>
          <div className="bg-zinc-950">
            <TransparentAuroraHeader
              title="Ethereal Aurora Header"
              subtitle="Original flowing lights and ethereal effects with transparent background"
              density="comfortable"
              fullBleed
              bleedTop={false}
              fadeBottom={true}
              contentClassName="px-6 flex items-center justify-start text-left"
              colors={{
                sweep: selectedColorData.colors[0] + '40',
                aurora1: selectedColorData.colors[0] + '20',
                aurora2: selectedColorData.colors[1] + '15'
              }}
            />
          </div>
        </div>

        {/* Custom Style Preview */}
        <div className="border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-4 bg-zinc-900/50 border-b border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-300">
                Custom Style • {selectedColorData.name} • {styleOptions.find(s => s.value === selectedStyle)?.name}
              </span>
              <button className="text-xs px-2 py-1 bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors">
                Copy Code
              </button>
            </div>
          </div>
          <div className="bg-zinc-950 p-8">
            <div 
              className="rounded-xl p-6 transition-all duration-300"
              style={getHeaderStyle(selectedColorData.colors, selectedColorData.solid, selectedStyle)}
            >
              <h1 className="text-2xl font-bold text-white mb-2">
                {selectedStyle === 'solid' ? 'Solid Header Block' : 'Dynamic Header Component'}
              </h1>
              <p className="text-white/80">
                This header demonstrates the {styleOptions.find(s => s.value === selectedStyle)?.name.toLowerCase()} effect with {selectedColorData.name.toLowerCase()} colors
              </p>
              <div className="flex items-center gap-4 mt-4">
                <button className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors">
                  Action Button
                </button>
                <button className="px-4 py-2 border border-white/30 text-white rounded-lg hover:bg-white/10 transition-colors">
                  Secondary
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Style Reference Grid */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Style Examples</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {styleOptions.map((style) => (
            <div key={style.value} className="border border-zinc-800 rounded-lg overflow-hidden">
              <div className="p-3 bg-zinc-900/50 border-b border-zinc-800">
                <div className="text-sm font-medium text-white">{style.name}</div>
              </div>
              <div className="p-4 bg-zinc-950">
                <div 
                  className="h-16 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                  style={getHeaderStyle(selectedColorData.colors, selectedColorData.solid, style.value)}
                >
                  {style.name} Preview
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-zinc-800/30 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">12</div>
          <div className="text-sm text-zinc-400">Colors</div>
        </div>
        <div className="bg-zinc-800/30 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">6</div>
          <div className="text-sm text-zinc-400">Styles</div>
        </div>
        <div className="bg-zinc-800/30 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">72</div>
          <div className="text-sm text-zinc-400">Combinations</div>
        </div>
        <div className="bg-zinc-800/30 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">∞</div>
          <div className="text-sm text-zinc-400">Possibilities</div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes waveGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes holoShift {
          0% { background-position: 0% 50%; }
          25% { background-position: 100% 50%; }
          50% { background-position: 100% 100%; }
          75% { background-position: 0% 100%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

// Buttons Section Component  
const ButtonsSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Button Components</h2>
          <p className="text-zinc-400 text-sm">Interactive button styles and variations</p>
        </div>
        <button className="text-xs px-2 py-1 bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors">
          Copy All
        </button>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Primary Buttons</h3>
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-3 bg-cyan-500 text-black font-semibold rounded-lg hover:bg-cyan-400 transition-colors">
              Cyan Primary
            </button>
            <button className="px-6 py-3 bg-emerald-500 text-black font-semibold rounded-lg hover:bg-emerald-400 transition-colors">
              Emerald Primary
            </button>
            <button className="px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-400 transition-colors">
              Purple Primary
            </button>
            <button className="px-6 py-3 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 transition-colors">
              Amber Primary
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Outline Buttons</h3>
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-3 border-2 border-cyan-500 text-cyan-400 font-semibold rounded-lg hover:bg-cyan-500/10 transition-colors">
              Cyan Outline
            </button>
            <button className="px-6 py-3 border-2 border-emerald-500 text-emerald-400 font-semibold rounded-lg hover:bg-emerald-500/10 transition-colors">
              Emerald Outline
            </button>
            <button className="px-6 py-3 border-2 border-purple-500 text-purple-400 font-semibold rounded-lg hover:bg-purple-500/10 transition-colors">
              Purple Outline
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Glass Buttons</h3>
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-3 rounded-lg backdrop-blur-sm bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-all hover:scale-105">
              Glass Effect
            </button>
            <button className="px-6 py-3 rounded-lg backdrop-blur-sm bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 font-semibold hover:bg-cyan-500/30 transition-all hover:scale-105">
              Cyan Glass
            </button>
            <button className="px-6 py-3 rounded-lg backdrop-blur-sm bg-purple-500/20 border border-purple-400/30 text-purple-300 font-semibold hover:bg-purple-500/30 transition-all hover:scale-105">
              Purple Glass
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Glass Aura Buttons</h3>
          <div className="flex flex-wrap gap-4">
            <GlassAuraButton tone="blue">Blue Glass</GlassAuraButton>
            <GlassAuraButton tone="green">Green Glass</GlassAuraButton>
            <GlassAuraButton tone="pink">Pink Glass</GlassAuraButton>
            <GlassAuraButton tone="violet">Violet Glass</GlassAuraButton>
            <GlassAuraButton tone="amber">Amber Glass</GlassAuraButton>
            <GlassAuraButton tone="crimson">Crimson Glass</GlassAuraButton>
            <GlassAuraButton tone="sky">Sky Glass</GlassAuraButton>
            <GlassAuraButton tone="mint">Mint Glass</GlassAuraButton>
            <GlassAuraButton tone="coral">Coral Glass</GlassAuraButton>
            <GlassAuraButton tone="lavender">Lavender Glass</GlassAuraButton>
            <GlassAuraButton tone="orange">Orange Glass</GlassAuraButton>
            <GlassAuraButton tone="emerald">Emerald Glass</GlassAuraButton>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Glass FX Buttons</h3>
          <div className="flex flex-wrap gap-4">
            <GlassFxButton variant="neon-blue">Neon Blue</GlassFxButton>
            <GlassFxButton variant="neon-cyan">Neon Cyan</GlassFxButton>
            <GlassFxButton variant="neon-magenta">Neon Magenta</GlassFxButton>
            <GlassFxButton variant="neon-lime">Neon Lime</GlassFxButton>
            <GlassFxButton variant="holo">Holographic</GlassFxButton>
            <GlassFxButton variant="double-border">Double Border</GlassFxButton>
            <GlassFxButton variant="gradient-border">Gradient Border</GlassFxButton>
            <GlassFxButton variant="frosted">Frosted Glass</GlassFxButton>
            <GlassFxButton variant="pulse-aura">Pulsing Aura</GlassFxButton>
            <GlassFxButton variant="electric">Electric</GlassFxButton>
            <GlassFxButton variant="crystal">Crystal</GlassFxButton>
            <GlassFxButton variant="plasma">Plasma</GlassFxButton>
          </div>
        </div>
      </div>
    </div>
  );
};

// Celebration Effects Section
const CelebrationEffectsSection: React.FC = () => {
  // Utilities
  const centerX = () => window.innerWidth / 2;
  const centerY = () => window.innerHeight / 2;

  const triggerShootingStar = React.useCallback(() => {
    const star = document.createElement('div');
    star.className = 'shooting-star';
    star.style.top = `${Math.random() * 30 + 10}%`;
    document.body.appendChild(star);
    requestAnimationFrame(() => star.classList.add('animate'));
    setTimeout(() => star.remove(), 2000);
  }, []);

  const triggerParticleBurst = React.useCallback(() => {
    const cx = centerX();
    const cy = centerY();
    const total = 12;
    for (let i = 0; i < total; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${cx}px`;
      particle.style.top = `${cy}px`;
      const angle = (i / total) * Math.PI * 2;
      const distance = 100 + Math.random() * 100;
      const duration = 1000 + Math.random() * 500;
      document.body.appendChild(particle);
      const anim = (particle as any).animate([
        { opacity: 1, transform: 'translate(0, 0) scale(1)' },
        { opacity: 0, transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)` }
      ], { duration, easing: 'ease-out' });
      anim.onfinish = () => particle.remove();
    }
  }, []);

  const triggerRipple = React.useCallback(() => {
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.left = `${centerX()}px`;
    ripple.style.top = `${centerY()}px`;
    document.body.appendChild(ripple);
    requestAnimationFrame(() => ripple.classList.add('animate'));
    setTimeout(() => ripple.remove(), 1500);
  }, []);

  const triggerAurora = React.useCallback(() => {
    const aurora = document.createElement('div');
    aurora.className = 'aurora';
    document.body.appendChild(aurora);
    requestAnimationFrame(() => aurora.classList.add('animate'));
    setTimeout(() => aurora.remove(), 3000);
  }, []);

  const triggerSparkles = React.useCallback(() => {
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = `${Math.random() * window.innerWidth}px`;
        sparkle.style.top = `${Math.random() * window.innerHeight}px`;
        document.body.appendChild(sparkle);
        requestAnimationFrame(() => sparkle.classList.add('animate'));
        setTimeout(() => sparkle.remove(), 2000);
      }, i * 200);
    }
  }, []);

  const triggerPulse = React.useCallback(() => {
    const pulse = document.createElement('div');
    pulse.className = 'pulse-overlay';
    document.body.appendChild(pulse);
    requestAnimationFrame(() => pulse.classList.add('animate'));
    setTimeout(() => pulse.remove(), 1500);
  }, []);

  const triggerFloating = React.useCallback(() => {
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        const el = document.createElement('div');
        el.className = 'floating-element';
        el.style.left = `${Math.random() * window.innerWidth}px`;
        el.style.top = `${window.innerHeight - 50}px`;
        document.body.appendChild(el);
        requestAnimationFrame(() => el.classList.add('animate'));
        setTimeout(() => el.remove(), 4000);
      }, i * 300);
    }
  }, []);

  const triggerDelete = React.useCallback(() => {
    const star = document.createElement('div');
    star.className = 'shooting-star';
    star.style.top = `${Math.random() * 30 + 10}%`;
    star.style.left = `${window.innerWidth + 100}px`;
    star.style.background = '#ff4757';
    star.style.boxShadow = '0 0 6px #ff4757, 0 0 12px #ff4757, 0 0 18px #ff6b7a';
    document.body.appendChild(star);
    const totalX = window.innerWidth + 200;
    const anim = (star as any).animate([
      { opacity: 1, transform: 'translateX(0) translateY(0) rotate(-135deg)' },
      { opacity: 0, transform: `translateX(-${totalX}px) translateY(60vh) rotate(-135deg)` }
    ], { duration: 2000, easing: 'ease-out' });
    anim.onfinish = () => star.remove();
  }, []);

  // Batch 2 - New Effects
  const triggerLightning = React.useCallback(() => {
    const el = document.createElement('div');
    el.className = 'lightning';
    el.style.left = `${Math.random() * 80 + 10}%`;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('animate'));
    setTimeout(() => el.remove(), 800);
  }, []);

  const triggerComet = React.useCallback(() => {
    const el = document.createElement('div');
    el.className = 'comet';
    el.style.left = '-100px';
    el.style.top = `${Math.random() * 30 + 10}%`;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('animate'));
    setTimeout(() => el.remove(), 3000);
  }, []);

  const triggerFireflies = React.useCallback(() => {
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        const f = document.createElement('div');
        f.className = 'firefly';
        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * window.innerHeight;
        f.style.left = `${startX}px`;
        f.style.top = `${startY}px`;
        document.body.appendChild(f);
        const endX = startX + (Math.random() - 0.5) * 200;
        const endY = startY + (Math.random() - 0.5) * 200;
        (f as any).animate([
          { transform: 'translate(0, 0)' },
          { transform: `translate(${endX - startX}px, ${endY - startY}px)` }
        ], { duration: 4000, easing: 'ease-in-out' });
        requestAnimationFrame(() => f.classList.add('animate'));
        setTimeout(() => f.remove(), 4000);
      }, i * 200);
    }
  }, []);

  const triggerDigitalRain = React.useCallback(() => {
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const r = document.createElement('div');
        r.className = 'digital-rain';
        r.style.left = `${Math.random() * window.innerWidth}px`;
        document.body.appendChild(r);
        requestAnimationFrame(() => r.classList.add('animate'));
        setTimeout(() => r.remove(), 2000);
      }, i * 100);
    }
  }, []);

  const triggerConstellation = React.useCallback(() => {
    const stars: HTMLDivElement[] = [];
    const num = 8;
    for (let i = 0; i < num; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      s.style.left = `${Math.random() * window.innerWidth}px`;
      s.style.top = `${Math.random() * window.innerHeight}px`;
      document.body.appendChild(s);
      stars.push(s);
      setTimeout(() => s.classList.add('animate'), i * 200);
    }
    setTimeout(() => {
      for (let i = 0; i < num - 1; i++) {
        const s1 = stars[i];
        const s2 = stars[i + 1];
        const x1 = parseInt(s1.style.left);
        const y1 = parseInt(s1.style.top);
        const x2 = parseInt(s2.style.left);
        const y2 = parseInt(s2.style.top);
        const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
        const line = document.createElement('div');
        line.className = 'constellation-line';
        line.style.left = `${x1}px`;
        line.style.top = `${y1}px`;
        line.style.width = `${length}px`;
        line.style.transform = `rotate(${angle}deg)`;
        line.style.transformOrigin = '0 0';
        document.body.appendChild(line);
        setTimeout(() => line.classList.add('animate'), i * 150);
        setTimeout(() => line.remove(), 3000);
      }
    }, 1000);
    setTimeout(() => { stars.forEach(s => s.remove()); }, 3000);
  }, []);

  const triggerBubbles = React.useCallback(() => {
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const b = document.createElement('div');
        b.className = 'bubble';
        const size = Math.random() * 30 + 20;
        b.style.width = `${size}px`;
        b.style.height = `${size}px`;
        b.style.left = `${Math.random() * window.innerWidth}px`;
        b.style.bottom = '-50px';
        document.body.appendChild(b);
        requestAnimationFrame(() => b.classList.add('animate'));
        setTimeout(() => b.remove(), 5000);
      }, i * 300);
    }
  }, []);

  const triggerMeteorShower = React.useCallback(() => {
    for (let i = 0; i < 12; i++) {
      setTimeout(() => {
        const m = document.createElement('div');
        m.className = 'meteor';
        m.style.left = `${Math.random() * 30}%`;
        m.style.top = '-50px';
        document.body.appendChild(m);
        requestAnimationFrame(() => m.classList.add('animate'));
        setTimeout(() => m.remove(), 1500);
      }, i * 200);
    }
  }, []);

  const triggerEnergyPulse = React.useCallback(() => {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const ring = document.createElement('div');
        ring.className = 'energy-ring';
        document.body.appendChild(ring);
        requestAnimationFrame(() => ring.classList.add('animate'));
        setTimeout(() => ring.remove(), 2000);
      }, i * 400);
    }
  }, []);

  const triggerLaserSweep = React.useCallback(() => {
    const laser = document.createElement('div');
    laser.className = 'laser-beam';
    laser.style.top = '-2px';
    document.body.appendChild(laser);
    requestAnimationFrame(() => laser.classList.add('animate'));
    setTimeout(() => laser.remove(), 1200);
  }, []);

  // Batch 3 - Premium Effects
  const triggerSolarFlare = React.useCallback(() => {
    const el = document.createElement('div');
    el.className = 'solar-flare';
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('animate'));
    setTimeout(() => el.remove(), 2500);
  }, []);

  const triggerSpiralGalaxy = React.useCallback(() => {
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        const arm = document.createElement('div');
        arm.className = 'spiral-arm';
        arm.style.transform = `rotate(${i * 60}deg)`;
        document.body.appendChild(arm);
        requestAnimationFrame(() => arm.classList.add('animate'));
        setTimeout(() => arm.remove(), 4000);
      }, i * 100);
    }
  }, []);

  const triggerQuantumRipple = React.useCallback(() => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const wave = document.createElement('div');
        wave.className = 'quantum-wave';
        document.body.appendChild(wave);
        requestAnimationFrame(() => wave.classList.add('animate'));
        setTimeout(() => wave.remove(), 3000);
      }, i * 200);
    }
  }, []);

  const triggerPrismRefraction = React.useCallback(() => {
    const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'violet'] as const;
    colors.forEach((c, i) => {
      setTimeout(() => {
        const ray = document.createElement('div');
        ray.className = `prism-ray ${c}`;
        ray.style.left = '20%';
        document.body.appendChild(ray);
        requestAnimationFrame(() => ray.classList.add('animate'));
        setTimeout(() => ray.remove(), 2000);
      }, i * 150);
    });
  }, []);

  const triggerNeuronNetwork = React.useCallback(() => {
    const neurons: HTMLDivElement[] = [];
    const num = 8;
    for (let i = 0; i < num; i++) {
      const n = document.createElement('div');
      n.className = 'neuron';
      n.style.left = `${Math.random() * window.innerWidth}px`;
      n.style.top = `${Math.random() * window.innerHeight}px`;
      document.body.appendChild(n);
      neurons.push(n);
      setTimeout(() => n.classList.add('animate'), i * 200);
    }
    setTimeout(() => {
      for (let i = 0; i < num - 1; i++) {
        const n1 = neurons[i];
        const n2 = neurons[i + 1];
        const x1 = parseInt(n1.style.left);
        const y1 = parseInt(n1.style.top);
        const x2 = parseInt(n2.style.left);
        const y2 = parseInt(n2.style.top);
        const length = Math.hypot(x2 - x1, y2 - y1);
        const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
        const syn = document.createElement('div');
        syn.className = 'synapse';
        syn.style.left = `${x1}px`;
        syn.style.top = `${y1}px`;
        syn.style.width = `${length}px`;
        syn.style.transform = `rotate(${angle}deg)`;
        syn.style.transformOrigin = '0 0';
        document.body.appendChild(syn);
        setTimeout(() => syn.classList.add('animate'), i * 200);
        setTimeout(() => syn.remove(), 4000);
      }
    }, 1000);
    setTimeout(() => { neurons.forEach(n => n.remove()); }, 4000);
  }, []);

  const triggerOrigamiFold = React.useCallback(() => {
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const fold = document.createElement('div');
        fold.className = 'origami-fold';
        const size = Math.random() * 100 + 50;
        fold.style.width = `${size}px`;
        fold.style.height = `${size}px`;
        fold.style.left = `${Math.random() * window.innerWidth}px`;
        fold.style.top = `${Math.random() * window.innerHeight}px`;
        document.body.appendChild(fold);
        requestAnimationFrame(() => fold.classList.add('animate'));
        setTimeout(() => fold.remove(), 2500);
      }, i * 200);
    }
  }, []);

  const triggerPhoenixWing = React.useCallback(() => {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const wing = document.createElement('div');
        wing.className = 'phoenix-wing';
        wing.style.top = `${Math.random() * 60 + 20}%`;
        document.body.appendChild(wing);
        requestAnimationFrame(() => wing.classList.add('animate'));
        setTimeout(() => wing.remove(), 3000);
      }, i * 800);
    }
  }, []);

  const triggerDNAHelix = React.useCallback(() => {
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const strand = document.createElement('div');
        strand.className = 'dna-strand';
        if (i % 2) strand.classList.add('blue');
        const radius = 50;
        const angle = (i / 20) * Math.PI * 4;
        const x = window.innerWidth / 2 + Math.cos(angle) * radius;
        const y = window.innerHeight;
        strand.style.left = `${x}px`;
        strand.style.top = `${y}px`;
        document.body.appendChild(strand);
        (strand as any).animate([
          { transform: `translateY(0) rotateY(${angle}rad)`, opacity: 0 },
          { transform: `translateY(-${window.innerHeight + 100}px) rotateY(${angle + Math.PI * 4}rad)`, opacity: 1 }
        ], { duration: 3000, easing: 'ease-out' }).onfinish = () => strand.remove();
      }, i * 100);
    }
  }, []);

  const triggerEtherealMist = React.useCallback(() => {
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        const mist = document.createElement('div');
        mist.className = 'ethereal-mist';
        mist.style.left = `${Math.random() * window.innerWidth}px`;
        mist.style.bottom = '-200px';
        document.body.appendChild(mist);
        requestAnimationFrame(() => mist.classList.add('animate'));
        setTimeout(() => mist.remove(), 5000);
      }, i * 400);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Celebration Effects</h2>
          <p className="text-zinc-400 text-sm">Click to trigger subtle full-screen animations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
          <h3 className="text-white font-medium mb-2">Shooting Star</h3>
          <p className="text-zinc-400 text-sm mb-4">Great for new client added — a star with a tail streaks across.</p>
          <Button variant="primary" onClick={triggerShootingStar}>Add New Client</Button>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
          <h3 className="text-white font-medium mb-2">Particle Burst</h3>
          <p className="text-zinc-400 text-sm mb-4">Subtle particles emanate from center for completes/saves.</p>
          <Button variant="primary" onClick={triggerParticleBurst}>Save Changes</Button>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
          <h3 className="text-white font-medium mb-2">Ripple Wave</h3>
          <p className="text-zinc-400 text-sm mb-4">A gentle ripple spreads across the screen for confirms.</p>
          <Button variant="primary" onClick={triggerRipple}>Confirm Action</Button>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
          <h3 className="text-white font-medium mb-2">Aurora Wave</h3>
          <p className="text-zinc-400 text-sm mb-4">Colorful aurora sweep for major achievements.</p>
          <Button variant="primary" onClick={triggerAurora}>Complete Project</Button>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
          <h3 className="text-white font-medium mb-2">Sparkle Effect</h3>
          <p className="text-zinc-400 text-sm mb-4">Delicate sparkles appear randomly for celebrations.</p>
          <Button variant="primary" onClick={triggerSparkles}>Achievement Unlocked</Button>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
          <h3 className="text-white font-medium mb-2">Gentle Pulse</h3>
          <p className="text-zinc-400 text-sm mb-4">Soft radial pulse for successful operations.</p>
          <Button variant="primary" onClick={triggerPulse}>Data Synced</Button>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
          <h3 className="text-white font-medium mb-2">Floating Elements</h3>
          <p className="text-zinc-400 text-sm mb-4">Bubbles float up for positive feedback.</p>
          <Button variant="primary" onClick={triggerFloating}>Upload Complete</Button>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
          <h3 className="text-white font-medium mb-2">Delete Effect</h3>
          <p className="text-zinc-400 text-sm mb-4">Reverse shooting star; fades away gracefully.</p>
          <Button variant="destructive" onClick={triggerDelete}>Delete Item</Button>
        </div>
      </div>

      {/* Batch 2: New Effects */}
      <div className="pt-2">
        <h3 className="text-white font-semibold mb-3">New Celebration Effects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Lightning Strike</h3>
            <p className="text-zinc-400 text-sm mb-4">Vertical lightning flash for critical alerts.</p>
            <Button variant="primary" onClick={triggerLightning}>Critical Alert</Button>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Comet Trail</h3>
            <p className="text-zinc-400 text-sm mb-4">Majestic comet with a long tail for milestones.</p>
            <Button variant="primary" onClick={triggerComet}>Milestone Reached</Button>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Firefly Swarm</h3>
            <p className="text-zinc-400 text-sm mb-4">Flickering fireflies for magical moments.</p>
            <Button variant="primary" onClick={triggerFireflies}>Magic Moment</Button>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Digital Rain</h3>
            <p className="text-zinc-400 text-sm mb-4">Matrix-style rain for tech operations.</p>
            <Button variant="primary" onClick={triggerDigitalRain}>Data Processing</Button>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Constellation</h3>
            <p className="text-zinc-400 text-sm mb-4">Stars appear and connect with lines.</p>
            <Button variant="primary" onClick={triggerConstellation}>Network Connected</Button>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Bubble Stream</h3>
            <p className="text-zinc-400 text-sm mb-4">Translucent bubbles float upward.</p>
            <Button variant="primary" onClick={triggerBubbles}>Data Cleaned</Button>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Meteor Shower</h3>
            <p className="text-zinc-400 text-sm mb-4">Meteors rain down for batch operations.</p>
            <Button variant="primary" onClick={triggerMeteorShower}>Batch Update</Button>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Energy Pulse</h3>
            <p className="text-zinc-400 text-sm mb-4">Expanding energy rings from center.</p>
            <Button variant="primary" onClick={triggerEnergyPulse}>System Activated</Button>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4 md:col-span-2">
            <h3 className="text-white font-medium mb-2">Laser Sweep</h3>
            <p className="text-zinc-400 text-sm mb-4">Horizontal laser beam scans downward.</p>
            <Button variant="primary" onClick={triggerLaserSweep}>Scan Complete</Button>
          </div>
        </div>
      </div>

      {/* Batch 3: Premium Effects */}
      <div className="pt-2">
        <h3 className="text-white font-semibold mb-3">Premium Effects Collection</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Solar Flare</h3>
            <p className="text-zinc-400 text-sm mb-4">Radial burst of warm light from center.</p>
            <Button variant="primary" onClick={triggerSolarFlare}>Breakthrough Moment</Button>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Spiral Galaxy</h3>
            <p className="text-zinc-400 text-sm mb-4">Rotating spiral arms for cosmic achievements.</p>
            <Button variant="primary" onClick={triggerSpiralGalaxy}>Cosmic Achievement</Button>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Quantum Ripple</h3>
            <p className="text-zinc-400 text-sm mb-4">Multiple expanding quantum waves.</p>
            <Button variant="primary" onClick={triggerQuantumRipple}>Quantum Leap</Button>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Prismatic Refraction</h3>
            <p className="text-zinc-400 text-sm mb-4">Rainbow rays sweep across the screen.</p>
            <Button variant="primary" onClick={triggerPrismRefraction}>Spectrum Analysis</Button>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Neuron Network</h3>
            <p className="text-zinc-400 text-sm mb-4">Neural connections forming and pulsing.</p>
            <Button variant="primary" onClick={triggerNeuronNetwork}>Neural Connection</Button>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Origami Fold</h3>
            <p className="text-zinc-400 text-sm mb-4">Geometric shapes folding/unfolding.</p>
            <Button variant="primary" onClick={triggerOrigamiFold}>Transform Data</Button>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Phoenix Wing</h3>
            <p className="text-zinc-400 text-sm mb-4">Fiery wing-like shapes soar across.</p>
            <Button variant="primary" onClick={triggerPhoenixWing}>System Reborn</Button>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">DNA Helix</h3>
            <p className="text-zinc-400 text-sm mb-4">DNA strands spiral upward.</p>
            <Button variant="primary" onClick={triggerDNAHelix}>Evolution Complete</Button>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4 md:col-span-2">
            <h3 className="text-white font-medium mb-2">Ethereal Mist</h3>
            <p className="text-zinc-400 text-sm mb-4">Dreamy mist clouds float upward.</p>
            <Button variant="primary" onClick={triggerEtherealMist}>Mystical Event</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Badges Section Component  
const BadgesSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Badge Components</h2>
          <p className="text-zinc-400 text-sm">Status indicators and labels</p>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Status Badges</h3>
          <div className="flex flex-wrap gap-3">
            <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium rounded-full">
              Active
            </span>
            <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-medium rounded-full">
              Pending
            </span>
            <span className="px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium rounded-full">
              Error
            </span>
            <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-medium rounded-full">
              Processing
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Priority Badges</h3>
          <div className="flex flex-wrap gap-3">
            <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
              HIGH
            </span>
            <span className="px-3 py-1 bg-amber-500 text-black text-sm font-bold rounded-full">
              MEDIUM
            </span>
            <span className="px-3 py-1 bg-emerald-500 text-black text-sm font-bold rounded-full">
              LOW
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Gradient Badges</h3>
          <div className="flex flex-wrap gap-3">
            <span className="px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-medium rounded-full">
              Premium
            </span>
            <span className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium rounded-full">
              Pro
            </span>
            <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium rounded-full">
              Success
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Cards Section Component  
const CardsSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Card Components</h2>
          <p className="text-zinc-400 text-sm">Information cards and containers</p>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Basic Cards</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h4 className="text-white font-semibold mb-2">Simple Card</h4>
              <p className="text-zinc-400 text-sm">Basic card with border and background</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
              <h4 className="text-white font-semibold mb-2">Hover Card</h4>
              <p className="text-zinc-400 text-sm">Card with hover effect</p>
            </div>
            <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 border border-zinc-700 rounded-xl p-6">
              <h4 className="text-white font-semibold mb-2">Gradient Card</h4>
              <p className="text-zinc-400 text-sm">Card with gradient background</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Glass Morphism Cards</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all">
              <h4 className="text-white font-semibold mb-2">Glass Card</h4>
              <p className="text-zinc-300 text-sm">Frosted glass effect with backdrop blur</p>
            </div>
            <div className="backdrop-blur-md bg-cyan-500/20 border border-cyan-400/30 rounded-xl p-6 hover:bg-cyan-500/30 transition-all">
              <h4 className="text-cyan-300 font-semibold mb-2">Cyan Glass</h4>
              <p className="text-cyan-100 text-sm">Colored glass morphism</p>
            </div>
            <div className="backdrop-blur-md bg-purple-500/20 border border-purple-400/30 rounded-xl p-6 hover:bg-purple-500/30 transition-all">
              <h4 className="text-purple-300 font-semibold mb-2">Purple Glass</h4>
              <p className="text-purple-100 text-sm">Beautiful purple variant</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// KPIs Section Component
const KPIsSection: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Sample KPI designs with different styles
  const colorfulMetrics = [
    { id: 'revenue', label: 'Revenue', value: '$2.4M', change: '+12.5%', color: '#10b981', icon: '💰', trend: [40, 45, 52, 48, 61, 55, 67] },
    { id: 'users', label: 'Active Users', value: '12.4K', change: '+8.2%', color: '#3b82f6', icon: '👥', trend: [30, 35, 42, 38, 45, 52, 48] },
    { id: 'conversions', label: 'Conversions', value: '89.2%', change: '+2.1%', color: '#8b5cf6', icon: '🎯', trend: [80, 82, 85, 83, 87, 89, 92] },
    { id: 'satisfaction', label: 'Satisfaction', value: '4.8★', change: '+0.3', color: '#f59e0b', icon: '⭐', trend: [4.2, 4.3, 4.5, 4.4, 4.6, 4.7, 4.8] },
    { id: 'performance', label: 'Performance', value: '98.7%', change: '+1.2%', color: '#ef4444', icon: '⚡', trend: [95, 96, 97, 96, 98, 99, 98] },
    { id: 'engagement', label: 'Engagement', value: '76%', change: '+5.8%', color: '#06b6d4', icon: '📊', trend: [65, 68, 72, 70, 74, 76, 78] }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">KPI Card Components</h2>
          <p className="text-zinc-400 text-sm">Key Performance Indicator displays with animations and effects</p>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Colorful Animated KPI Cards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {colorfulMetrics.map((metric) => (
              <div 
                key={metric.id}
                className={`group relative rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${
                  selectedMetric === metric.id ? 'ring-2 ring-white/20' : ''
                }`}
                style={{
                  background: `linear-gradient(135deg, ${metric.color}15, ${metric.color}05)`,
                  border: `1px solid ${metric.color}30`,
                  boxShadow: `0 8px 32px ${metric.color}20`
                }}
                onClick={() => setSelectedMetric(selectedMetric === metric.id ? null : metric.id)}
              >
                {/* Animated glow */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
                  style={{ background: `${metric.color}30` }}
                ></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div 
                      className="p-3 rounded-xl text-2xl"
                      style={{ 
                        background: `${metric.color}20`,
                        border: `1px solid ${metric.color}40`
                      }}
                    >
                      {metric.icon}
                    </div>
                    <div className="text-right">
                      <div 
                        className="text-sm font-medium px-2 py-1 rounded-full"
                        style={{ 
                          color: metric.color,
                          background: `${metric.color}15`
                        }}
                      >
                        {metric.change}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <div className="text-3xl font-bold text-white mb-1">
                      {metric.value}
                    </div>
                    <div className="text-zinc-400 text-sm">
                      {metric.label}
                    </div>
                  </div>
                  
                  {/* Mini trend line */}
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: `${metric.color}20` }}>
                    <div 
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ 
                        background: metric.color,
                        width: '75%'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Minimal KPI Cards</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">💰</span>
                <span className="text-xs text-zinc-500 font-mono">+12.5%</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">$2.4M</div>
              <div className="text-sm text-zinc-400">Revenue</div>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">👥</span>
                <span className="text-xs text-zinc-500 font-mono">+8.2%</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">12.4K</div>
              <div className="text-sm text-zinc-400">Users</div>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">⚡</span>
                <span className="text-xs text-zinc-500 font-mono">+1.2%</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">98.7%</div>
              <div className="text-sm text-zinc-400">Performance</div>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">⭐</span>
                <span className="text-xs text-zinc-500 font-mono">+0.3</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">4.8★</div>
              <div className="text-sm text-zinc-400">Satisfaction</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Glass Morphism KPI Cards</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative rounded-xl p-6 backdrop-blur-md border border-white/10 bg-white/5">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-white/10">
                    <span className="text-xl">💰</span>
                  </div>
                  <span className="text-xs text-emerald-400 font-medium">+12.5%</span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">$2.4M</div>
                <div className="text-sm text-white/70">Revenue</div>
              </div>
            </div>
            <div className="relative rounded-xl p-6 backdrop-blur-md border border-white/10 bg-white/5">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-white/10">
                    <span className="text-xl">👥</span>
                  </div>
                  <span className="text-xs text-blue-400 font-medium">+8.2%</span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">12.4K</div>
                <div className="text-sm text-white/70">Users</div>
              </div>
            </div>
            <div className="relative rounded-xl p-6 backdrop-blur-md border border-white/10 bg-white/5">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-white/10">
                    <span className="text-xl">⚡</span>
                  </div>
                  <span className="text-xs text-purple-400 font-medium">+1.2%</span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">98.7%</div>
                <div className="text-sm text-white/70">Performance</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FormsSection: React.FC = () => (
  <div className="text-center py-12">
    <div className="text-6xl mb-4">📝</div>
    <h3 className="text-xl font-semibold text-white mb-2">Form Components</h3>
    <p className="text-zinc-400">Input fields and form elements - Coming Soon</p>
  </div>
);

const OverlaysSection: React.FC = () => (
  <div className="text-center py-12">
    <div className="text-6xl mb-4">🗂️</div>
    <h3 className="text-xl font-semibold text-white mb-2">Overlay Components</h3>
    <p className="text-zinc-400">Modals, popovers, and floating elements - Coming Soon</p>
  </div>
);

const AnimationsSection: React.FC = () => (
  <div className="text-center py-12">
    <div className="text-6xl mb-4">✨</div>
    <h3 className="text-xl font-semibold text-white mb-2">Animation Components</h3>
    <p className="text-zinc-400">Hover effects and loading animations - Coming Soon</p>
  </div>
);

const AdvancedCardsSection: React.FC = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const holographicCards = [
    { title: 'Neural Networks', value: '96.8%', icon: '🧠', gradient: ['#ff006e', '#8338ec', '#3a86ff'] },
    { title: 'Quantum Processing', value: '1.4PB', icon: '⚡', gradient: ['#06ffa5', '#0066ff', '#8338ec'] },
    { title: 'Cyber Security', value: '99.9%', icon: '🛡️', gradient: ['#ff9f00', '#ff006e', '#0066ff'] },
    { title: 'Data Streams', value: '847K/s', icon: '🌊', gradient: ['#3a86ff', '#06ffa5', '#ff9f00'] }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Advanced Card Components</h2>
          <p className="text-zinc-400 text-sm">Holographic, cyberpunk, and futuristic card designs</p>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Holographic Cards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {holographicCards.map((card, index) => (
              <div 
                key={index}
                className="relative group cursor-pointer"
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Holographic effect background */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                  style={{
                    background: `conic-gradient(from 0deg, ${card.gradient[0]}, ${card.gradient[1]}, ${card.gradient[2]}, ${card.gradient[0]})`
                  }}
                ></div>
                
                {/* Card */}
                <div 
                  className="relative rounded-2xl p-6 border transition-all duration-500 transform group-hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${card.gradient[0]}15, ${card.gradient[1]}10, ${card.gradient[2]}05)`,
                    border: `1px solid ${card.gradient[0]}30`,
                    boxShadow: hoveredCard === index 
                      ? `0 20px 60px ${card.gradient[0]}40, inset 0 1px 0 rgba(255,255,255,0.2)`
                      : `0 8px 32px ${card.gradient[0]}20`
                  }}
                >
                  {/* Animated particles */}
                  {hoveredCard === index && (
                    <div className="absolute inset-0 overflow-hidden rounded-2xl">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 rounded-full opacity-60 animate-pulse"
                          style={{
                            background: card.gradient[i % 3],
                            left: `${20 + i * 15}%`,
                            top: `${10 + i * 10}%`,
                            animationDelay: `${i * 0.2}s`
                          }}
                        ></div>
                      ))}
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div 
                        className="p-3 rounded-xl text-xl"
                        style={{ 
                          background: `${card.gradient[0]}25`,
                          boxShadow: `0 0 20px ${card.gradient[0]}30`
                        }}
                      >
                        {card.icon}
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-white/60 mb-1">LIVE</div>
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: card.gradient[1] }}></div>
                      </div>
                    </div>
                    
                    <div className="text-3xl font-bold text-white mb-2" style={{ textShadow: `0 0 20px ${card.gradient[0]}50` }}>
                      {card.value}
                    </div>
                    <div className="text-sm text-white/80">{card.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Cyberpunk Cards</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative bg-black border border-green-400 rounded-lg p-6 font-mono overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-transparent"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-green-400"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-green-400 text-lg">▣</span>
                  <span className="text-green-400 text-xs">SYSTEM_01</span>
                </div>
                <div className="text-2xl font-bold text-green-400 mb-2 group-hover:text-green-300 transition-colors">
                  127.0.0.1
                </div>
                <div className="text-green-400/70 text-sm">LOCALHOST</div>
              </div>
            </div>
            
            <div className="relative bg-black border border-cyan-400 rounded-lg p-6 font-mono overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-transparent"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-cyan-400 text-lg">◉</span>
                  <span className="text-cyan-400 text-xs">NET_STATUS</span>
                </div>
                <div className="text-2xl font-bold text-cyan-400 mb-2 group-hover:text-cyan-300 transition-colors">
                  1.2GB/s
                </div>
                <div className="text-cyan-400/70 text-sm">BANDWIDTH</div>
              </div>
            </div>
            
            <div className="relative bg-black border border-purple-400 rounded-lg p-6 font-mono overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-transparent"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-purple-400"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-purple-400 text-lg">◈</span>
                  <span className="text-purple-400 text-xs">CRYPTO_HASH</span>
                </div>
                <div className="text-2xl font-bold text-purple-400 mb-2 group-hover:text-purple-300 transition-colors">
                  0x7A9F
                </div>
                <div className="text-purple-400/70 text-sm">SECURE</div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Neumorphism Cards</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['💰 Revenue', '👥 Users', '⚡ Performance'].map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl backdrop-blur-sm border border-slate-700/40"
                style={{
                  background: `linear-gradient(145deg, rgba(51, 65, 85, 0.4), rgba(30, 41, 59, 0.6))`,
                  boxShadow: `
                    12px 12px 24px rgba(15, 23, 42, 0.6),
                    -12px -12px 24px rgba(71, 85, 105, 0.1)
                  `
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg border border-slate-600/40"
                    style={{
                      boxShadow: `inset 4px 4px 8px rgba(15, 23, 42, 0.6), inset -4px -4px 8px rgba(71, 85, 105, 0.2)`
                    }}
                  >
                    {item.split(' ')[0]}
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {idx === 0 ? '$2.4M' : idx === 1 ? '12.4K' : '98.7%'}
                </div>
                <div className="text-slate-400 text-sm">{item.split(' ')[1]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const InteractiveElementsSection: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [rating, setRating] = useState(0);
  const [liked, setLiked] = useState(false);
  const [switchState, setSwitchState] = useState(false);
  const [sliderValue, setSliderValue] = useState(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Interactive Components</h2>
          <p className="text-zinc-400 text-sm">Sliders, ratings, toggles, and media players</p>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Media Player Controls</h3>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-12 h-12 rounded-full bg-cyan-500 text-black flex items-center justify-center hover:bg-cyan-400 transition-colors"
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              <button className="w-10 h-10 rounded-full bg-zinc-700 text-white flex items-center justify-center hover:bg-zinc-600 transition-colors">
                ⏭️
              </button>
              <div className="flex-1 flex items-center gap-4">
                <span className="text-sm text-zinc-400">2:34</span>
                <div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500 transition-all duration-300" 
                    style={{ width: '35%' }}
                  ></div>
                </div>
                <span className="text-sm text-zinc-400">4:12</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">🔊</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-20"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Star Rating</h3>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`w-8 h-8 transition-colors ${
                    star <= rating ? 'text-amber-400' : 'text-zinc-600 hover:text-zinc-400'
                  }`}
                >
                  ⭐
                </button>
              ))}
              <span className="ml-3 text-zinc-400 text-sm">
                {rating > 0 ? `${rating} out of 5 stars` : 'No rating'}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Toggle Switches</h3>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white">Enable notifications</span>
              <button
                onClick={() => setSwitchState(!switchState)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  switchState ? 'bg-cyan-500' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                    switchState ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                ></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Dark mode</span>
              <button className="relative w-12 h-6 rounded-full bg-cyan-500">
                <div className="absolute w-5 h-5 bg-white rounded-full top-0.5 translate-x-6"></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Auto-save</span>
              <button className="relative w-12 h-6 rounded-full bg-zinc-700">
                <div className="absolute w-5 h-5 bg-white rounded-full top-0.5 translate-x-0.5"></div>
              </button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Range Sliders</h3>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-6">
            <div>
              <label className="block text-sm text-zinc-300 mb-2">Volume: {sliderValue}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={(e) => setSliderValue(Number(e.target.value))}
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-300 mb-2">Brightness: 75%</label>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="75"
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-300 mb-2">Opacity: 50%</label>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="50"
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Interactive Buttons</h3>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setLiked(!liked)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                  liked 
                    ? 'bg-red-500/20 border-red-500/30 text-red-400' 
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                }`}
              >
                ❤️ {liked ? 'Liked' : 'Like'}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white transition-colors">
                🔗 Share
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white transition-colors">
                💾 Save
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-colors">
                ✅ Completed
              </button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Progress Indicators</h3>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
            <div>
              <div className="flex justify-between text-sm text-zinc-300 mb-2">
                <span>Project Alpha</span>
                <span>75%</span>
              </div>
              <div className="w-full bg-zinc-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-1000" 
                  style={{ width: '75%' }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-zinc-300 mb-2">
                <span>Loading Data</span>
                <span>45%</span>
              </div>
              <div className="w-full bg-zinc-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-1000" 
                  style={{ width: '45%' }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-zinc-300 mb-2">
                <span>Upload Complete</span>
                <span>100%</span>
              </div>
              <div className="w-full bg-zinc-700 rounded-full h-3">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-3 rounded-full w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
          border: 2px solid #0891b2;
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
          border: 2px solid #0891b2;
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
        }
      `}</style>
    </div>
  );
};

const DataVisualizationSection: React.FC = () => {
  const [animatedData, setAnimatedData] = useState([40, 65, 30, 80, 45, 90, 55]);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedData(prev => prev.map(() => Math.random() * 100));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Data Visualization</h2>
          <p className="text-zinc-400 text-sm">Charts, graphs, and interactive data displays</p>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Animated Bar Chart</h3>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-end gap-3 h-64 mb-4">
              {animatedData.map((value, index) => (
                <div 
                  key={index}
                  className="flex-1 relative group cursor-pointer"
                  onMouseEnter={() => setHoverIndex(index)}
                  onMouseLeave={() => setHoverIndex(null)}
                >
                  <div 
                    className="w-full bg-gradient-to-t from-cyan-500 to-blue-400 rounded-t-lg transition-all duration-1000 hover:from-purple-500 hover:to-pink-400"
                    style={{ height: `${value}%` }}
                  ></div>
                  
                  {/* Tooltip */}
                  {hoverIndex === index && (
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-zinc-800 text-white px-3 py-1 rounded-lg text-sm font-medium z-10">
                      {Math.round(value)}%
                    </div>
                  )}
                  
                  {/* Label */}
                  <div className="text-center mt-2 text-sm text-zinc-400">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center text-zinc-400 text-sm">
              Weekly Performance Overview
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Circular Progress Charts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'CPU Usage', value: 68, color: '#ef4444' },
              { label: 'Memory', value: 45, color: '#10b981' },
              { label: 'Storage', value: 82, color: '#f59e0b' },
              { label: 'Network', value: 34, color: '#3b82f6' }
            ].map((item, index) => (
              <div key={index} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-3 text-center">{item.label}</h4>
                <div className="relative w-24 h-24 mx-auto">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#374151"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke={item.color}
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${item.value * 2.51} 251`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">{item.value}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Area Chart</h3>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="relative h-64">
              <svg className="w-full h-full" viewBox="0 0 400 200">
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map(i => (
                  <line
                    key={i}
                    x1="0"
                    y1={i * 40}
                    x2="400"
                    y2={i * 40}
                    stroke="#374151"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                ))}

                {/* Area fill */}
                <path
                  d="M 0 160 L 50 120 L 100 140 L 150 80 L 200 100 L 250 60 L 300 80 L 350 40 L 400 60 L 400 200 L 0 200 Z"
                  fill="url(#areaGradient)"
                />

                {/* Line */}
                <path
                  d="M 0 160 L 50 120 L 100 140 L 150 80 L 200 100 L 250 60 L 300 80 L 350 40 L 400 60"
                  stroke="#10b981"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data points */}
                {[160, 120, 140, 80, 100, 60, 80, 40, 60].map((y, i) => (
                  <circle
                    key={i}
                    cx={i * 50}
                    cy={y}
                    r="4"
                    fill="#10b981"
                    stroke="#fff"
                    strokeWidth="2"
                    className="hover:r-6 transition-all cursor-pointer"
                  />
                ))}

                {/* Gradient definition */}
                <defs>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="text-center text-zinc-400 text-sm mt-4">
              Revenue Trend Over Time
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Donut Chart</h3>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-8">
              <div className="relative w-48 h-48">
                <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                  {[
                    { label: 'Desktop', value: 45, color: '#3b82f6' },
                    { label: 'Mobile', value: 30, color: '#10b981' },
                    { label: 'Tablet', value: 15, color: '#f59e0b' },
                    { label: 'Other', value: 10, color: '#ef4444' }
                  ].map((item, index, array) => {
                    const total = array.reduce((sum, item) => sum + item.value, 0);
                    const percentage = (item.value / total) * 100;
                    const previousPercentage = array.slice(0, index).reduce((sum, item) => sum + item.value, 0) / total * 100;
                    
                    const circumference = 2 * Math.PI * 35; // radius = 35
                    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                    const strokeDashoffset = -((previousPercentage / 100) * circumference);
                    
                    return (
                      <circle
                        key={index}
                        cx="50"
                        cy="50"
                        r="35"
                        stroke={item.color}
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    );
                  })}
                  
                  {/* Center circle */}
                  <circle cx="50" cy="50" r="20" fill="#18181b" />
                </svg>
                
                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">100%</div>
                    <div className="text-sm text-zinc-400">Total</div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-3">
                {[
                  { label: 'Desktop', value: 45, color: '#3b82f6' },
                  { label: 'Mobile', value: 30, color: '#10b981' },
                  { label: 'Tablet', value: 15, color: '#f59e0b' },
                  { label: 'Other', value: 10, color: '#ef4444' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ background: item.color }}
                    ></div>
                    <span className="text-white font-medium">{item.label}</span>
                    <span className="text-zinc-400">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Activity Heatmap</h3>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="overflow-x-auto mb-4">
              <div className="inline-flex gap-1 min-w-full">
                {Array.from({ length: 52 }, (_, week) => (
                  <div key={week} className="flex flex-col gap-1">
                    {Array.from({ length: 7 }, (_, day) => {
                      const intensity = Math.random();
                      const getColor = (value: number) => {
                        if (value < 0.2) return '#0e4429';
                        if (value < 0.4) return '#006d32';
                        if (value < 0.6) return '#26a641';
                        if (value < 0.8) return '#39d353';
                        return '#57e86a';
                      };
                      
                      return (
                        <div
                          key={day}
                          className="w-3 h-3 rounded-sm cursor-pointer hover:ring-2 hover:ring-white/50 transition-all"
                          style={{ backgroundColor: getColor(intensity) }}
                          title={`${Math.round(intensity * 100)} contributions`}
                        ></div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-zinc-400">
              <span>Less</span>
              <div className="flex gap-1">
                {[0.1, 0.3, 0.5, 0.7, 0.9].map((value, i) => {
                  const getColor = (val: number) => {
                    if (val < 0.2) return '#0e4429';
                    if (val < 0.4) return '#006d32';
                    if (val < 0.6) return '#26a641';
                    if (val < 0.8) return '#39d353';
                    return '#57e86a';
                  };
                  
                  return (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: getColor(value) }}
                    ></div>
                  );
                })}
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GamingUISection: React.FC = () => {
  const [health, setHealth] = useState(85);
  const [mana, setMana] = useState(60);
  const [xp, setXp] = useState(75);
  const [level] = useState(42);
  const [score] = useState(123456);
  const [selectedWeapon, setSelectedWeapon] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHealth(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 10)));
      setMana(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 8)));
      setXp(prev => Math.max(0, Math.min(100, prev + Math.random() * 2)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Gaming UI Components</h2>
          <p className="text-zinc-400 text-sm">HUD elements, progress bars, and game interfaces</p>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Gaming HUD</h3>
          <div className="relative bg-black/90 border-2 border-cyan-500/50 rounded-xl p-6 overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
            
            {/* Scan lines */}
            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  className="w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"
                  style={{ 
                    top: `${i * 10}%`,
                    animationDelay: `${i * 0.1}s`
                  }}
                ></div>
              ))}
            </div>

            <div className="relative z-10">
              <h3 className="text-xl font-bold text-cyan-400 mb-6 font-mono tracking-wider">
                PLAYER STATUS
              </h3>

              {/* Player Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Health Bar */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-red-400 font-mono font-bold">HEALTH</span>
                    <span className="text-white font-mono">{health}/100</span>
                  </div>
                  <div className="h-4 bg-zinc-800 border border-red-500/50 rounded overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500"
                      style={{ width: `${health}%` }}
                    >
                      <div className="h-full bg-gradient-to-t from-red-700/50 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Mana Bar */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-blue-400 font-mono font-bold">MANA</span>
                    <span className="text-white font-mono">{mana}/100</span>
                  </div>
                  <div className="h-4 bg-zinc-800 border border-blue-500/50 rounded overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
                      style={{ width: `${mana}%` }}
                    >
                      <div className="h-full bg-gradient-to-t from-blue-700/50 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* XP and Level */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-yellow-400 font-mono font-bold">EXPERIENCE</span>
                    <span className="text-white font-mono">{xp}%</span>
                  </div>
                  <div className="h-3 bg-zinc-800 border border-yellow-500/50 rounded overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-700"
                      style={{ width: `${xp}%` }}
                    ></div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-emerald-400 font-mono font-bold mb-1">LEVEL</div>
                  <div className="text-4xl font-bold text-white font-mono">{level}</div>
                </div>
              </div>

              {/* Score */}
              <div className="text-center p-4 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/50 rounded-lg">
                <div className="text-purple-400 font-mono font-bold mb-1">SCORE</div>
                <div className="text-3xl font-bold text-white font-mono tracking-wider">
                  {score.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Weapon Selector</h3>
          <div className="bg-zinc-900/90 border-2 border-emerald-500/50 rounded-xl p-6">
            <h4 className="text-lg font-bold text-emerald-400 mb-4 font-mono">WEAPON SELECT</h4>
            
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Plasma Rifle', damage: 95, color: '#06b6d4' },
                { name: 'Flame Thrower', damage: 87, color: '#f59e0b' },
                { name: 'Laser Cannon', damage: 92, color: '#ef4444' },
                { name: 'Ion Blaster', damage: 89, color: '#8b5cf6' }
              ].map((weapon, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedWeapon(index)}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 group ${
                    selectedWeapon === index
                      ? 'border-emerald-400 bg-emerald-500/20 scale-105'
                      : 'border-zinc-700 bg-zinc-800/50 hover:border-emerald-500/50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div 
                      className="w-4 h-4 rounded-full group-hover:animate-pulse"
                      style={{ backgroundColor: weapon.color }}
                    ></div>
                    <span className="text-white font-mono font-bold text-sm">
                      {weapon.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-mono text-xs">DMG</span>
                    <span className="text-white font-mono font-bold ml-2">{weapon.damage}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Achievement Cards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'First Blood', description: 'Defeat your first enemy', rarity: 'common', color: '#10b981' },
              { title: 'Explorer', description: 'Discover 10 locations', rarity: 'rare', color: '#3b82f6' },
              { title: 'Master Chief', description: 'Complete all missions', rarity: 'epic', color: '#8b5cf6' },
              { title: 'Legendary Hero', description: 'Reach level 100', rarity: 'legendary', color: '#f59e0b' }
            ].map((achievement, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 bg-zinc-900/50 transition-all duration-300 hover:scale-105`}
                style={{ borderColor: achievement.color + '50' }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: achievement.color + '20', color: achievement.color }}
                  >
                    🏆
                  </div>
                  <div>
                    <h4 className="text-white font-bold font-mono">{achievement.title}</h4>
                    <span 
                      className="text-xs font-mono uppercase tracking-wider"
                      style={{ color: achievement.color }}
                    >
                      {achievement.rarity}
                    </span>
                  </div>
                </div>
                <p className="text-zinc-400 text-sm">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Mini Map</h3>
          <div className="bg-black/90 border-2 border-green-500/50 rounded-xl p-6">
            <div className="w-full h-64 bg-zinc-900 rounded-lg border border-green-400/30 relative overflow-hidden">
              {/* Grid */}
              <div className="absolute inset-0">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={`h-${i}`} className="absolute w-full h-px bg-green-400/20" style={{ top: `${i * 12.5}%` }}></div>
                ))}
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={`v-${i}`} className="absolute h-full w-px bg-green-400/20" style={{ left: `${i * 12.5}%` }}></div>
                ))}
              </div>

              {/* Player marker */}
              <div className="absolute w-3 h-3 bg-cyan-400 rounded-full animate-pulse" style={{ top: '60%', left: '45%' }}></div>
              
              {/* Enemy markers */}
              <div className="absolute w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ top: '30%', left: '70%' }}></div>
              <div className="absolute w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ top: '80%', left: '20%' }}></div>

              {/* Objective marker */}
              <div className="absolute w-3 h-3 bg-yellow-400 rotate-45 animate-pulse" style={{ top: '20%', left: '80%' }}></div>

              {/* Radar sweep */}
              <div className="absolute inset-0 opacity-30">
                <div className="w-full h-full rounded-full border border-green-400/50 animate-ping"></div>
              </div>
            </div>
            
            <div className="mt-3 text-center">
              <span className="text-green-400 font-mono text-sm">TACTICAL DISPLAY</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MobileUISection: React.FC = () => (
  <div className="text-center py-12">
    <div className="text-6xl mb-4">📱</div>
    <h3 className="text-xl font-semibold text-white mb-2">Mobile UI Components</h3>
    <p className="text-zinc-400">Modern mobile app interfaces - Coming Soon</p>
  </div>
);

const Web3DashboardSection: React.FC = () => (
  <div className="text-center py-12">
    <div className="text-6xl mb-4">🪙</div>
    <h3 className="text-xl font-semibold text-white mb-2">Web3 Dashboard Components</h3>
    <p className="text-zinc-400">Crypto and blockchain interfaces - Coming Soon</p>
  </div>
);

const NeumorphismSection: React.FC = () => (
  <div className="text-center py-12">
    <div className="text-6xl mb-4">🔘</div>
    <h3 className="text-xl font-semibold text-white mb-2">Neumorphism Components</h3>
    <p className="text-zinc-400">Soft UI and 3D effect components - Coming Soon</p>
  </div>
);

export default ComponentsModule;
