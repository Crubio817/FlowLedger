import React from 'react';
import { PageTitle, PageTitleGlow, PageTitleEditorial, SectionHeader } from '../components/PageTitles.tsx';

const TitleSamples: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#101010] p-8">
      {/* Background grid pattern matching your app */}
      <div 
        className="fixed inset-0 overflow-hidden pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.012) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />
      
      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Demo Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-black bg-gradient-to-r from-white via-[#4997D0] to-cyan-400 bg-clip-text text-transparent mb-3">
            Page Title Styles
          </h1>
          <p className="text-zinc-400 text-lg">Choose your preferred title style for FlowLedger</p>
        </div>

        <div className="space-y-16">
          
          {/* Style 1: Mono Minimal */}
          <div className="bg-zinc-950/50 backdrop-blur border border-zinc-800/50 rounded-2xl p-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#4997D0] mb-2">1. Mono Minimal</h3>
              <p className="text-zinc-400 text-sm">Sleek, neutral, dark-UI friendly</p>
            </div>
            
            <div className="border border-zinc-800/30 rounded-lg p-6 bg-zinc-900/30">
              <PageTitle 
                title="Team Analytics Dashboard" 
                subtitle="Real-time performance tracking and insights for your organization"
              />
              
              <div className="space-y-6">
                <SectionHeader title="Performance Metrics" />
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-zinc-800/30 rounded-lg p-4">
                    <div className="text-2xl font-bold text-zinc-100">94%</div>
                    <div className="text-sm text-zinc-400">Avg Performance</div>
                  </div>
                  <div className="bg-zinc-800/30 rounded-lg p-4">
                    <div className="text-2xl font-bold text-zinc-100">7</div>
                    <div className="text-sm text-zinc-400">Active Members</div>
                  </div>
                  <div className="bg-zinc-800/30 rounded-lg p-4">
                    <div className="text-2xl font-bold text-zinc-100">$1.2M</div>
                    <div className="text-sm text-zinc-400">Total Revenue</div>
                  </div>
                </div>
                
                <SectionHeader title="Recent Activity" accent />
                <div className="text-zinc-400 text-sm">Clean, minimal approach with subtle accent rules</div>
              </div>
            </div>
          </div>

          {/* Style 2: Glow Line */}
          <div className="bg-zinc-950/50 backdrop-blur border border-zinc-800/50 rounded-2xl p-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#4997D0] mb-2">2. Glow Line</h3>
              <p className="text-zinc-400 text-sm">Subtle energy with accent glow underline</p>
            </div>
            
            <div className="border border-zinc-800/30 rounded-lg p-6 bg-zinc-900/30">
              <PageTitleGlow 
                title="Client Management Hub" 
                subtitle="Comprehensive view of all client relationships and project status"
              />
              
              <div className="space-y-6">
                <SectionHeader title="Client Overview" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-800/30 rounded-lg p-4">
                    <div className="text-2xl font-bold text-zinc-100">42</div>
                    <div className="text-sm text-zinc-400">Active Clients</div>
                  </div>
                  <div className="bg-zinc-800/30 rounded-lg p-4">
                    <div className="text-2xl font-bold text-zinc-100">156</div>
                    <div className="text-sm text-zinc-400">Projects Running</div>
                  </div>
                </div>
                
                <SectionHeader title="Recent Engagements" accent />
                <div className="text-zinc-400 text-sm">Subtle glow effect draws attention while staying professional</div>
              </div>
            </div>
          </div>

          {/* Style 3: Editorial Grid */}
          <div className="bg-zinc-950/50 backdrop-blur border border-zinc-800/50 rounded-2xl p-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#4997D0] mb-2">3. Editorial Grid</h3>
              <p className="text-zinc-400 text-sm">Structured, "dashboard pro" vibe with hierarchy</p>
            </div>
            
            <div className="border border-zinc-800/30 rounded-lg p-6 bg-zinc-900/30">
              <PageTitleEditorial 
                eyebrow="Financial Overview"
                title="Revenue Analytics" 
                subtitle="Detailed breakdown of revenue streams and financial performance metrics"
              />
              
              <div className="space-y-6">
                <SectionHeader title="Revenue Breakdown" />
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-zinc-800/30 rounded-lg p-4">
                    <div className="text-lg font-bold text-zinc-100">$285K</div>
                    <div className="text-xs text-zinc-400">Q3 Revenue</div>
                  </div>
                  <div className="bg-zinc-800/30 rounded-lg p-4">
                    <div className="text-lg font-bold text-zinc-100">+12.5%</div>
                    <div className="text-xs text-zinc-400">Growth Rate</div>
                  </div>
                  <div className="bg-zinc-800/30 rounded-lg p-4">
                    <div className="text-lg font-bold text-zinc-100">15</div>
                    <div className="text-xs text-zinc-400">New Deals</div>
                  </div>
                  <div className="bg-zinc-800/30 rounded-lg p-4">
                    <div className="text-lg font-bold text-zinc-100">98%</div>
                    <div className="text-xs text-zinc-400">Satisfaction</div>
                  </div>
                </div>
                
                <SectionHeader title="Trends & Insights" accent />
                <div className="text-zinc-400 text-sm">Professional structure with clear information hierarchy</div>
              </div>
            </div>
          </div>

          {/* Comparison Summary */}
          <div className="bg-gradient-to-r from-[#4997D0]/10 via-transparent to-[#4997D0]/10 border border-[#4997D0]/20 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-zinc-100 mb-6">Style Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <h4 className="font-semibold text-zinc-200 mb-2">Mono Minimal</h4>
                <p className="text-sm text-zinc-400">Clean • Subtle • Professional</p>
                <p className="text-xs text-zinc-500 mt-2">Best for content-focused pages</p>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-zinc-200 mb-2">Glow Line</h4>
                <p className="text-sm text-zinc-400">Energetic • Branded • Modern</p>
                <p className="text-xs text-zinc-500 mt-2">Best for feature highlights</p>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-zinc-200 mb-2">Editorial Grid</h4>
                <p className="text-sm text-zinc-400">Structured • Hierarchical • Enterprise</p>
                <p className="text-xs text-zinc-500 mt-2">Best for complex dashboards</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TitleSamples;
