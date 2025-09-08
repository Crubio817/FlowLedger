import React, { useState } from 'react';
import { PageTitleEditorial } from '../components/PageTitles.tsx';
import { 
  Settings, 
  Package, 
  Building2, 
  Users, 
  Shield, 
  Bell, 
  Palette,
  Database,
  Activity,
  Lock
} from 'lucide-react';
import TaskPackSettings from './settings/task-packs.tsx';

type SettingsTab = 'task-packs' | 'industries' | 'users' | 'security' | 'notifications' | 'appearance' | 'integrations' | 'audit';

export default function SettingsRoute() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('task-packs');

  const tabs = [
    { id: 'task-packs' as const, label: 'Task Packs', icon: Package, description: 'Manage onboarding task templates' },
    { id: 'industries' as const, label: 'Industries', icon: Building2, description: 'Configure industry categories' },
    { id: 'users' as const, label: 'Users & Roles', icon: Users, description: 'Manage team access' },
    { id: 'security' as const, label: 'Security', icon: Shield, description: 'Security settings' },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell, description: 'Notification preferences' },
    { id: 'appearance' as const, label: 'Appearance', icon: Palette, description: 'Theme and display' },
    { id: 'integrations' as const, label: 'Integrations', icon: Database, description: 'Third-party connections' },
    { id: 'audit' as const, label: 'Audit Log', icon: Activity, description: 'System activity log' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <PageTitleEditorial
        eyebrow="System Configuration"
        title="Settings"
        subtitle="Configure your FlowLedger workspace preferences and system settings"
      />

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-80 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-4">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-start gap-3 p-4 rounded-xl transition-all duration-200 text-left group ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400'
                    : 'hover:bg-zinc-800/50 text-zinc-300 hover:text-white'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'bg-zinc-800/50 text-zinc-400 group-hover:bg-zinc-700/50 group-hover:text-zinc-300'
                }`}>
                  <tab.icon size={16} />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{tab.label}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{tab.description}</div>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'task-packs' && <TaskPackSettings />}
          {activeTab === 'industries' && <ComingSoonPanel title="Industries" description="Manage industry categories and classifications" />}
          {activeTab === 'users' && <ComingSoonPanel title="Users & Roles" description="Manage team members and their access levels" />}
          {activeTab === 'security' && <ComingSoonPanel title="Security" description="Configure security settings and access controls" />}
          {activeTab === 'notifications' && <ComingSoonPanel title="Notifications" description="Set up notification preferences and alerts" />}
          {activeTab === 'appearance' && <ComingSoonPanel title="Appearance" description="Customize theme and display preferences" />}
          {activeTab === 'integrations' && <ComingSoonPanel title="Integrations" description="Connect with third-party services and tools" />}
          {activeTab === 'audit' && <ComingSoonPanel title="Audit Log" description="View system activity and user actions" />}
        </div>
      </div>
    </div>
  );
}

function ComingSoonPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8">
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-zinc-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="text-zinc-500" size={24} />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-zinc-400 mb-6 max-w-md mx-auto">{description}</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800/50 text-zinc-400 rounded-lg text-sm">
          <Activity size={14} />
          Coming Soon
        </div>
      </div>
    </div>
  );
}
