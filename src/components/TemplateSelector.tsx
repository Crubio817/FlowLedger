import React, { useState } from 'react';
import { FileText, Plus, Trash2, Edit3, Copy, Mail } from 'lucide-react';
import { Button } from '../ui/button.js';
import { Badge } from '../ui/badge.js';
import { Input } from '../ui/input.js';
import Modal from './Modal.js';
import { useEmailTemplates } from '../hooks/useCommunicationHub.js';
import { EmailTemplate, TemplateVariable } from '../services/api.js';
import { toast } from '../lib/toast.js';

interface TemplateSelectorProps {
  onSelectTemplate?: (template: EmailTemplate) => void;
  selectedTemplateId?: number;
  allowManagement?: boolean;
  className?: string;
  orgId?: number;
  principalId?: number;
}

interface CreateTemplateRequest {
  name: string;
  template_type: 'general' | 'response' | 'follow_up' | 'proposal';
  subject_template: string;
  body_template: string;
  variables: TemplateVariable[];
  is_active: boolean;
}

interface TemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: EmailTemplate;
  onSave: (templateData: CreateTemplateRequest) => Promise<void>;
}

function TemplateEditorModal({ isOpen, onClose, template, onSave }: TemplateEditorModalProps) {
  const [formData, setFormData] = useState<CreateTemplateRequest>({
    name: template?.name || '',
    subject_template: template?.subject_template || '',
    body_template: template?.body_template || '',
    template_type: template?.template_type || 'general',
    variables: template?.variables || [],
    is_active: template?.is_active ?? true
  });

  const [newVariable, setNewVariable] = useState<TemplateVariable>({
    variable_name: '',
    variable_type: 'text',
    description: '',
    default_value: '',
    is_required: false
  });

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.subject_template.trim() || !formData.body_template.trim()) {
      toast.error('Name, subject, and body are required');
      return;
    }

    try {
      await onSave(formData);
      onClose();
      toast.success(template ? 'Template updated' : 'Template created');
    } catch (error) {
      // Error already handled by withErrors
    }
  };

  const addVariable = () => {
    if (!newVariable.variable_name.trim()) {
      toast.error('Variable name is required');
      return;
    }

    if (formData.variables.some((v: TemplateVariable) => v.variable_name === newVariable.variable_name)) {
      toast.error('Variable name already exists');
      return;
    }

    setFormData(prev => ({
      ...prev,
      variables: [...prev.variables, { ...newVariable }]
    }));
    setNewVariable({
      variable_name: '',
      variable_type: 'text',
      description: '',
      default_value: '',
      is_required: false
    });
  };

  const removeVariable = (variableName: string) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter((v: TemplateVariable) => v.variable_name !== variableName)
    }));
  };

  if (!isOpen) return null;

  return (
    <Modal
      title={template ? 'Edit Template' : 'Create Template'}
      onClose={onClose}
      className="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Template Name</label>
            <Input
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Welcome Email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              value={formData.template_type}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                setFormData(prev => ({ ...prev, template_type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
            >
              <option value="general">General</option>
              <option value="response">Response</option>
              <option value="follow_up">Follow-up</option>
              <option value="proposal">Proposal</option>
            </select>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium mb-2">Subject Template</label>
          <Input
            value={formData.subject_template}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setFormData(prev => ({ ...prev, subject_template: e.target.value }))}
            placeholder="Use {{variable_name}} for dynamic content"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-medium mb-2">Body Template</label>
          <textarea
            value={formData.body_template}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
              setFormData(prev => ({ ...prev, body_template: e.target.value }))}
            placeholder="Use {{variable_name}} for dynamic content..."
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 font-mono text-sm"
          />
        </div>

        {/* Variables */}
        <div>
          <label className="block text-sm font-medium mb-2">Template Variables</label>
          <div className="space-y-3">
            {/* Existing Variables */}
            {formData.variables.map((variable: TemplateVariable, index: number) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <div className="flex-1 grid grid-cols-4 gap-3">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Name</span>
                    <p className="font-mono text-sm">{`{{${variable.variable_name}}}`}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Type</span>
                    <p className="text-sm">{variable.variable_type}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Description</span>
                    <p className="text-sm">{variable.description || 'No description'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Default</span>
                    <p className="text-sm">{variable.default_value || 'No default'}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeVariable(variable.variable_name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {/* Add New Variable */}
            <div className="grid grid-cols-6 gap-3 p-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-md">
              <Input
                placeholder="Variable name"
                value={newVariable.variable_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setNewVariable(prev => ({ ...prev, variable_name: e.target.value }))}
              />
              <select
                value={newVariable.variable_type}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                  setNewVariable(prev => ({ ...prev, variable_type: e.target.value as any }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="boolean">Boolean</option>
              </select>
              <Input
                placeholder="Description"
                value={newVariable.description || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setNewVariable(prev => ({ ...prev, description: e.target.value }))}
              />
              <Input
                placeholder="Default value"
                value={newVariable.default_value || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setNewVariable(prev => ({ ...prev, default_value: e.target.value }))}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={newVariable.is_required}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setNewVariable(prev => ({ ...prev, is_required: e.target.checked }))}
                />
                Required
              </label>
              <Button onClick={addVariable} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="template-active"
            checked={formData.is_active}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
          />
          <label htmlFor="template-active" className="text-sm font-medium">
            Template is active
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {template ? 'Update Template' : 'Create Template'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function TemplateSelector({
  onSelectTemplate,
  selectedTemplateId,
  allowManagement = false,
  className = '',
  orgId,
  principalId
}: TemplateSelectorProps) {
  const {
    templateState,
    createTemplate,
    updateTemplate,
    removeTemplate,
    loadTemplates
  } = useEmailTemplates(orgId);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | undefined>();

  // Filter templates
  const filteredTemplates = templateState.templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject_template.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || template.template_type === selectedType;
    return matchesSearch && matchesType;
  });

  const templateTypes = Array.from(new Set(templateState.templates.map(t => t.template_type)));

  const handleCreateTemplate = () => {
    setEditingTemplate(undefined);
    setIsEditorOpen(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setIsEditorOpen(true);
  };

  const handleSaveTemplate = async (templateData: CreateTemplateRequest) => {
    if (editingTemplate) {
      await updateTemplate(editingTemplate.template_id, templateData);
    } else {
      await createTemplate(templateData, principalId);
    }
    await loadTemplates();
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (confirm('Are you sure you want to delete this template?')) {
      await removeTemplate(templateId);
    }
  };

  const handleDuplicateTemplate = async (template: EmailTemplate) => {
    const duplicateData: CreateTemplateRequest = {
      name: `${template.name} (Copy)`,
      subject_template: template.subject_template,
      body_template: template.body_template,
      template_type: template.template_type,
      variables: template.variables,
      is_active: template.is_active
    };
    
    await createTemplate(duplicateData, principalId);
    await loadTemplates();
  };

  if (templateState.loading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold">Email Templates</h3>
          <Badge variant="muted">{templateState.templates.length}</Badge>
        </div>
        {allowManagement && (
          <Button onClick={handleCreateTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={selectedType}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedType(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
        >
          <option value="all">All Types</option>
          {templateTypes.map(type => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Templates Grid */}
      <div className="space-y-4">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || selectedType !== 'all' ? 'No templates match your filters' : 'No templates yet'}
            </p>
            {allowManagement && !searchTerm && selectedType === 'all' && (
              <Button onClick={handleCreateTemplate} className="mt-4">
                Create Your First Template
              </Button>
            )}
          </div>
        ) : (
          filteredTemplates.map(template => (
            <div
              key={template.template_id}
              className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                selectedTemplateId === template.template_id 
                  ? 'ring-2 ring-blue-500 border-blue-200' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              onClick={() => onSelectTemplate?.(template)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-lg font-semibold">{template.name}</h4>
                    <Badge variant="muted">{template.template_type.replace('_', ' ')}</Badge>
                    {!template.is_active && <Badge variant="muted">Inactive</Badge>}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {template.subject_template}
                  </p>
                  <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {template.body_template.substring(0, 150)}...
                  </div>
                  {template.variables.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {template.variables.slice(0, 3).map((variable: TemplateVariable) => (
                        <Badge key={variable.variable_name} variant="muted" className="text-xs">
                          {variable.variable_name}
                        </Badge>
                      ))}
                      {template.variables.length > 3 && (
                        <Badge variant="muted" className="text-xs">
                          +{template.variables.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                {allowManagement && (
                  <div className="flex items-center gap-1 ml-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleDuplicateTemplate(template);
                      }}
                      title="Duplicate template"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleEditTemplate(template);
                      }}
                      title="Edit template"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleDeleteTemplate(template.template_id);
                      }}
                      title="Delete template"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Error Display */}
      {templateState.error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400 text-sm">{templateState.error}</p>
        </div>
      )}

      {/* Template Editor Modal */}
      <TemplateEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        template={editingTemplate}
        onSave={handleSaveTemplate}
      />
    </div>
  );
}

export default TemplateSelector;
