import React, { useState } from 'react';
import { FileText, Plus, Search, Filter, Edit3, Trash2, Copy } from 'lucide-react';
import { PageHeader } from '../components/PageHeader.js';
import TemplateSelector from '../components/TemplateSelector.js';
import { Button } from '../ui/button.js';
import { Input } from '../ui/input.js';
import { Badge } from '../ui/badge.js';

interface TemplatesManagementPageProps {
  orgId?: number;
  principalId?: number;
}

export default function CommsTemplatesPage({ 
  orgId = 1, 
  principalId = 1 
}: TemplatesManagementPageProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Templates"
        subtitle="Create and manage email templates for consistent communication"
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline'}
              onClick={() => setViewMode('grid')}
              size="sm"
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              onClick={() => setViewMode('list')}
              size="sm"
            >
              List
            </Button>
          </div>
        }
      />

      {/* Template Management */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <TemplateSelector
            allowManagement={true}
            orgId={orgId}
            principalId={principalId}
            onSelectTemplate={setSelectedTemplate}
            selectedTemplateId={selectedTemplate?.template_id}
          />
        </div>
      </div>

      {/* Template Categories */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Template Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h4 className="font-medium">General</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Standard business communications
            </p>
            <Badge variant="muted">8 templates</Badge>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h4 className="font-medium">Response</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Quick replies and acknowledgments
            </p>
            <Badge variant="muted">5 templates</Badge>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h4 className="font-medium">Follow-up</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Client follow-up and check-ins
            </p>
            <Badge variant="muted">12 templates</Badge>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <h4 className="font-medium">Proposal</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Project proposals and quotes
            </p>
            <Badge variant="muted">3 templates</Badge>
          </div>
        </div>
      </div>

      {/* Template Usage Statistics */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Usage Statistics</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <h4 className="font-medium">Welcome Email</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Client onboarding template</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">45 uses</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">This month</p>
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost">
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <h4 className="font-medium">Project Update</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Weekly project status updates</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">38 uses</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">This month</p>
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost">
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <div>
                <h4 className="font-medium">Follow-up Reminder</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Gentle client reminders</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">32 uses</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">This month</p>
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost">
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Template Variables Reference */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Available Variables</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Use these variables in your templates to automatically insert dynamic content:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
            <h4 className="font-medium text-sm mb-2">Client Information</h4>
            <div className="space-y-1 text-xs">
              <p><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{'{{client_name}}'}</code> - Client name</p>
              <p><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{'{{client_email}}'}</code> - Client email</p>
              <p><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{'{{client_company}}'}</code> - Company name</p>
            </div>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
            <h4 className="font-medium text-sm mb-2">Project Details</h4>
            <div className="space-y-1 text-xs">
              <p><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{'{{project_name}}'}</code> - Project title</p>
              <p><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{'{{project_status}}'}</code> - Current status</p>
              <p><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{'{{due_date}}'}</code> - Project deadline</p>
            </div>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
            <h4 className="font-medium text-sm mb-2">Team & Dates</h4>
            <div className="space-y-1 text-xs">
              <p><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{'{{sender_name}}'}</code> - Your name</p>
              <p><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{'{{today_date}}'}</code> - Current date</p>
              <p><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{'{{signature}}'}</code> - Email signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
