/**
 * Automation Module Route - Production Implementation
 * Event-driven automation dashboard route for FlowLedger
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import AutomationAdvancedTableProduction from '../components/AutomationAdvancedTableProduction.tsx';
import { PageHeader } from '../components/PageHeader.tsx';
import { automationApiClient, AutomationRule } from '../services/automation.api.ts';

import {
  Bot,
  Zap,
  Activity,
  Settings,
  TestTube,
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react';

// =====================================================
// AUTOMATION ROUTE COMPONENT
// =====================================================

const AutomationRoute: React.FC = () => {
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const [orgId] = useState<number>(1); // This would come from auth context
  const [userRole] = useState<'admin' | 'manager' | 'user'>('admin'); // This would come from auth context

  // =====================================================
  // REAL-TIME NOTIFICATIONS
  // =====================================================

  const handleRuleExecuted = (execution: any) => {
    // Handle real-time rule execution notifications
    console.log('Rule executed:', execution);
    
    // Could show toast notifications for important executions
    if (execution.outcome === 'failure') {
      // Show error notification
    } else if (execution.outcome === 'success' && execution.rule_name) {
      // Show success notification for critical rules
    }
  };

  const handleRuleSelected = (rule: AutomationRule) => {
    setSelectedRule(rule);
    // Could open a detailed view or inspector panel
  };

  // =====================================================
  // PAGE ANIMATIONS
  // =====================================================

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="container mx-auto px-6 py-8"
    >
      {/* Page Header */}
      <PageHeader
        title="Automation"
        subtitle="Event-driven automation rules and monitoring dashboard"
        eyebrow="FlowLedger"
      />

      {/* Alert Banner for Early Access */}
      <div className="mb-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-cyan-400 font-medium">Event-Driven Automation</h4>
            <p className="text-slate-300 text-sm mt-1">
              Create sophisticated automation rules that respond to events across your FlowLedger organization. 
              Monitor executions in real-time and leverage templates for common scenarios.
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Real-time processing
              </div>
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Live monitoring
              </div>
              <div className="flex items-center gap-1">
                <Settings className="h-3 w-3" />
                Rule builder
              </div>
              <div className="flex items-center gap-1">
                <TestTube className="h-3 w-3" />
                Testing sandbox
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Automation Dashboard */}
      <AutomationAdvancedTableProduction
        orgId={orgId}
        userRole={userRole}
        onRuleSelect={handleRuleSelected}
        onRuleExecuted={handleRuleExecuted}
      />

      {/* Rule Inspector Panel (if rule selected) */}
      {selectedRule && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="fixed right-0 top-0 h-full w-96 bg-slate-950 border-l border-slate-800 shadow-2xl z-40 overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-100">Rule Inspector</h3>
              <button
                onClick={() => setSelectedRule(null)}
                className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-3">Basic Information</h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Name</div>
                    <div className="text-slate-200">{selectedRule.name}</div>
                  </div>
                  {selectedRule.description && (
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide">Description</div>
                      <div className="text-slate-300 text-sm">{selectedRule.description}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Status</div>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedRule.is_enabled ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                          <span className="text-green-400">Enabled</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-yellow-400" />
                          <span className="text-yellow-400">Disabled</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Trigger Configuration */}
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-3">Trigger</h4>
                <div className="bg-slate-900 rounded-lg p-4">
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Event Types</div>
                  <div className="space-y-1">
                    {selectedRule.trigger.event_types.map((eventType, index) => (
                      <div key={index} className="text-sm text-slate-300">
                        {eventType}
                      </div>
                    ))}
                  </div>
                  
                  {selectedRule.trigger.filter && (
                    <div className="mt-4">
                      <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Filter</div>
                      <pre className="text-xs text-slate-400 bg-slate-800 rounded p-2 overflow-x-auto">
                        {JSON.stringify(selectedRule.trigger.filter, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-3">Actions</h4>
                <div className="space-y-3">
                  {selectedRule.actions.map((action, index) => (
                    <div key={index} className="bg-slate-900 rounded-lg p-4">
                      <div className="font-medium text-slate-200 mb-2">{action.type}</div>
                      {action.params && (
                        <pre className="text-xs text-slate-400 bg-slate-800 rounded p-2 overflow-x-auto">
                          {JSON.stringify(action.params, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Execution Statistics */}
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-3">Statistics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900 rounded-lg p-3">
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Executions</div>
                    <div className="text-lg font-semibold text-slate-200">
                      {selectedRule.execution_count || 0}
                    </div>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-3">
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Last Run</div>
                    <div className="text-sm text-slate-300">
                      {selectedRule.last_executed 
                        ? new Date(selectedRule.last_executed).toLocaleDateString()
                        : 'Never'
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AutomationRoute;
