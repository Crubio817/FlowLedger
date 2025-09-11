import React, { useState } from 'react';
import { X, FileText, Upload, Link, Wand2, Check, AlertCircle } from 'lucide-react';
import { createDocument, renderTemplate, listTemplates, type Document, type Template } from '../services/docs.api.ts';

interface CreateDocumentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type CreationMethod = 'upload' | 'template' | 'external_link' | 'blank';

export const CreateDocumentModal: React.FC<CreateDocumentModalProps> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState<'method' | 'details' | 'template_vars'>('method');
  const [method, setMethod] = useState<CreationMethod>('blank');
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    type: 'other' as Document['type'],
    classification: 'internal' as Document['classification'],
    external_url: '',
    template_id: '',
    template_variables: {} as Record<string, any>
  });

  const documentTypes = [
    { value: 'proposal', label: 'Proposal', icon: '📄', description: 'Client proposals and quotes' },
    { value: 'sow', label: 'Statement of Work', icon: '📋', description: 'Project scope and deliverables' },
    { value: 'report', label: 'Report', icon: '📊', description: 'Audit reports and findings' },
    { value: 'deliverable', label: 'Deliverable', icon: '📦', description: 'Client deliverables and outputs' },
    { value: 'sop', label: 'SOP', icon: '📖', description: 'Standard operating procedures' },
    { value: 'evidence', label: 'Evidence', icon: '🔍', description: 'Audit evidence and documentation' },
    { value: 'other', label: 'Other', icon: '📄', description: 'General documents' }
  ];

  const classificationTypes = [
    { value: 'internal', label: 'Internal', description: 'Internal use only', color: 'text-blue-400' },
    { value: 'client_view', label: 'Client View', description: 'Shared with clients', color: 'text-emerald-400' },
    { value: 'confidential', label: 'Confidential', description: 'Restricted access', color: 'text-red-400' }
  ];

  const methods = [
    {
      id: 'blank' as CreationMethod,
      title: 'Create Blank Document',
      description: 'Start with an empty document',
      icon: FileText,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'template' as CreationMethod,
      title: 'Use Template',
      description: 'Generate from a predefined template',
      icon: Wand2,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'upload' as CreationMethod,
      title: 'Upload File',
      description: 'Upload an existing document',
      icon: Upload,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      id: 'external_link' as CreationMethod,
      title: 'External Link',
      description: 'Link to an external document',
      icon: Link,
      color: 'from-orange-500 to-red-500'
    }
  ];

  const loadTemplates = async () => {
    try {
      const result = await listTemplates({
        org_id: 1,
        is_active: true,
        limit: 100
      });
      setTemplates(result.data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const handleMethodSelect = (selectedMethod: CreationMethod) => {
    setMethod(selectedMethod);
    if (selectedMethod === 'template') {
      loadTemplates();
    }
    setStep('details');
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setFormData(prev => ({ ...prev, template_id: template.id.toString() }));
    if (template.variables.length > 0) {
      setStep('template_vars');
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a document title');
      return;
    }

    setLoading(true);
    try {
      if (method === 'template' && selectedTemplate) {
        // Render template first, then create document
        await renderTemplate(selectedTemplate.id, {
          org_id: 1,
          variables: formData.template_variables,
          output_format: 'html'
        });
      } else {
        // Create document directly
        await createDocument({
          org_id: 1,
          title: formData.title,
          type: formData.type,
          source: method === 'external_link' ? 'external_link' : method === 'template' ? 'template' : 'upload',
          classification: formData.classification,
          storage_url: method === 'external_link' ? formData.external_url : undefined
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Failed to create document:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMethodSelection = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">How would you like to create your document?</h3>
        <p className="text-zinc-400">Choose a creation method to get started</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {methods.map((methodOption) => {
          const Icon = methodOption.icon;
          return (
            <button
              key={methodOption.id}
              onClick={() => handleMethodSelect(methodOption.id)}
              className="p-6 text-left bg-zinc-800/50 border border-zinc-700 rounded-xl hover:border-zinc-600 hover:bg-zinc-800/70 transition-all duration-200 group"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${methodOption.color} p-3 mb-4 group-hover:scale-105 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-medium text-white mb-2">{methodOption.title}</h4>
              <p className="text-zinc-400 text-sm">{methodOption.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderDetailsForm = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Document Details</h3>
        <p className="text-zinc-400">Provide basic information about your document</p>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Document Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter document title..."
          className="w-full px-4 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Document Type
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {documentTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setFormData(prev => ({ ...prev, type: type.value as Document['type'] }))}
              className={`p-3 text-left border rounded-lg transition-all duration-200 ${
                formData.type === type.value
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                  : 'border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{type.icon}</span>
                <div>
                  <div className="font-medium">{type.label}</div>
                  <div className="text-xs text-zinc-500">{type.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Classification */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Classification
        </label>
        <div className="space-y-2">
          {classificationTypes.map((cls) => (
            <button
              key={cls.value}
              onClick={() => setFormData(prev => ({ ...prev, classification: cls.value as Document['classification'] }))}
              className={`w-full p-3 text-left border rounded-lg transition-all duration-200 ${
                formData.classification === cls.value
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className={`font-medium ${formData.classification === cls.value ? 'text-cyan-400' : 'text-white'}`}>
                    {cls.label}
                  </div>
                  <div className="text-xs text-zinc-500">{cls.description}</div>
                </div>
                {formData.classification === cls.value && (
                  <Check className="w-5 h-5 text-cyan-400" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* External URL (if method is external_link) */}
      {method === 'external_link' && (
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            External URL *
          </label>
          <input
            type="url"
            value={formData.external_url}
            onChange={(e) => setFormData(prev => ({ ...prev, external_url: e.target.value }))}
            placeholder="https://example.com/document.pdf"
            className="w-full px-4 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Template Selection (if method is template) */}
      {method === 'template' && (
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Select Template
          </label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className={`w-full p-3 text-left border rounded-lg transition-all duration-200 ${
                  selectedTemplate?.id === template.id
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-medium ${selectedTemplate?.id === template.id ? 'text-cyan-400' : 'text-white'}`}>
                      {template.name}
                    </div>
                    {template.description && (
                      <div className="text-xs text-zinc-500 mt-1">{template.description}</div>
                    )}
                    <div className="text-xs text-zinc-600 mt-1">
                      {template.variables.length} variables • {template.template_type}
                    </div>
                  </div>
                  {selectedTemplate?.id === template.id && (
                    <Check className="w-5 h-5 text-cyan-400" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderTemplateVariables = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Template Variables</h3>
        <p className="text-zinc-400">Fill in the template variables</p>
      </div>

      {selectedTemplate?.variables.map((variable) => (
        <div key={variable.name}>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            {variable.name}
            {variable.is_required && <span className="text-red-400 ml-1">*</span>}
          </label>
          {variable.description && (
            <p className="text-xs text-zinc-500 mb-2">{variable.description}</p>
          )}
          
          {variable.type === 'boolean' ? (
            <select
              value={formData.template_variables[variable.name] || 'false'}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                template_variables: {
                  ...prev.template_variables,
                  [variable.name]: e.target.value === 'true'
                }
              }))}
              className="w-full px-4 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          ) : variable.type === 'date' ? (
            <input
              type="date"
              value={formData.template_variables[variable.name] || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                template_variables: {
                  ...prev.template_variables,
                  [variable.name]: e.target.value
                }
              }))}
              className="w-full px-4 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          ) : (
            <input
              type={variable.type === 'number' ? 'number' : 'text'}
              value={formData.template_variables[variable.name] || variable.default_value || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                template_variables: {
                  ...prev.template_variables,
                  [variable.name]: variable.type === 'number' ? Number(e.target.value) : e.target.value
                }
              }))}
              placeholder={`Enter ${variable.name.toLowerCase()}...`}
              className="w-full px-4 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-700">
          <div>
            <h2 className="text-xl font-semibold text-white">Create New Document</h2>
            <p className="text-zinc-400 text-sm mt-1">
              {step === 'method' && 'Choose how to create your document'}
              {step === 'details' && 'Provide document details'}
              {step === 'template_vars' && 'Configure template variables'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {step === 'method' && renderMethodSelection()}
          {step === 'details' && renderDetailsForm()}
          {step === 'template_vars' && renderTemplateVariables()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-zinc-700">
          <div className="flex items-center gap-2">
            {step !== 'method' && (
              <button
                onClick={() => {
                  if (step === 'template_vars') setStep('details');
                  else if (step === 'details') setStep('method');
                }}
                className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
              >
                ← Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            
            {step === 'details' && (method !== 'template' || !selectedTemplate?.variables.length) && (
              <button
                onClick={handleSubmit}
                disabled={loading || !formData.title.trim()}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                Create Document
              </button>
            )}

            {step === 'details' && method === 'template' && selectedTemplate?.variables.length && (
              <button
                onClick={() => setStep('template_vars')}
                disabled={!selectedTemplate}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            )}

            {step === 'template_vars' && (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                Generate Document
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
