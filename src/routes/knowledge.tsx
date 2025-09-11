import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Eye,
  Edit,
  Trash2,
  Star,
  Tag,
  Calendar,
  User,
  ChevronDown,
  X,
  FileText,
  Settings,
  HelpCircle,
  Shield,
  Book
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader.tsx';
import { CreateKnowledgeArticleModal } from '../components/CreateKnowledgeArticleModal.tsx';
import { 
  listKnowledgeArticles, 
  deleteKnowledgeArticle,
  publishKnowledgeArticle,
  type KnowledgeArticle 
} from '../services/docs.api.ts';

const KnowledgeRoute = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    article_type: searchParams.get('article_type') || '',
    category: searchParams.get('category') || '',
    status: searchParams.get('status') || '',
    search: searchParams.get('search') || ''
  });

  const articleTypes = [
    { value: 'sop', label: 'Standard Operating Procedures', icon: Settings, color: 'text-blue-400' },
    { value: 'runbook', label: 'Runbooks', icon: Book, color: 'text-emerald-400' },
    { value: 'faq', label: 'FAQ', icon: HelpCircle, color: 'text-purple-400' },
    { value: 'guide', label: 'Guides', icon: FileText, color: 'text-orange-400' },
    { value: 'policy', label: 'Policies', icon: Shield, color: 'text-red-400' }
  ];

  const articleStatuses = [
    { value: 'draft', label: 'Draft', color: 'text-zinc-400' },
    { value: 'published', label: 'Published', color: 'text-emerald-400' },
    { value: 'archived', label: 'Archived', color: 'text-zinc-500' }
  ];

  const categories = [
    'Audit Procedures',
    'Client Management',
    'Quality Control',
    'Security',
    'Documentation',
    'Training',
    'Compliance',
    'Technical Setup'
  ];

  useEffect(() => {
    loadArticles();
  }, [filters]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const result = await listKnowledgeArticles({
        org_id: 1, // TODO: Get from auth context
        article_type: filters.article_type || undefined,
        category: filters.category || undefined,
        status: filters.status || undefined,
        page: 1,
        limit: 100
      });
      setArticles(result.data);
    } catch (error) {
      console.error('Failed to load articles:', error);
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

  const handleDeleteArticle = async (article: KnowledgeArticle) => {
    if (!window.confirm(`Are you sure you want to delete "${article.title}"?`)) return;
    
    try {
      await deleteKnowledgeArticle(article.id, 1); // TODO: Get org_id from auth context
      await loadArticles();
    } catch (error) {
      console.error('Failed to delete article:', error);
    }
  };

  const handlePublishArticle = async (article: KnowledgeArticle) => {
    try {
      await publishKnowledgeArticle(article.id, 1); // TODO: Get org_id from auth context
      await loadArticles();
    } catch (error) {
      console.error('Failed to publish article:', error);
    }
  };

  const filteredArticles = articles.filter(article => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return article.title.toLowerCase().includes(searchLower) ||
             article.content.toLowerCase().includes(searchLower) ||
             article.category.toLowerCase().includes(searchLower) ||
             article.tags.some(tag => tag.toLowerCase().includes(searchLower));
    }
    return true;
  });

  const getStatusBadge = (status: KnowledgeArticle['status']) => {
    const statusConfig = articleStatuses.find(s => s.value === status);
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig?.color} bg-zinc-800/50`}>
        {statusConfig?.label || status}
      </span>
    );
  };

  const getTypeBadge = (type: KnowledgeArticle['article_type']) => {
    const typeConfig = articleTypes.find(t => t.value === type);
    const Icon = typeConfig?.icon || FileText;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${typeConfig?.color} bg-zinc-800/50`}>
        <Icon className="w-3 h-3" />
        {typeConfig?.label || type}
      </span>
    );
  };

  const columns = [
    {
      key: 'title',
      label: 'Article',
      sortable: true,
      render: (article: KnowledgeArticle) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-zinc-800/50">
            <BookOpen className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="font-medium text-white mb-1">{article.title}</div>
            <div className="flex items-center gap-2 text-xs">
              {getTypeBadge(article.article_type)}
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-400">{article.category}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (article: KnowledgeArticle) => getStatusBadge(article.status)
    },
    {
      key: 'tags',
      label: 'Tags',
      render: (article: KnowledgeArticle) => (
        <div className="flex flex-wrap gap-1">
          {article.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-zinc-400 bg-zinc-800/50">
              <Tag className="w-2 h-2" />
              {tag}
            </span>
          ))}
          {article.tags.length > 3 && (
            <span className="text-xs text-zinc-500">+{article.tags.length - 3} more</span>
          )}
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (article: KnowledgeArticle) => (
        <div className="text-sm">
          <div className="text-zinc-300">
            {new Date(article.created_at).toLocaleDateString()}
          </div>
          <div className="text-zinc-500 text-xs">
            {new Date(article.created_at).toLocaleTimeString()}
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (article: KnowledgeArticle) => (
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-cyan-400 transition-colors"
            title="View article"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-blue-400 transition-colors"
            title="Edit article"
          >
            <Edit className="w-4 h-4" />
          </button>
          {article.status === 'draft' && (
            <button
              onClick={() => handlePublishArticle(article)}
              className="p-2 rounded-lg bg-zinc-800/50 hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400 transition-colors"
              title="Publish article"
            >
              <Star className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => handleDeleteArticle(article)}
            className="p-2 rounded-lg bg-zinc-800/50 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
            title="Delete article"
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
        title="Knowledge Base"
        subtitle="Manage SOPs, runbooks, guides, FAQs, and policies"
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
              Create Article
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search articles..."
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Article Type
                </label>
                <select
                  value={filters.article_type}
                  onChange={(e) => handleFilterChange('article_type', e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">All Types</option>
                  {articleTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
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
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">All Statuses</option>
                  {articleStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {(filters.article_type || filters.category || filters.status || filters.search) && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setFilters({ article_type: '', category: '', status: '', search: '' });
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

        {/* Articles Table */}
        <div className="bg-zinc-800/30 backdrop-blur-sm rounded-xl border border-zinc-700/50 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
              <span className="ml-3 text-zinc-400">Loading articles...</span>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <BookOpen className="w-12 h-12 text-zinc-600 mb-4" />
              <h3 className="text-lg font-medium text-zinc-400 mb-2">No articles found</h3>
              <p className="text-zinc-500 text-center max-w-sm">
                {filters.search || filters.article_type || filters.category || filters.status
                  ? 'Try adjusting your filters or search terms.'
                  : 'Get started by creating your first knowledge article.'}
              </p>
              {!filters.search && !filters.article_type && !filters.category && !filters.status && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Create First Article
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="text-left py-3 px-4 font-medium text-zinc-300">Article</th>
                    <th className="text-left py-3 px-4 font-medium text-zinc-300">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-zinc-300">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-zinc-300">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-zinc-300">Modified</th>
                    <th className="text-left py-3 px-4 font-medium text-zinc-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArticles.map((article) => (
                    <tr key={article.id} className="border-b border-zinc-800 hover:bg-zinc-800/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-5 h-5 text-cyan-400" />
                          <div>
                            <div className="font-medium text-white">{article.title}</div>
                            <div className="text-sm text-zinc-400">
                              {article.tags.length > 0 && (
                                <div className="flex gap-1 mt-1">
                                  {article.tags.slice(0, 3).map((tag, idx) => (
                                    <span key={idx} className="px-2 py-0.5 bg-zinc-700 text-zinc-300 text-xs rounded">
                                      {tag}
                                    </span>
                                  ))}
                                  {article.tags.length > 3 && (
                                    <span className="text-zinc-500 text-xs">+{article.tags.length - 3}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getTypeBadge(article.article_type)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-zinc-300">{article.category}</span>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(article.status)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div className="text-zinc-300">
                            {article.updated_at ? new Date(article.updated_at).toLocaleDateString() : new Date(article.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-zinc-500">
                            {article.updated_at ? new Date(article.updated_at).toLocaleTimeString() : new Date(article.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-cyan-400 transition-colors"
                            title="View article"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-blue-400 transition-colors"
                            title="Edit article"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(article)}
                            className="p-2 rounded-lg bg-zinc-800/50 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                            title="Delete article"
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
        <CreateKnowledgeArticleModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadArticles();
          }}
        />
      )}
    </div>
  );
};

export default KnowledgeRoute;
