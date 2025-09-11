import React, { useState, useEffect } from 'react';
import { X, Wand2, Eye, Edit, Play, Code, FileText, Settings, Calendar, User, Clock, Download } from 'lucide-react';
import Modal from './Modal.tsx';
import { 
  getTemplate, 
  updateTemplate,
  renderTemplate,
  type Template, 
  type TemplateVariable 
} from '../services/docs.api.ts';

interface TemplateDetailModalProps {
  template: Template;
  onClose: () => void;
  onUpdate: () => void;
}

export const TemplateDetailModal: React.FC<TemplateDetailModalProps> = ({
  template: initialTemplate,
  onClose,
  onUpdate
}) => {
  const [template, setTemplate] = useState(initialTemplate);
  const [activeTab, setActiveTab] = useState<'overview' | 'variables' | 'content' | 'preview'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: template.name,
    description: template.description || '',
    content_template: template.content_template,
    is_active: template.is_active
  });
  const [testVariables, setTestVariables] = useState<Record<string, any>>({});
  const [previewContent, setPreviewContent] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Initialize test variables with default values
    const initialTestVars: Record<string, any> = {};
    template.variables.forEach(variable => {
      switch (variable.type) {
        case 'text':
        case 'textarea':
          initialTestVars[variable.name] = variable.default_value || `Sample ${variable.name}`;
          break;
        case 'number':
          initialTestVars[variable.name] = Number(variable.default_value) || 123;
          break;
        case 'date':
          initialTestVars[variable.name] = variable.default_value || new Date().toISOString().split('T')[0];
          break;
        case 'boolean':
          initialTestVars[variable.name] = variable.default_value === 'true';
          break;
        default:
          initialTestVars[variable.name] = variable.default_value || 'Sample Value';
      }
    });
    setTestVariables(initialTestVars);
  }, [template.variables]);

  useEffect(() => {
    if (activeTab === 'preview') {
      generatePreview();
    }
  }, [activeTab, testVariables]);

  const generatePreview = async () => {
    if (template.variables.length === 0) {
      setPreviewContent(template.content_template);
      return;
    }

    setIsPreviewLoading(true);
    try {
      let preview = template.content_template;
      
      // Simple client-side variable replacement for preview
      template.variables.forEach(variable => {
        const value = testVariables[variable.name] || variable.default_value || '';
        const regex = new RegExp(`\\{\\{${variable.name}\\}\\}`, 'g');
        preview = preview.replace(regex, String(value));
      });
      
      setPreviewContent(preview);
    } catch (error) {
      console.error('Failed to generate preview:', error);
      setPreviewContent('Error generating preview');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateTemplate(template.id, {
        org_id: 1, // TODO: Get from auth context
        name: editForm.name,
        description: editForm.description,
        content_template: editForm.content_template,
        is_active: editForm.is_active
      });
      
      // Update local state
      setTemplate(prev => ({
        ...prev,
        ...editForm,
        updated_at: new Date().toISOString()
      }));
      
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to update template:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestRender = async () => {
    try {
      await renderTemplate(template.id, {
        org_id: 1,
        variables: testVariables,
        output_format: 'html'
      });
      alert('Template rendered successfully! Check your documents list.');
    } catch (error) {
      console.error('Failed to render template:', error);
      alert('Failed to render template. Please check the variable values.');
    }
  };

  const getVariableIcon = (type: TemplateVariable['type']) => {
    switch (type) {
      case 'text':
      case 'textarea':
        return FileText;
      case 'number':
        return Code;
      case 'date':
        return Calendar;
      case 'boolean':
        return Settings;
      default:
        return FileText;
    }
  };

  const renderVariableInput = (variable: TemplateVariable) => {
    const value = testVariables[variable.name] || '';
    
    switch (variable.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => setTestVariables(prev => ({ ...prev, [variable.name]: e.target.value }))}
            className="w-full px-3 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            rows={3}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => setTestVariables(prev => ({ ...prev, [variable.name]: Number(e.target.value) || 0 }))}
            className="w-full px-3 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        );
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => setTestVariables(prev => ({ ...prev, [variable.name]: e.target.value }))}
            className="w-full px-3 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        );
      case 'boolean':
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => setTestVariables(prev => ({ ...prev, [variable.name]: e.target.checked }))}
              className="rounded border-zinc-600 bg-zinc-800 text-cyan-500 focus:ring-cyan-500"
            />
            <span className="text-sm text-zinc-300">
              {value ? 'Yes' : 'No'}
            </span>
          </label>
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setTestVariables(prev => ({ ...prev, [variable.name]: e.target.value }))}
            className="w-full px-3 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        );
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'variables', label: 'Variables', icon: Settings },
    { id: 'content', label: 'Content', icon: Code },
    { id: 'preview', label: 'Preview', icon: FileText }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-5xl mx-auto">
        <Modal onClose={onClose}>
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Wand2 className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="text-2xl font-bold bg-transparent text-white border-b border-zinc-600 focus:outline-none focus:border-cyan-500"
                />
              ) : (
                <h2 className="text-2xl font-bold text-white">{template.name}</h2>
              )}
              <div className="flex items-center gap-4 mt-1 text-sm text-zinc-400">
                <span className="capitalize">{template.template_type} Template</span>
                <span>•</span>
                <span>{template.variables.length} variables</span>
                <span>•</span>
                <span>
                  {template.is_active ? (
                    <span className="text-emerald-400">Active</span>
                  ) : (
                    <span className="text-zinc-500">Inactive</span>
                  )}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm({
                      name: template.name,
                      description: template.description || '',
                      content_template: template.content_template,
                      is_active: template.is_active
                    });
                  }}
                  className="px-3 py-1.5 text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-1.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleTestRender}
                  className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                  title="Test render template"
                >
                  <Play className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 bg-zinc-700/50 text-zinc-400 rounded-lg hover:bg-zinc-600/50 hover:text-white transition-colors"
                  title="Edit template"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-700/50">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-cyan-400 border-b-2 border-cyan-500'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Description
                </label>
                {isEditing ? (
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                    rows={3}
                    placeholder="Template description..."
                  />
                ) : (
                  <p className="text-zinc-400">
                    {template.description || 'No description provided'}
                  </p>
                )}
              </div>

              {/* Status */}
              {isEditing && (
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editForm.is_active}
                      onChange={(e) => setEditForm(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="rounded border-zinc-600 bg-zinc-800 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-sm text-zinc-300">Template is active</span>
                  </label>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <User className="w-4 h-4 text-zinc-500" />
                    <span className="text-zinc-400">Created by:</span>
                    <span className="text-white">System</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-zinc-500" />
                    <span className="text-zinc-400">Created:</span>
                    <span className="text-white">
                      {new Date(template.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-zinc-500" />
                    <span className="text-zinc-400">Last updated:</span>
                    <span className="text-white">
                      {template.updated_at ? new Date(template.updated_at).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-zinc-800/50 rounded-lg">
                    <h4 className="font-medium text-white mb-2">Template Stats</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Variables:</span>
                        <span className="text-white">{template.variables.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Required:</span>
                        <span className="text-white">
                          {template.variables.filter(v => v.is_required).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Content length:</span>
                        <span className="text-white">{template.content_template.length} chars</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'variables' && (
            <div className="space-y-4">
              {template.variables.length === 0 ? (
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-400">No variables defined</p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-white mb-2">Template Variables</h3>
                    <p className="text-sm text-zinc-400">
                      Configure test values to preview how the template will render
                    </p>
                  </div>
                  <div className="grid gap-4">
                    {template.variables.map((variable, index) => {
                      const Icon = getVariableIcon(variable.type);
                      return (
                        <div key={index} className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-zinc-700/50 rounded-lg">
                              <Icon className="w-4 h-4 text-cyan-400" />
                            </div>
                            <div className="flex-1 space-y-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <code className="text-cyan-400 bg-zinc-900 px-2 py-1 rounded text-sm">
                                    {`{{${variable.name}}}`}
                                  </code>
                                  <span className="text-sm text-zinc-400">({variable.type})</span>
                                  {variable.is_required && (
                                    <span className="text-xs text-red-400 bg-red-500/20 px-1.5 py-0.5 rounded">
                                      Required
                                    </span>
                                  )}
                                </div>
                                {variable.description && (
                                  <p className="text-sm text-zinc-500">{variable.description}</p>
                                )}
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                  Test Value
                                </label>
                                {renderVariableInput(variable)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'content' && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">Template Content</h3>
                <p className="text-sm text-zinc-400">
                  Use {`{{variable_name}}`} syntax to insert variables
                </p>
              </div>
              
              {isEditing ? (
                <textarea
                  value={editForm.content_template}
                  onChange={(e) => setEditForm(prev => ({ ...prev, content_template: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none font-mono text-sm"
                  rows={20}
                />
              ) : (
                <div className="bg-zinc-800/50 rounded-lg border border-zinc-700 p-4">
                  <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono">
                    {template.content_template}
                  </pre>
                </div>
              )}
            </div>
          )}

          {activeTab === 'preview' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Preview</h3>
                  <p className="text-sm text-zinc-400">
                    Preview with current test values
                  </p>
                </div>
                <button
                  onClick={generatePreview}
                  className="px-3 py-1.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-sm"
                >
                  Refresh Preview
                </button>
              </div>
              
              <div className="bg-white rounded-lg border border-zinc-700 p-6 min-h-[400px]">
                {isPreviewLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                    <span className="ml-3 text-zinc-600">Generating preview...</span>
                  </div>
                ) : (
                  <div className="prose max-w-none">
                    <pre className="text-sm text-zinc-800 whitespace-pre-wrap">
                      {previewContent}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
        </Modal>
      </div>
    </div>
  );
};
