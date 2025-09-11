import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Upload,
  Download,
  Eye,
  Edit,
  Trash2,
  Share2,
  Clock,
  User,
  Tag,
  ExternalLink,
  Folder,
  FileCheck,
  AlertCircle,
  ChevronDown,
  X
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader.tsx';
import { CreateDocumentModal } from '../components/CreateDocumentModal.tsx';
import { DocumentDetailModal } from '../components/DocumentDetailModal.tsx';
import { ShareDocumentModal } from '../components/ShareDocumentModal.tsx';
import { UploadDocumentModal } from '../components/UploadDocumentModal.tsx';
import { 
  listDocuments, 
  deleteDocument, 
  updateDocumentStatus,
  getDocumentStatusColor,
  formatFileSize,
  canTransitionDocumentStatus,
  type Document 
} from '../services/docs.api.ts';

const DocumentsRoute = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    status: searchParams.get('status') || '',
    classification: searchParams.get('classification') || '',
    search: searchParams.get('search') || ''
  });

  const documentTypes = [
    { value: 'proposal', label: 'Proposals', icon: '📄' },
    { value: 'sow', label: 'Statements of Work', icon: '📋' },
    { value: 'report', label: 'Reports', icon: '📊' },
    { value: 'deliverable', label: 'Deliverables', icon: '📦' },
    { value: 'sop', label: 'SOPs', icon: '📖' },
    { value: 'evidence', label: 'Evidence', icon: '🔍' },
    { value: 'other', label: 'Other', icon: '📄' }
  ];

  const documentStatuses = [
    { value: 'draft', label: 'Draft', color: 'text-zinc-400' },
    { value: 'in_review', label: 'In Review', color: 'text-amber-400' },
    { value: 'approved', label: 'Approved', color: 'text-emerald-400' },
    { value: 'released', label: 'Released', color: 'text-blue-400' },
    { value: 'archived', label: 'Archived', color: 'text-zinc-500' }
  ];

  const classificationTypes = [
    { value: 'internal', label: 'Internal', color: 'text-blue-400' },
    { value: 'client_view', label: 'Client View', color: 'text-emerald-400' },
    { value: 'confidential', label: 'Confidential', color: 'text-red-400' }
  ];

  useEffect(() => {
    loadDocuments();
  }, [filters]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const result = await listDocuments({
        org_id: 1, // TODO: Get from auth context
        type: filters.type || undefined,
        status: filters.status || undefined,
        classification: filters.classification || undefined,
        page: 1,
        limit: 100
      });
      setDocuments(result.data);
    } catch (error) {
      console.error('Failed to load documents:', error);
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

  const handleDeleteDocument = async (doc: Document) => {
    if (!window.confirm(`Are you sure you want to delete "${doc.title}"?`)) return;
    
    try {
      await deleteDocument(doc.id, 1); // TODO: Get org_id from auth context
      await loadDocuments();
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const handleStatusChange = async (doc: Document, newStatus: Document['status']) => {
    try {
      await updateDocumentStatus(doc.id, {
        org_id: 1, // TODO: Get from auth context
        status: newStatus
      });
      await loadDocuments();
    } catch (error) {
      console.error('Failed to update document status:', error);
    }
  };

  const handleViewDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setShowDetailModal(true);
  };

  const handleShareDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setShowShareModal(true);
  };

  const filteredDocuments = documents.filter(doc => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return doc.title.toLowerCase().includes(searchLower) ||
             doc.type.toLowerCase().includes(searchLower);
    }
    return true;
  });

  const getStatusBadge = (status: Document['status']) => {
    const statusConfig = documentStatuses.find(s => s.value === status);
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig?.color} bg-zinc-800/50`}>
        {statusConfig?.label || status}
      </span>
    );
  };

  const getTypeBadge = (type: Document['type']) => {
    const typeConfig = documentTypes.find(t => t.value === type);
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-cyan-400 bg-cyan-500/10">
        <span>{typeConfig?.icon || '📄'}</span>
        {typeConfig?.label || type}
      </span>
    );
  };

  const getClassificationBadge = (classification: Document['classification']) => {
    const classConfig = classificationTypes.find(c => c.value === classification);
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${classConfig?.color} bg-zinc-800/50`}>
        {classConfig?.label || classification}
      </span>
    );
  };

  const columns = [
    {
      key: 'title',
      label: 'Document',
      sortable: true,
      render: (doc: Document) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-zinc-800/50">
            <FileText className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="font-medium text-white mb-1">{doc.title}</div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              {getTypeBadge(doc.type)}
              {getClassificationBadge(doc.classification)}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (doc: Document) => getStatusBadge(doc.status)
    },
    {
      key: 'size',
      label: 'Size',
      sortable: true,
      render: (doc: Document) => (
        <span className="text-zinc-400 text-sm">
          {formatFileSize(doc.size_bytes)}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (doc: Document) => (
        <div className="text-sm">
          <div className="text-zinc-300">
            {new Date(doc.created_at).toLocaleDateString()}
          </div>
          <div className="text-zinc-500 text-xs">
            {new Date(doc.created_at).toLocaleTimeString()}
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (doc: Document) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewDocument(doc)}
            className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-cyan-400 transition-colors"
            title="View document"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleShareDocument(doc)}
            className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-emerald-400 transition-colors"
            title="Share document"
          >
            <Share2 className="w-4 h-4" />
          </button>
          {doc.storage_url && (
            <a
              href={doc.storage_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-blue-400 transition-colors"
              title="Download document"
            >
              <Download className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={() => handleDeleteDocument(doc)}
            className="p-2 rounded-lg bg-zinc-800/50 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
            title="Delete document"
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
        title="Document Management"
        subtitle="Manage documents, versions, and sharing permissions"
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
              Create Document
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg font-medium hover:bg-zinc-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search documents..."
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
                  Document Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">All Types</option>
                  {documentTypes.map(type => (
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
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">All Statuses</option>
                  {documentStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Classification Filter */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Classification
                </label>
                <select
                  value={filters.classification}
                  onChange={(e) => handleFilterChange('classification', e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">All Classifications</option>
                  {classificationTypes.map(cls => (
                    <option key={cls.value} value={cls.value}>
                      {cls.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {(filters.type || filters.status || filters.classification || filters.search) && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setFilters({ type: '', status: '', classification: '', search: '' });
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

        {/* Documents Table */}
        <div className="bg-zinc-800/30 backdrop-blur-sm rounded-xl border border-zinc-700/50 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
              <span className="ml-3 text-zinc-400">Loading documents...</span>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="w-12 h-12 text-zinc-600 mb-4" />
              <h3 className="text-lg font-medium text-zinc-400 mb-2">No documents found</h3>
              <p className="text-zinc-500 text-center max-w-sm">
                {filters.search || filters.type || filters.status || filters.classification
                  ? 'Try adjusting your filters or search terms.'
                  : 'Get started by creating your first document or uploading existing files.'}
              </p>
              {!filters.search && !filters.type && !filters.status && !filters.classification && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Create First Document
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="text-left py-3 px-4 font-medium text-zinc-300">Document</th>
                    <th className="text-left py-3 px-4 font-medium text-zinc-300">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-zinc-300">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-zinc-300">Modified</th>
                    <th className="text-left py-3 px-4 font-medium text-zinc-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="border-b border-zinc-800 hover:bg-zinc-800/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-cyan-400" />
                          <div>
                            <div className="font-medium text-white">{doc.title}</div>
                            <div className="text-sm text-zinc-400">
                              {doc.classification} • {doc.source}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(doc.status)}
                      </td>
                      <td className="py-3 px-4">
                        {getTypeBadge(doc.type)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div className="text-zinc-300">
                            {doc.updated_at ? new Date(doc.updated_at).toLocaleDateString() : new Date(doc.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-zinc-500">
                            {doc.updated_at ? new Date(doc.updated_at).toLocaleTimeString() : new Date(doc.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDocument(doc)}
                            className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-cyan-400 transition-colors"
                            title="View document"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleShareDocument(doc)}
                            className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-blue-400 transition-colors"
                            title="Share document"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDocument(doc)}
                            className="p-2 rounded-lg bg-zinc-800/50 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                            title="Delete document"
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
        <CreateDocumentModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadDocuments();
          }}
        />
      )}

      {showUploadModal && (
        <UploadDocumentModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            loadDocuments();
          }}
        />
      )}

      {showDetailModal && selectedDocument && (
        <DocumentDetailModal
          document={selectedDocument}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedDocument(null);
          }}
          onUpdate={loadDocuments}
        />
      )}

      {showShareModal && selectedDocument && (
        <ShareDocumentModal
          document={selectedDocument}
          onClose={() => {
            setShowShareModal(false);
            setSelectedDocument(null);
          }}
        />
      )}
    </div>
  );
};

export default DocumentsRoute;
