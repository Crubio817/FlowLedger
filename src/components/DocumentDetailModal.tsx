import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Edit3, 
  Share2, 
  Clock, 
  User, 
  Tag, 
  History,
  Eye,
  ExternalLink,
  Shield,
  CheckCircle,
  AlertCircle,
  FileIcon,
  Upload
} from 'lucide-react';
import { 
  getDocument, 
  getDocumentVersions, 
  addDocumentVersion,
  updateDocumentStatus,
  getDocumentStatusColor,
  formatFileSize,
  canTransitionDocumentStatus,
  type Document, 
  type DocumentVersion 
} from '../services/docs.api.ts';

interface DocumentDetailModalProps {
  document: Document;
  onClose: () => void;
  onUpdate: () => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({ 
  document: initialDocument, 
  onClose, 
  onUpdate 
}) => {
  const [document, setDocument] = useState<Document>(initialDocument);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'versions' | 'activity'>('overview');
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState(document.title);

  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    try {
      const result = await getDocumentVersions(document.id, 1); // TODO: Get org_id from auth
      setVersions(result);
    } catch (error) {
      console.error('Failed to load versions:', error);
    }
  };

  const handleStatusChange = async (newStatus: Document['status']) => {
    if (!canTransitionDocumentStatus(document.status, newStatus)) {
      alert('Invalid status transition');
      return;
    }

    try {
      setLoading(true);
      await updateDocumentStatus(document.id, {
        org_id: 1, // TODO: Get from auth context
        status: newStatus
      });
      setDocument(prev => ({ ...prev, status: newStatus }));
      onUpdate();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Document['status']) => {
    const colors = {
      draft: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
      in_review: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      released: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      archived: 'bg-zinc-600/20 text-zinc-500 border-zinc-600/30'
    };

    const labels = {
      draft: 'Draft',
      in_review: 'In Review',
      approved: 'Approved',
      released: 'Released',
      archived: 'Archived'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colors[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getClassificationBadge = (classification: Document['classification']) => {
    const colors = {
      internal: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      client_view: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      confidential: 'bg-red-500/20 text-red-400 border-red-500/30'
    };

    const labels = {
      internal: 'Internal',
      client_view: 'Client View',
      confidential: 'Confidential'
    };

    const icons = {
      internal: Shield,
      client_view: Eye,
      confidential: AlertCircle
    };

    const Icon = icons[classification];

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${colors[classification]}`}>
        <Icon className="w-3 h-3" />
        {labels[classification]}
      </span>
    );
  };

  const nextStatuses = (() => {
    const transitions: Record<Document['status'], Document['status'][]> = {
      draft: ['in_review'],
      in_review: ['approved', 'draft'],
      approved: ['released'],
      released: ['archived'],
      archived: []
    };
    return transitions[document.status] || [];
  })();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'versions', label: 'Versions', icon: History, count: versions.length },
    { id: 'activity', label: 'Activity', icon: Clock }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Document Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {editingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="text-2xl font-bold text-white bg-zinc-800 border border-zinc-600 rounded px-3 py-1 flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setDocument(prev => ({ ...prev, title: newTitle }));
                    setEditingTitle(false);
                  } else if (e.key === 'Escape') {
                    setNewTitle(document.title);
                    setEditingTitle(false);
                  }
                }}
                autoFocus
              />
              <button
                onClick={() => {
                  setDocument(prev => ({ ...prev, title: newTitle }));
                  setEditingTitle(false);
                }}
                className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setNewTitle(document.title);
                  setEditingTitle(false);
                }}
                className="p-2 text-zinc-400 hover:bg-zinc-800 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">{document.title}</h1>
              <button
                onClick={() => setEditingTitle(true)}
                className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-3 mt-2">
            {getStatusBadge(document.status)}
            {getClassificationBadge(document.classification)}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {document.storage_url && (
            <a
              href={document.storage_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-colors"
              title="Open document"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-colors">
            <Download className="w-4 h-4" />
          </button>
          <button className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Document Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-zinc-800/50 rounded-lg p-4">
          <div className="text-zinc-400 text-sm mb-1">Type</div>
          <div className="text-white font-medium capitalize">{document.type.replace('_', ' ')}</div>
        </div>
        
        <div className="bg-zinc-800/50 rounded-lg p-4">
          <div className="text-zinc-400 text-sm mb-1">Source</div>
          <div className="text-white font-medium capitalize">{document.source.replace('_', ' ')}</div>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-4">
          <div className="text-zinc-400 text-sm mb-1">File Size</div>
          <div className="text-white font-medium">{formatFileSize(document.size_bytes)}</div>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-4">
          <div className="text-zinc-400 text-sm mb-1">MIME Type</div>
          <div className="text-white font-medium">{document.mime_type || 'Unknown'}</div>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-4">
          <div className="text-zinc-400 text-sm mb-1">Created</div>
          <div className="text-white font-medium">
            {new Date(document.created_at).toLocaleDateString()}
          </div>
          <div className="text-zinc-500 text-xs">
            {new Date(document.created_at).toLocaleTimeString()}
          </div>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-4">
          <div className="text-zinc-400 text-sm mb-1">Latest Version</div>
          <div className="text-white font-medium">v{document.latest_version || 1}</div>
        </div>
      </div>

      {/* Status Actions */}
      {nextStatuses.length > 0 && (
        <div className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-700">
          <h3 className="text-white font-medium mb-3">Available Actions</h3>
          <div className="flex gap-2">
            {nextStatuses.map(status => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={loading}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Move to {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderVersions = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Document Versions</h3>
        <button className="inline-flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-sm transition-colors">
          <Upload className="w-4 h-4" />
          Add Version
        </button>
      </div>

      {versions.length === 0 ? (
        <div className="text-center py-8">
          <History className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400">No versions available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {versions.map((version, index) => (
            <div 
              key={version.id} 
              className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center">
                    <span className="text-cyan-400 text-sm font-medium">v{version.vnum}</span>
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      Version {version.vnum}
                      {index === 0 && <span className="text-cyan-400 text-xs ml-2">(Latest)</span>}
                    </div>
                    {version.change_note && (
                      <div className="text-zinc-400 text-sm">{version.change_note}</div>
                    )}
                    <div className="text-zinc-500 text-xs">
                      {new Date(version.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 text-xs font-mono">
                    {version.hash_prefix}
                  </span>
                  <button className="p-1 text-zinc-400 hover:text-white">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderActivity = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">Recent Activity</h3>
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
        <p className="text-zinc-400">Activity tracking coming soon</p>
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
              <FileText className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Document Details</h2>
              <p className="text-zinc-400 text-sm">View and manage document information</p>
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
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-cyan-500 text-cyan-400'
                      : 'border-transparent text-zinc-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="px-2 py-0.5 bg-zinc-700 text-zinc-300 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'versions' && renderVersions()}
          {activeTab === 'activity' && renderActivity()}
        </div>
      </div>
    </div>
  );
};
