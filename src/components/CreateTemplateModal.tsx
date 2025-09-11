import React, { useState } from 'react';
import { X, Wand2, FileText, Code, Database, Calendar, Type, Hash, Check, Info } from 'lucide-react';
import Modal from './Modal.tsx';
import { createTemplate, type Template, type TemplateVariable } from '../services/docs.api.ts';

interface CreateTemplateModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({
  onClose,
  onSuccess
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    template_type: 'proposal' as Template['template_type'],
    content_template: '',
    variables: [] as Omit<TemplateVariable, 'id' | 'template_id'>[],
    is_active: true
  });
  const [newVariable, setNewVariable] = useState({
    name: '',
    type: 'text' as TemplateVariable['type'],
    description: '',
    is_required: false,
    default_value: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const templateTypes = [
    { value: 'proposal', label: 'Proposal Template', icon: FileText, description: 'Business proposals and quotes' },
    { value: 'sow', label: 'SOW Template', icon: Database, description: 'Statement of Work documents' },
    { value: 'report', label: 'Report Template', icon: FileText, description: 'Audit and assessment reports' },
    { value: 'invoice', label: 'Invoice Template', icon: Hash, description: 'Billing and invoice documents' },
    { value: 'other', label: 'Custom Template', icon: Code, description: 'Custom document templates' }
  ];

  const variableTypes = [
    { value: 'text', label: 'Text', icon: Type, description: 'Single line text input' },
    { value: 'textarea', label: 'Long Text', icon: FileText, description: 'Multi-line text area' },
    { value: 'number', label: 'Number', icon: Hash, description: 'Numeric input' },
    { value: 'date', label: 'Date', icon: Calendar, description: 'Date picker' },
    { value: 'boolean', label: 'Yes/No', icon: Check, description: 'Boolean checkbox' }
  ];

  const handleAddVariable = () => {
    if (!newVariable.name.trim()) return;

    setFormData(prev => ({
      ...prev,
      variables: [...prev.variables, { ...newVariable, name: newVariable.name.toLowerCase().replace(/\s+/g, '_') }]
    }));
    setNewVariable({
      name: '',
      type: 'text',
      description: '',
      is_required: false,
      default_value: ''
    });
  };

  const handleRemoveVariable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await createTemplate({
        org_id: 1, // TODO: Get from auth context
        name: formData.name,
        description: formData.description,
        template_type: formData.template_type,
        content_template: formData.content_template,
        variables: formData.variables,
        is_active: formData.is_active
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to create template:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Template details and type' },
    { number: 2, title: 'Variables', description: 'Configure template variables' },
    { number: 3, title: 'Content', description: 'Template content and preview' }
  ];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className={`flex items-center ${
            currentStep >= step.number ? 'text-cyan-400' : 'text-zinc-500'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= step.number 
                ? 'bg-cyan-500 text-white' 
                : 'bg-zinc-700 text-zinc-400'
            }`}>
              {step.number}
            </div>
            <div className="ml-3 hidden sm:block">
              <div className="text-sm font-medium">{step.title}</div>
              <div className="text-xs opacity-75">{step.description}</div>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className={`mx-4 w-8 h-px ${
              currentStep > step.number ? 'bg-cyan-500' : 'bg-zinc-600'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Template Name */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Template Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-3 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder="Enter template name..."
          autoFocus
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
          rows={3}
          placeholder="Describe what this template is used for..."
        />
      </div>

      {/* Template Type */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-4">
          Template Type *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {templateTypes.map(type => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                onClick={() => setFormData(prev => ({ ...prev, template_type: type.value as Template['template_type'] }))}
                className={`p-4 rounded-lg border text-left transition-all ${
                  formData.template_type === type.value
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                    : 'border-zinc-600 bg-zinc-800/50 text-zinc-300 hover:border-zinc-500'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{type.label}</span>
                </div>
                <p className="text-sm opacity-75">{type.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-4 h-4 text-cyan-400" />
        <span className="text-sm text-zinc-400">
          Variables allow dynamic content in your templates. Use {`{{variable_name}}`} in your template content.
        </span>
      </div>

      {/* Add Variable Form */}
      <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
        <h4 className="font-medium text-white mb-4">Add Variable</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Variable Name *
            </label>
            <input
              type="text"
              value={newVariable.name}
              onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="client_name, project_title, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Type
            </label>
            <select
              value={newVariable.type}
              onChange={(e) => setNewVariable(prev => ({ ...prev, type: e.target.value as TemplateVariable['type'] }))}
              className="w-full px-3 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {variableTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Description
            </label>
            <input
              type="text"
              value={newVariable.description}
              onChange={(e) => setNewVariable(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Describe what this variable represents..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Default Value
            </label>
            <input
              type="text"
              value={newVariable.default_value}
              onChange={(e) => setNewVariable(prev => ({ ...prev, default_value: e.target.value }))}
              className="w-full px-3 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Optional default value..."
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={newVariable.is_required}
                onChange={(e) => setNewVariable(prev => ({ ...prev, is_required: e.target.checked }))}
                className="rounded border-zinc-600 bg-zinc-800 text-cyan-500 focus:ring-cyan-500"
              />
              Required field
            </label>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleAddVariable}
            disabled={!newVariable.name.trim()}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Variable
          </button>
        </div>
      </div>

      {/* Variables List */}
      {formData.variables.length > 0 && (
        <div>
          <h4 className="font-medium text-white mb-4">Template Variables</h4>
          <div className="space-y-2">
            {formData.variables.map((variable, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-cyan-400 bg-zinc-900 px-2 py-1 rounded text-sm">
                      {`{{${variable.name}}}`}
                    </code>
                    <span className="text-sm text-zinc-400">({variable.type})</span>
                    {variable.is_required && (
                      <span className="text-xs text-red-400 bg-red-500/20 px-1.5 py-0.5 rounded">Required</span>
                    )}
                  </div>
                  {variable.description && (
                    <p className="text-sm text-zinc-500">{variable.description}</p>
                  )}
                  {variable.default_value && (
                    <p className="text-sm text-zinc-400">Default: {variable.default_value}</p>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveVariable(index)}
                  className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-4 h-4 text-cyan-400" />
        <span className="text-sm text-zinc-400">
          Use {`{{variable_name}}`} syntax to insert variables into your template content.
        </span>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Template Content *
        </label>
        <textarea
          value={formData.content_template}
          onChange={(e) => setFormData(prev => ({ ...prev, content_template: e.target.value }))}
          className="w-full px-3 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none font-mono text-sm"
          rows={12}
          placeholder={`Enter your template content here...

Example:
# {{project_title}}

Dear {{client_name}},

We are pleased to present this proposal for {{project_title}}.

## Project Overview
{{project_description}}

## Timeline
Start Date: {{start_date}}
Duration: {{project_duration}} weeks

Best regards,
{{author_name}}`}
        />
      </div>

      {/* Variable Reference */}
      {formData.variables.length > 0 && (
        <div className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-700">
          <h4 className="font-medium text-white mb-3">Available Variables</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {formData.variables.map((variable, index) => (
              <button
                key={index}
                onClick={() => {
                  const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
                  if (textarea) {
                    const cursorPos = textarea.selectionStart;
                    const content = formData.content_template;
                    const before = content.substring(0, cursorPos);
                    const after = content.substring(cursorPos);
                    const newContent = before + `{{${variable.name}}}` + after;
                    setFormData(prev => ({ ...prev, content_template: newContent }));
                    setTimeout(() => {
                      textarea.focus();
                      textarea.setSelectionRange(
                        cursorPos + variable.name.length + 4,
                        cursorPos + variable.name.length + 4
                      );
                    }, 0);
                  }
                }}
                className="text-left p-2 bg-zinc-800 text-cyan-400 rounded text-sm hover:bg-zinc-700 transition-colors"
              >
                {`{{${variable.name}}}`}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() && formData.template_type;
      case 2:
        return true; // Variables are optional
      case 3:
        return formData.content_template.trim();
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-4xl mx-auto">
        <Modal onClose={onClose}>
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Wand2 className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Create Template</h2>
              <p className="text-zinc-400">Build a reusable document template</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Content */}
        <div className="mb-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            
            {currentStep < 3 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
                className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Template'}
              </button>
            )}
          </div>
        </div>
      </div>
        </Modal>
      </div>
    </div>
  );
};
