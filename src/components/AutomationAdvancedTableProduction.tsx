/**
 * Automation Module - Production Implementation
 * Event-driven automation dashboard for FlowLedger
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Zap,
  Play,
  Pause,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  Filter,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Copy,
  TestTube,
  Bot,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  FileText,
  Target,
  Workflow
} from 'lucide-react';

import {
  automationApiClient,
  AutomationRule,
  AutomationLog,
  AutomationTemplate,
  AutomationStatistics,
  RuleFilters,
  LogFilters,
  EVENT_TYPES,
  ACTION_TYPES,
  formatExecutionTime,
  getRuleHealth,
  getEventTypeDisplayName,
  getActionTypeDisplayName,
  AutomationAction
} from '../services/automation.api.ts';

import { Badge } from '../ui/badge.js';
import KpiCard from './KpiCard.tsx';
import { Loading } from './Loading.tsx';
import { EmptyState } from './EmptyState.tsx';
import RealTimeIndicators from './RealTimeIndicators.tsx';

// =====================================================
// TYPES & INTERFACES
// =====================================================

interface AutomationManagerProps {
  orgId: number;
  userRole?: 'admin' | 'manager' | 'user';
  onRuleSelect?: (rule: AutomationRule) => void;
  onRuleExecuted?: (execution: any) => void;
}

interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: any) => React.ReactNode;
}

type TabType = 'rules' | 'logs' | 'templates' | 'analytics';

// =====================================================
// MAIN AUTOMATION MANAGER COMPONENT
// =====================================================

const AutomationAdvancedTableProduction: React.FC<AutomationManagerProps> = ({
  orgId,
  userRole = 'user',
  onRuleSelect,
  onRuleExecuted
}) => {
  // =====================================================
  // STATE MANAGEMENT
  // =====================================================

  const [activeTab, setActiveTab] = useState<TabType>('rules');
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<AutomationStatistics | null>(null);
  
  // Data states
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [templates, setTemplates] = useState<AutomationTemplate[]>([]);

  // Filter states
  const [ruleFilters, setRuleFilters] = useState<RuleFilters>({ org_id: orgId });
  const [logFilters, setLogFilters] = useState<LogFilters>({ org_id: orgId });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Real-time state
  const [isConnected, setIsConnected] = useState(false);

  // =====================================================
  // DATA FETCHING
  // =====================================================

  const loadStatistics = async () => {
    try {
      const response = await automationApiClient.getAutomationStatistics(orgId);
      setStatistics(response.data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const loadRules = async () => {
    setLoading(true);
    try {
      const response = await automationApiClient.getAutomationRules({
        ...ruleFilters,
        page: currentPage,
        limit: pageSize
      });
      setRules(response.data);
      setTotalCount(response.meta?.total || 0);
    } catch (error) {
      console.error('Failed to load rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await automationApiClient.getAutomationLogs({
        ...logFilters,
        page: currentPage,
        limit: pageSize
      });
      setLogs(response.data);
      setTotalCount(response.meta?.total || 0);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await automationApiClient.getAutomationTemplates();
      setTemplates(response.data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // TABLE CONFIGURATIONS
  // =====================================================

  const ruleColumns: TableColumn[] = [
    {
      key: 'name',
      label: 'Rule',
      sortable: true,
      render: (value, rule) => (
        <div>
          <div className="flex items-center gap-2">
            <div className="font-medium text-slate-200">{rule.name}</div>
            {!rule.is_enabled && (
              <Badge variant="muted" className="text-xs">
                Disabled
              </Badge>
            )}
          </div>
          {rule.description && (
            <div className="text-sm text-slate-400 mt-1">{rule.description}</div>
          )}
        </div>
      )
    },
    {
      key: 'trigger',
      label: 'Trigger',
      render: (value, rule) => (
        <div>
          <div className="text-slate-300 text-sm">
            {rule.trigger.event_types.slice(0, 2).map((type: string) => getEventTypeDisplayName(type)).join(', ')}
          </div>
          {rule.trigger.event_types.length > 2 && (
            <div className="text-slate-500 text-xs">
              +{rule.trigger.event_types.length - 2} more
            </div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, rule) => (
        <div>
          <div className="text-slate-300 text-sm">
            {rule.actions.slice(0, 2).map((action: AutomationAction) => getActionTypeDisplayName(action.type)).join(', ')}
          </div>
          {rule.actions.length > 2 && (
            <div className="text-slate-500 text-xs">
              +{rule.actions.length - 2} more
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Health',
      render: (value, rule) => {
        const health = getRuleHealth(rule);
        const healthConfig = {
          healthy: { color: 'bg-green-500', variant: 'success' as const, label: 'Healthy' },
          warning: { color: 'bg-yellow-500', variant: 'muted' as const, label: 'Warning' },
          error: { color: 'bg-red-500', variant: 'muted' as const, label: 'Error' }
        };
        const config = healthConfig[health];
        
        return (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${config.color}`}></div>
            <Badge variant={config.variant} className="text-xs">
              {config.label}
            </Badge>
          </div>
        );
      }
    },
    {
      key: 'execution_count',
      label: 'Executions',
      sortable: true,
      render: (value) => (
        <div className="text-slate-300">
          {value || 0}
        </div>
      )
    },
    {
      key: 'last_executed',
      label: 'Last Run',
      sortable: true,
      render: (value) => (
        <div className="text-slate-400 text-sm">
          {value ? new Date(value).toLocaleDateString() : 'Never'}
        </div>
      )
    },
    {
      key: 'rule_actions',
      label: 'Actions',
      render: (value, rule) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleToggleRule(rule)}
            className={`p-1 transition-colors ${
              rule.is_enabled 
                ? 'text-green-400 hover:text-green-300' 
                : 'text-slate-400 hover:text-slate-300'
            }`}
            title={rule.is_enabled ? 'Disable rule' : 'Enable rule'}
          >
            {rule.is_enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            onClick={() => handleTestRule(rule)}
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
            title="Test rule"
          >
            <TestTube className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleViewRule(rule)}
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleEditRule(rule)}
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
            title="Edit rule"
          >
            <Edit className="h-4 w-4" />
          </button>
          {userRole === 'admin' && (
            <button
              onClick={() => handleDeleteRule(rule)}
              className="p-1 text-slate-400 hover:text-red-400 transition-colors"
              title="Delete rule"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  const logColumns: TableColumn[] = [
    {
      key: 'created_at',
      label: 'Time',
      sortable: true,
      render: (value) => (
        <div className="text-slate-300 text-sm">
          {new Date(value).toLocaleString()}
        </div>
      )
    },
    {
      key: 'rule_name',
      label: 'Rule',
      sortable: true,
      render: (value) => (
        <div className="font-medium text-slate-200">{value}</div>
      )
    },
    {
      key: 'event_type',
      label: 'Event',
      render: (value) => (
        <div className="text-slate-300 text-sm">
          {getEventTypeDisplayName(value)}
        </div>
      )
    },
    {
      key: 'outcome',
      label: 'Outcome',
      render: (value) => {
        const outcomeConfig: Record<string, { variant: 'success' | 'muted'; color: string; icon: React.ReactNode }> = {
          success: { variant: 'success', color: 'text-green-400', icon: <CheckCircle2 className="h-3 w-3" /> },
          failure: { variant: 'muted', color: 'text-red-400', icon: <AlertTriangle className="h-3 w-3" /> },
          skipped: { variant: 'muted', color: 'text-gray-400', icon: <Clock className="h-3 w-3" /> },
          throttled: { variant: 'muted', color: 'text-yellow-400', icon: <Clock className="h-3 w-3" /> }
        };
        const config = outcomeConfig[value] || outcomeConfig.skipped;
        
        return (
          <div className="flex items-center gap-2">
            {config.icon}
            <Badge variant={config.variant} className={`capitalize ${config.color}`}>
              {value}
            </Badge>
          </div>
        );
      }
    },
    {
      key: 'execution_time_ms',
      label: 'Duration',
      sortable: true,
      render: (value) => (
        <div className="text-slate-400 text-sm">
          {formatExecutionTime(value)}
        </div>
      )
    },
    {
      key: 'error_message',
      label: 'Details',
      render: (value, log) => (
        <div className="max-w-xs">
          {value ? (
            <div className="text-red-400 text-sm truncate" title={value}>
              {value}
            </div>
          ) : (
            <div className="text-slate-500 text-sm">
              {log.outcome === 'success' ? 'Executed successfully' : '-'}
            </div>
          )}
        </div>
      )
    }
  ];

  // =====================================================
  // EVENT HANDLERS
  // =====================================================

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSelectedItem(null);
  };

  const handleToggleRule = async (rule: AutomationRule) => {
    try {
      await automationApiClient.toggleAutomationRule(rule.rule_id!, !rule.is_enabled);
      loadRules();
    } catch (error) {
      console.error('Failed to toggle rule:', error);
    }
  };

  const handleTestRule = (rule: AutomationRule) => {
    setSelectedItem(rule);
    setShowTestModal(true);
  };

  const handleViewRule = (rule: AutomationRule) => {
    setSelectedItem(rule);
    onRuleSelect?.(rule);
  };

  const handleEditRule = (rule: AutomationRule) => {
    setSelectedItem(rule);
    setShowEditModal(true);
  };

  const handleDeleteRule = async (rule: AutomationRule) => {
    if (confirm(`Are you sure you want to delete "${rule.name}"?`)) {
      try {
        await automationApiClient.deleteAutomationRule(rule.rule_id!, orgId);
        loadRules();
      } catch (error) {
        console.error('Failed to delete rule:', error);
      }
    }
  };

  const handleCreateRule = () => {
    setSelectedItem(null);
    setShowCreateModal(true);
  };

  const handleCreateFromTemplate = async (template: AutomationTemplate) => {
    try {
      const result = await automationApiClient.createRuleFromTemplate(orgId, template.template_id);
      loadRules();
      setSelectedItem(result.data);
      setShowEditModal(true);
    } catch (error) {
      console.error('Failed to create rule from template:', error);
    }
  };

  // =====================================================
  // EFFECTS
  // =====================================================

  useEffect(() => {
    loadStatistics();
    
    // Set up WebSocket connection for real-time updates
    let ws: WebSocket | null = null;
    try {
      ws = automationApiClient.createWebSocketConnection(orgId, (data) => {
        console.log('Automation update:', data);
        // Reload data when updates come in
        if (data.type === 'automation.rule.executed') {
          loadLogs();
          onRuleExecuted?.(data.payload);
        } else if (data.type === 'automation.rule.updated') {
          loadRules();
        }
        loadStatistics();
      });

      ws.onopen = () => setIsConnected(true);
      ws.onclose = () => setIsConnected(false);
    } catch (error) {
      console.error('WebSocket connection failed:', error);
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [orgId]);

  useEffect(() => {
    switch (activeTab) {
      case 'rules':
        loadRules();
        break;
      case 'logs':
        loadLogs();
        break;
      case 'templates':
        loadTemplates();
        break;
    }
  }, [activeTab, currentPage, pageSize, ruleFilters, logFilters]);

  // =====================================================
  // COMPUTED VALUES
  // =====================================================

  const currentData = useMemo(() => {
    switch (activeTab) {
      case 'rules':
        return rules;
      case 'logs':
        return logs;
      case 'templates':
        return templates;
      default:
        return [];
    }
  }, [activeTab, rules, logs, templates]);

  const currentColumns = useMemo(() => {
    switch (activeTab) {
      case 'rules':
        return ruleColumns;
      case 'logs':
        return logColumns;
      case 'templates':
        return []; // Will implement template columns
      default:
        return [];
    }
  }, [activeTab]);

  // =====================================================
  // LOADING STATE
  // =====================================================

  if (!statistics && loading) {
    return <Loading label="Loading automation dashboard..." />;
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Automation</h1>
          <p className="text-slate-400 mt-1">Event-driven automation rules and monitoring</p>
        </div>

        <div className="flex items-center gap-4">
          <RealTimeIndicators className="ml-4" />
          
          <button
            onClick={handleCreateRule}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Rule
          </button>
        </div>
      </div>

      {/* Statistics KPI Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <KpiCard
            title="Total Rules"
            value={statistics.totalRules}
            icon={<Bot className="h-5 w-5" />}
            deltaPct={0}
          />
          <KpiCard
            title="Active Rules"
            value={statistics.activeRules}
            icon={<Zap className="h-5 w-5" />}
            deltaPct={0}
          />
          <KpiCard
            title="Executions Today"
            value={statistics.executionsToday}
            icon={<Activity className="h-5 w-5" />}
            deltaPct={0}
          />
          <KpiCard
            title="Success Rate"
            value={`${Math.round((statistics.successfulExecutions / statistics.totalExecutions) * 100)}%`}
            icon={<CheckCircle2 className="h-5 w-5" />}
            deltaPct={0}
          />
          <KpiCard
            title="Avg Time"
            value={`${statistics.avgExecutionTime}ms`}
            icon={<Clock className="h-5 w-5" />}
            deltaPct={0}
          />
          <KpiCard
            title="This Week"
            value={statistics.executionsThisWeek}
            icon={<TrendingUp className="h-5 w-5" />}
            deltaPct={0}
          />
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-slate-800">
        <nav className="flex space-x-8">
          {[
            { id: 'rules', label: 'Rules', icon: Settings },
            { id: 'logs', label: 'Execution Logs', icon: FileText },
            { id: 'templates', label: 'Templates', icon: Copy },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as TabType)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Templates Tab Special Content */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div key={template.template_id} className="bg-slate-950 border border-slate-800 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-medium text-slate-200">{template.name}</h3>
                  <Badge variant="muted" className="text-xs mt-1 capitalize">
                    {template.category}
                  </Badge>
                </div>
                <button
                  onClick={() => handleCreateFromTemplate(template)}
                  className="btn btn-secondary btn-sm"
                >
                  Use Template
                </button>
              </div>
              <p className="text-slate-400 text-sm mb-4">{template.description}</p>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">Triggers</div>
                  <div className="text-sm text-slate-300">
                    {template.rule.trigger.event_types.map(type => getEventTypeDisplayName(type)).join(', ')}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">Actions</div>
                  <div className="text-sm text-slate-300">
                    {template.rule.actions.map(action => getActionTypeDisplayName(action.type)).join(', ')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Content for other tabs */}
      {activeTab !== 'templates' && activeTab !== 'analytics' && (
        <>
          {currentData.length === 0 ? (
            <EmptyState
              title={`No ${activeTab} found`}
              message={`Get started by creating your first automation ${activeTab === 'rules' ? 'rule' : 'entry'}`}
              action={
                activeTab === 'rules' ? (
                  <button 
                    onClick={handleCreateRule}
                    className="btn btn-primary"
                  >
                    Create Rule
                  </button>
                ) : null
              }
            />
          ) : (
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-slate-800">
                <h3 className="text-lg font-medium text-slate-200 capitalize">
                  {activeTab}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900">
                    <tr>
                      {currentColumns.map((column) => (
                        <th
                          key={column.key}
                          className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"
                        >
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {currentData.map((item: any) => (
                      <tr key={item[Object.keys(item)[0]]} className="hover:bg-slate-900/50">
                        {currentColumns.map((column) => (
                          <td key={column.key} className="px-6 py-4 text-sm text-slate-300">
                            {column.render ? column.render((item as any)[column.key], item) : (item as any)[column.key]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals would go here */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-slate-100 mb-4">Create New Automation Rule</h2>
            <p className="text-slate-400">Rule creation form would go here</p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button className="btn btn-primary flex-1">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomationAdvancedTableProduction;
