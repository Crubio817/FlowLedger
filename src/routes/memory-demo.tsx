/**
 * Memory Module Demo Page
 * Demonstrates the memory functionality in isolation
 */

import React, { useState } from 'react';
import { MemoryCard } from '../modules/memory/index.ts';

const MemoryDemo: React.FC = () => {
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'pursuit' | 'candidate' | 'engagement' | 'comms_thread';
    id: number;
  }>({
    type: 'candidate',
    id: 1
  });

  const entities: Array<{
    type: 'pursuit' | 'candidate' | 'engagement' | 'comms_thread';
    id: number;
    name: string;
  }> = [
    { type: 'candidate', id: 1, name: 'Candidate #1 - TechCorp Deal' },
    { type: 'candidate', id: 2, name: 'Candidate #2 - FinanceInc Project' },
    { type: 'engagement', id: 101, name: 'Engagement #101 - Audit Project' },
    { type: 'pursuit', id: 201, name: 'Pursuit #201 - Enterprise Deal' },
    { type: 'comms_thread', id: 301, name: 'Thread #301 - Support Request' }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Memory Module Demo</h1>
          <p className="text-zinc-400">
            Demonstrate institutional knowledge capture across different entity types
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Entity Selector */}
          <div className="lg:col-span-1">
            <div className="panel bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Select Entity</h2>
              <div className="space-y-2">
                {entities.map((entity) => (
                  <button
                    key={`${entity.type}-${entity.id}`}
                    onClick={() => setSelectedEntity({ type: entity.type, id: entity.id })}
                    className={`
                      w-full text-left p-3 rounded-lg border transition-all
                      ${selectedEntity.type === entity.type && selectedEntity.id === entity.id
                        ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                        : 'bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:bg-zinc-700/50'
                      }
                    `}
                  >
                    <div className="font-medium">{entity.name}</div>
                    <div className="text-xs text-zinc-500 mt-1">
                      {entity.type} • ID: {entity.id}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Demo Info */}
            <div className="mt-6 panel bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Demo Features</h3>
              <ul className="text-sm text-zinc-400 space-y-2">
                <li>• 📝 Add memory notes</li>
                <li>• 🏷️ Tag and categorize</li>
                <li>• 📊 View atom types</li>
                <li>• 🔍 Memory timeline</li>
                <li>• 🔒 Redaction support</li>
              </ul>
            </div>
          </div>

          {/* Memory Card Demo */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Regular Memory Card */}
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">
                  Standard Memory Card
                </h2>
                <MemoryCard
                  entityType={selectedEntity.type}
                  entityId={selectedEntity.id}
                  expandable={true}
                />
              </div>

              {/* Compact Memory Card */}
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">
                  Compact Memory Card
                </h2>
                <MemoryCard
                  entityType={selectedEntity.type}
                  entityId={selectedEntity.id}
                  compact={true}
                  maxAtoms={3}
                  className="max-w-md"
                />
              </div>

              {/* Timeline Memory Card */}
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">
                  Timeline Memory Card
                </h2>
                <MemoryCard
                  entityType={selectedEntity.type}
                  entityId={selectedEntity.id}
                  showTimeline={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Usage Example */}
        <div className="mt-12 panel bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Integration Code Example</h2>
          <pre className="bg-zinc-800 rounded-lg p-4 text-sm text-zinc-300 overflow-x-auto">
{`// Simple integration in any FlowLedger module
import { MemoryCard } from '../memory/index.ts';

const YourComponent = ({ entityId }) => (
  <div className="layout">
    <main>Your main content</main>
    <aside>
      <MemoryCard 
        entityType="${selectedEntity.type}"
        entityId={${selectedEntity.id}}
        expandable={true}
      />
    </aside>
  </div>
);`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default MemoryDemo;
