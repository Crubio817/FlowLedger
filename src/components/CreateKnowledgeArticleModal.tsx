import React, { useState } from 'react';
import { X, BookOpen, Save, Eye, Tag, Settings, Book, HelpCircle, FileText, Shield } from 'lucide-react';
import { createKnowledgeArticle, type KnowledgeArticle } from '../services/docs.api.ts';

interface CreateKnowledgeArticleModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateKnowledgeArticleModal: React.FC<CreateKnowledgeArticleModalProps> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    article_type: 'guide' as KnowledgeArticle['article_type'],
    category: '',
    tags: [] as string[],
    status: 'draft' as KnowledgeArticle['status'],
    author_id: 1 // TODO: Get from auth context
  });

  const [newTag, setNewTag] = useState('');

  const articleTypes = [
    { 
      value: 'sop', 
      label: 'Standard Operating Procedure', 
      icon: Settings, 
      color: 'text-blue-400',
      description: 'Step-by-step procedures and protocols'
    },
    { 
      value: 'runbook', 
      label: 'Runbook', 
      icon: Book, 
      color: 'text-emerald-400',
      description: 'Operational guides and troubleshooting'
    },
    { 
      value: 'faq', 
      label: 'FAQ', 
      icon: HelpCircle, 
      color: 'text-purple-400',
      description: 'Frequently asked questions and answers'
    },
    { 
      value: 'guide', 
      label: 'Guide', 
      icon: FileText, 
      color: 'text-orange-400',
      description: 'How-to guides and tutorials'
    },
    { 
      value: 'policy', 
      label: 'Policy', 
      icon: Shield, 
      color: 'text-red-400',
      description: 'Company policies and regulations'
    }
  ];

  const categories = [
    'Audit Procedures',
    'Client Management',
    'Quality Control',
    'Security',
    'Documentation',
    'Training',
    'Compliance',
    'Technical Setup',
    'Best Practices',
    'Troubleshooting'
  ];

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (!formData.category.trim()) {
      alert('Please select or enter a category');
      return;
    }

    setLoading(true);
    try {
      await createKnowledgeArticle({
        ...formData,
        org_id: 1 // TODO: Get from auth context
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to create article:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const renderPreview = () => {
    const selectedType = articleTypes.find(t => t.value === formData.article_type);
    const TypeIcon = selectedType?.icon || FileText;

    return (
      <div className="prose prose-invert max-w-none">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg bg-zinc-800/50`}>
              <TypeIcon className={`w-5 h-5 ${selectedType?.color}`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white m-0">{formData.title || 'Untitled Article'}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-sm ${selectedType?.color}`}>{selectedType?.label}</span>
                {formData.category && (
                  <>
                    <span className="text-zinc-500">•</span>
                    <span className="text-sm text-zinc-400">{formData.category}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.tags.map((tag, index) => (
                <span key={index} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-cyan-400 bg-cyan-500/10">
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-zinc-800/30 rounded-lg p-6 border border-zinc-700">
          {formData.content ? (
            <div 
              className="text-zinc-300 whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ 
                __html: formData.content.replace(/\n/g, '<br>') 
              }}
            />
          ) : (
            <p className="text-zinc-500 italic">Content preview will appear here...</p>
          )}
        </div>
      </div>
    );
  };

  const renderEditForm = () => (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Article Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter article title..."
          className="w-full px-4 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>

      {/* Type Selection */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-3">
          Article Type *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {articleTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                onClick={() => setFormData(prev => ({ ...prev, article_type: type.value as KnowledgeArticle['article_type'] }))}
                className={`p-3 text-left border rounded-lg transition-all duration-200 ${
                  formData.article_type === type.value
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${type.color}`} />
                  <div className="flex-1">
                    <div className={`font-medium ${formData.article_type === type.value ? 'text-cyan-400' : 'text-white'}`}>
                      {type.label}
                    </div>
                    <div className="text-xs text-zinc-500">{type.description}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Category *
        </label>
        <div className="relative">
          <input
            type="text"
            list="categories"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            placeholder="Select or enter category..."
            className="w-full px-4 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <datalist id="categories">
            {categories.map(category => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Tags
        </label>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Add tag..."
              className="flex-1 px-4 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            <button
              onClick={handleAddTag}
              disabled={!newTag.trim()}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
          
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Content *
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          placeholder="Write your article content here..."
          rows={12}
          className="w-full px-4 py-3 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-vertical"
        />
        <div className="mt-2 text-xs text-zinc-500">
          Tip: Use markdown-style formatting for better readability
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Status
        </label>
        <select
          value={formData.status}
          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as KnowledgeArticle['status'] }))}
          className="w-full px-4 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/20 rounded-lg">
              <BookOpen className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Create Knowledge Article</h2>
              <p className="text-zinc-400 text-sm">Share knowledge and best practices</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-zinc-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'edit'
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'preview'
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'edit' ? renderEditForm() : renderPreview()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-zinc-700">
          <div className="text-sm text-zinc-400">
            {formData.status === 'draft' ? 'Article will be saved as draft' : 'Article will be published immediately'}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.title.trim() || !formData.content.trim() || !formData.category.trim()}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <Save className="w-4 h-4" />
              {formData.status === 'draft' ? 'Save Draft' : 'Publish Article'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
