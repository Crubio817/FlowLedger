import React, { useState, useEffect } from 'react';
import { PageTitleEditorial } from '../components/PageTitles.tsx';
import StandardHeader from '../components/StandardHeader.tsx';
import CreateActionBar from '../components/CreateActionBar.tsx';
import AdvancedTable from '../components/AdvancedTable.tsx';
import StatCard from '../components/StatCard.tsx';
import KpiCard from '../components/KpiCard.tsx';
import { 
  Plus, 
  Building2, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Users,
  Calendar,
  Target,
  Activity,
  Filter,
  Download,
  MoreHorizontal,
  Search
} from 'lucide-react';

// Types based on the new unified engagement system
interface Engagement {
  engagement_id: number;
  org_id: number;
  client_id: number;
  type: 'audit' | 'project' | 'job';
  name: string;
  owner_id: number;
  status: 'active' | 'paused' | 'complete' | 'cancelled';
  health: 'green' | 'yellow' | 'red';
  start_at: string;
  due_at?: string;
  contract_id?: number;
  created_at: string;
  updated_at: string;
  client_name?: string;
  owner_name?: string;
  progress_pct?: number;
}

interface EngagementStats {
  total: number;
  active: number;
  completed: number;
  overdue: number;
  health_green: number;
  health_yellow: number;
  health_red: number;
}

export default function EngagementsRoute() {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [stats, setStats] = useState<EngagementStats>({
    total: 0,
    active: 0,
    completed: 0,
    overdue: 0,
    health_green: 0,
    health_yellow: 0,
    health_red: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<'all' | 'audit' | 'project' | 'job'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Mock data - replace with actual API calls
  useEffect(() => {
    loadEngagements();
  }, [selectedType, selectedStatus]);

  const loadEngagements = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockEngagements: Engagement[] = [
        {
          engagement_id: 1,
          org_id: 1,
          client_id: 101,
          type: 'audit',
          name: 'Q4 Financial Audit',
          owner_id: 201,
          status: 'active',
          health: 'green',
          start_at: '2025-01-15T00:00:00Z',
          due_at: '2025-03-15T00:00:00Z',
          created_at: '2025-01-10T00:00:00Z',
          updated_at: '2025-01-20T00:00:00Z',
          client_name: 'TechCorp Inc',
          owner_name: 'Sarah Johnson',
          progress_pct: 65
        },
        {
          engagement_id: 2,
          org_id: 1,
          client_id: 102,
          type: 'project',
          name: 'Digital Transformation Initiative',
          owner_id: 202,
          status: 'active',
          health: 'yellow',
          start_at: '2025-02-01T00:00:00Z',
          due_at: '2025-06-30T00:00:00Z',
          created_at: '2025-01-25T00:00:00Z',
          updated_at: '2025-02-10T00:00:00Z',
          client_name: 'Global Systems Ltd',
          owner_name: 'Mike Chen',
          progress_pct: 35
        },
        {
          engagement_id: 3,
          org_id: 1,
          client_id: 103,
          type: 'job',
          name: 'Security Assessment',
          owner_id: 203,
          status: 'complete',
          health: 'green',
          start_at: '2024-12-01T00:00:00Z',
          due_at: '2024-12-31T00:00:00Z',
          created_at: '2024-11-20T00:00:00Z',
          updated_at: '2024-12-28T00:00:00Z',
          client_name: 'SecureBank',
          owner_name: 'Alex Rivera',
          progress_pct: 100
        }
      ];

      // Filter based on selections
      let filtered = mockEngagements;
      if (selectedType !== 'all') {
        filtered = filtered.filter(e => e.type === selectedType);
      }
      if (selectedStatus !== 'all') {
        filtered = filtered.filter(e => e.status === selectedStatus);
      }

      setEngagements(filtered);
      
      // Calculate stats
      setStats({
        total: mockEngagements.length,
        active: mockEngagements.filter(e => e.status === 'active').length,
        completed: mockEngagements.filter(e => e.status === 'complete').length,
        overdue: mockEngagements.filter(e => 
          e.due_at && new Date(e.due_at) < new Date() && e.status !== 'complete'
        ).length,
        health_green: mockEngagements.filter(e => e.health === 'green').length,
        health_yellow: mockEngagements.filter(e => e.health === 'yellow').length,
        health_red: mockEngagements.filter(e => e.health === 'red').length
      });

      setLoading(false);
    }, 500);
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'green': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'yellow': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'red': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'paused': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'complete': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'cancelled': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'audit': return <CheckCircle className="w-4 h-4" />;
      case 'project': return <Target className="w-4 h-4" />;
      case 'job': return <Activity className="w-4 h-4" />;
      default: return <Building2 className="w-4 h-4" />;
    }
  };

  return (
    <div>
      <StandardHeader
        title="Engagements"
        subtitle="Unified system for managing audits, projects, and jobs across all clients"
        color="emerald"
      />

      <div className="p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Total Engagements"
          value={stats.total}
          icon={<Building2 className="w-5 h-5" />}
          tint="#4997D0"
          deltaPct={12}
        />
        <KpiCard
          title="Active"
          value={stats.active}
          icon={<Activity className="w-5 h-5" />}
          tint="#10b981"
          deltaPct={8}
        />
        <KpiCard
          title="Completed"
          value={stats.completed}
          icon={<CheckCircle className="w-5 h-5" />}
          tint="#8b5cf6"
          deltaPct={15}
        />
        <KpiCard
          title="Overdue"
          value={stats.overdue}
          icon={<AlertTriangle className="w-5 h-5" />}
          tint="#ef4444"
          deltaPct={-3}
        />
      </div>

      {/* Health Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Healthy"
          value={stats.health_green}
          color="green"
        />
        <StatCard
          label="At Risk"
          value={stats.health_yellow}
          color="yellow"
        />
        <StatCard
          label="Critical"
          value={stats.health_red}
          color="red"
        />
      </div>

      {/* Create Action Bar */}
      <CreateActionBar />

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <span className="text-sm text-zinc-400">Filters:</span>
        </div>
        
        <select 
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as any)}
          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1 text-sm text-white"
        >
          <option value="all">All Types</option>
          <option value="audit">Audits</option>
          <option value="project">Projects</option>
          <option value="job">Jobs</option>
        </select>

        <select 
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1 text-sm text-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="complete">Complete</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <div className="ml-auto">
          <button className="flex items-center gap-2 px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 hover:bg-zinc-700 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Engagements Table */}
      <div className="content-container">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
          {/* Table Header */}
          <div className="p-4 border-b border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Engagements</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search engagements..."
                    className="pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table Content */}
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-zinc-400">Loading engagements...</p>
            </div>
          ) : engagements.length === 0 ? (
            <div className="p-8 text-center">
              <Building2 className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No engagements found</h3>
              <p className="text-zinc-400">Create your first engagement to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-zinc-400">Engagement</th>
                    <th className="text-left p-4 text-sm font-medium text-zinc-400">Type</th>
                    <th className="text-left p-4 text-sm font-medium text-zinc-400">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-zinc-400">Health</th>
                    <th className="text-left p-4 text-sm font-medium text-zinc-400">Owner</th>
                    <th className="text-left p-4 text-sm font-medium text-zinc-400">Progress</th>
                    <th className="text-left p-4 text-sm font-medium text-zinc-400">Due Date</th>
                    <th className="text-left p-4 text-sm font-medium text-zinc-400"></th>
                  </tr>
                </thead>
                <tbody>
                  {engagements.map((engagement) => (
                    <tr key={engagement.engagement_id} className="border-t border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                      <td className="p-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {getTypeIcon(engagement.type)}
                            <span className="font-medium text-white">{engagement.name}</span>
                          </div>
                          <div className="text-sm text-zinc-400">{engagement.client_name}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 text-xs rounded-full border bg-zinc-800/50 border-zinc-700 text-zinc-300 capitalize">
                          {engagement.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(engagement.status)} capitalize`}>
                          {engagement.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs rounded-full border ${getHealthColor(engagement.health)} capitalize`}>
                          {engagement.health}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                            {engagement.owner_name?.charAt(0) || '?'}
                          </div>
                          <span className="text-sm text-zinc-300">{engagement.owner_name || 'Unassigned'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="w-32">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-zinc-400">Progress</span>
                            <span className="text-white">{engagement.progress_pct || 0}%</span>
                          </div>
                          <div className="w-full bg-zinc-800 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${engagement.progress_pct || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {engagement.due_at ? (
                            <div>
                              <div className="text-white">{new Date(engagement.due_at).toLocaleDateString()}</div>
                              <div className="text-zinc-400">
                                {Math.ceil((new Date(engagement.due_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                              </div>
                            </div>
                          ) : (
                            <span className="text-zinc-500">No due date</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                          <MoreHorizontal className="w-4 h-4 text-zinc-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
