import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Wand2, 
  Plus, 
  Search, 
  Filter, 
  Eye,
  Edit,
  Trash2,
  Copy,
  Play,
  Settings,
  ChevronDown,
  X,
  FileText,
  Code,
  Download
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader.tsx';
import { CreateTemplateModal } from '../components/CreateTemplateModal.tsx';
import { TemplateDetailModal } from '../components/TemplateDetailModal.tsx';
import { 
  listTemplates, 
  deleteTemplate,
  renderTemplate,
  type Template 
} from '../services/docs.api.ts';

const TemplatesRoute = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    template_type: searchParams.get('template_type') || '',
    is_active: searchParams.get('is_active') || '',
    search: searchParams.get('search') || ''
  });

  const templateTypes = [
    { value: 'proposal', label: 'Proposal Templates', icon: '📄', color: 'text-blue-400' },
    { value: 'sow', label: 'SOW Templates', icon: '📋', color: 'text-emerald-400' },
    { value: 'report', label: 'Report Templates', icon: '📊', color: 'text-purple-400' },
    { value: 'invoice', label: 'Invoice Templates', icon: '💰', color: 'text-yellow-400' },
    { value: 'other', label: 'Other Templates', icon: '📄', color: 'text-zinc-400' }
  ];

  useEffect(() => {
    loadTemplates();
  }, [filters]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const result = await listTemplates({
        org_id: 1, // TODO: Get from auth context
        template_type: filters.template_type || undefined,
        is_active: filters.is_active ? filters.is_active === 'true' : undefined,
        page: 1,
        limit: 100
      });
      setTemplates(result.data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleDeleteTemplate = async (template: Template) => {
    if (!window.confirm(`Are you sure you want to delete "${template.name}"?`)) return;
    
    try {
      await deleteTemplate(template.id, 1); // TODO: Get org_id from auth context
      await loadTemplates();
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const handleViewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setShowDetailModal(true);
  };

  const handleTestTemplate = async (template: Template) => {
    try {
      // Create test variables with default values
      const testVariables: Record<string, any> = {};
      template.variables.forEach(variable => {
        switch (variable.type) {
          case 'text':
            testVariables[variable.name] = variable.default_value || `Sample ${variable.name}`;
            break;
          case 'number':
            testVariables[variable.name] = Number(variable.default_value) || 123;
            break;
          case 'date':
            testVariables[variable.name] = variable.default_value || new Date().toISOString().split('T')[0];
            break;
          case 'boolean':
            testVariables[variable.name] = variable.default_value === 'true';
            break;
          default:
            testVariables[variable.name] = variable.default_value || 'Sample Value';
        }
      });

      await renderTemplate(template.id, {
        org_id: 1,
        variables: testVariables,
        output_format: 'html'
      });
      
      alert('Template rendered successfully! Check your documents list.');
    } catch (error) {
      console.error('Failed to test template:', error);
      alert('Failed to test template. Please check the template configuration.');
    }
  };

  const filteredTemplates = templates.filter(template => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return template.name.toLowerCase().includes(searchLower) ||
             (template.description && template.description.toLowerCase().includes(searchLower));
    }
    return true;
  });

  const getTypeBadge = (type: Template['template_type']) => {
    const typeConfig = templateTypes.find(t => t.value === type);
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${typeConfig?.color} bg-zinc-800/50`}>
        <span>{typeConfig?.icon || '📄'}</span>
        {typeConfig?.label || type}
      </span>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        isActive 
          ? 'text-emerald-400 bg-emerald-500/20' 
          : 'text-zinc-400 bg-zinc-500/20'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const columns = [
    {
      key: 'name',
      label: 'Template',
      sortable: true,
      render: (template: Template) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-zinc-800/50">
            <Wand2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="font-medium text-white mb-1">{template.name}</div>
            <div className="flex items-center gap-2 text-xs">
              {getTypeBadge(template.template_type)}
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-400">{template.variables.length} variables</span>
            </div>
            {template.description && (
              <div className="text-xs text-zinc-500 mt-1 line-clamp-2">{template.description}</div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      render: (template: Template) => getStatusBadge(template.is_active)
    },
    {
      key: 'variables',
      label: 'Variables',
      render: (template: Template) => (
        <div className="text-sm">
          <div className="text-zinc-300">{template.variables.length} total</div>
          <div className="text-zinc-500 text-xs">
            {template.variables.filter(v => v.is_required).length} required
          </div>
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (template: Template) => (
        <div className="text-sm">
          <div className="text-zinc-300">
            {new Date(template.created_at).toLocaleDateString()}
          </div>
          <div className="text-zinc-500 text-xs">
            {new Date(template.created_at).toLocaleTimeString()}
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (template: Template) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewTemplate(template)}
            className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-cyan-400 transition-colors"
            title="View template"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleTestTemplate(template)}
            className="p-2 rounded-lg bg-zinc-800/50 hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400 transition-colors"
            title="Test template"
          >
            <Play className="w-4 h-4" />
          </button>
          <button
            className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-blue-400 transition-colors"
            title="Edit template"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-orange-400 transition-colors"
            title="Duplicate template"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteTemplate(template)}
            className="p-2 rounded-lg bg-zinc-800/50 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
            title="Delete template"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      <PageHeader
        title="Document Templates"
        subtitle="Create and manage reusable document templates"
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-4 h-4" />
              Create Template
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search templates..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 pr-4 py-2 bg-zinc-800/50 text-white border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                showFilters 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-8 p-6 bg-zinc-800/30 backdrop-blur-sm rounded-xl border border-zinc-700/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Template Type
                </label>
                <select
                  value={filters.template_type}
                  onChange={(e) => handleFilterChange('template_type', e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">All Types</option>
                  {templateTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Status
                </label>
                <select
                  value={filters.is_active}
                  onChange={(e) => handleFilterChange('is_active', e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">All Templates</option>
                  <option value="true">Active Only</option>
                  <option value="false">Inactive Only</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {(filters.template_type || filters.is_active || filters.search) && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setFilters({ template_type: '', is_active: '', search: '' });
                    setSearchParams(new URLSearchParams());
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1 text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Templates Table */}
        <div className="bg-zinc-800/30 backdrop-blur-sm rounded-xl border border-zinc-700/50 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
              <span className="ml-3 text-zinc-400">Loading templates...</span>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Wand2 className="w-12 h-12 text-zinc-600 mb-4" />
              <h3 className="text-lg font-medium text-zinc-400 mb-2">No templates found</h3>
              <p className="text-zinc-500 text-center max-w-sm">
                {filters.search || filters.template_type || filters.is_active
                  ? 'Try adjusting your filters or search terms.'
                  : 'Get started by creating your first document template.'}
              </p>
              {!filters.search && !filters.template_type && !filters.is_active && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Create First Template
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="text-left py-3 px-4 font-medium text-zinc-300">Template</th>
                    <th className="text-left py-3 px-4 font-medium text-zinc-300">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-zinc-300">Variables</th>
                    <th className="text-left py-3 px-4 font-medium text-zinc-300">Created</th>
                    <th className="text-left py-3 px-4 font-medium text-zinc-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTemplates.map((template) => (
                    <tr key={template.id} className="border-b border-zinc-800 hover:bg-zinc-800/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-zinc-800/50">
                            <Wand2 className="w-4 h-4 text-cyan-400" />
                          </div>
                          <div>
                            <div className="font-medium text-white mb-1">{template.name}</div>
                            <div className="flex items-center gap-2 text-xs">
                              {getTypeBadge(template.template_type)}
                              <span className="text-zinc-500">•</span>
                              <span className="text-zinc-400">{template.variables.length} variables</span>
                            </div>
                            {template.description && (
                              <div className="text-xs text-zinc-500 mt-1 line-clamp-2">{template.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(template.is_active)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div className="text-zinc-300">{template.variables.length} total</div>
                          <div className="text-zinc-500 text-xs">
                            {template.variables.filter(v => v.is_required).length} required
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div className="text-zinc-300">
                            {new Date(template.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-zinc-500 text-xs">
                            {new Date(template.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewTemplate(template)}
                            className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-cyan-400 transition-colors"
                            title="View template"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleTestTemplate(template)}
                            className="p-2 rounded-lg bg-zinc-800/50 hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400 transition-colors"
                            title="Test template"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-blue-400 transition-colors"
                            title="Edit template"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-orange-400 transition-colors"
                            title="Duplicate template"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template)}
                            className="p-2 rounded-lg bg-zinc-800/50 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                            title="Delete template"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateTemplateModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadTemplates();
          }}
        />
      )}

      {showDetailModal && selectedTemplate && (
        <TemplateDetailModal
          template={selectedTemplate}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedTemplate(null);
          }}
          onUpdate={loadTemplates}
        />
      )}
    </div>
  );
};

export default TemplatesRoute;
