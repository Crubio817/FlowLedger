import React, { useState, useEffect } from 'react';
import { 
  X, 
  Share2, 
  Link, 
  Copy, 
  Eye, 
  Download, 
  MessageSquare, 
  Calendar,
  Shield,
  Lock,
  Globe,
  Check,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { 
  createShareLink, 
  getShareLinks, 
  revokeShareLink,
  type Document, 
  type ShareLink 
} from '../services/docs.api.ts';

interface ShareDocumentModalProps {
  document: Document;
  onClose: () => void;
}

export const ShareDocumentModal: React.FC<ShareDocumentModalProps> = ({ document, onClose }) => {
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  
  // New share link form
  const [newLink, setNewLink] = useState({
    scope: 'view' as ShareLink['scope'],
    expires_at: '',
    watermark: true,
    password: ''
  });

  const scopeOptions = [
    { 
      value: 'view', 
      label: 'View Only', 
      description: 'Recipients can view the document online',
      icon: Eye,
      color: 'text-blue-400'
    },
    { 
      value: 'download', 
      label: 'Download', 
      description: 'Recipients can view and download the document',
      icon: Download,
      color: 'text-emerald-400'
    },
    { 
      value: 'comment', 
      label: 'Comment', 
      description: 'Recipients can view, download, and add comments',
      icon: MessageSquare,
      color: 'text-purple-400'
    }
  ];

  useEffect(() => {
    loadShareLinks();
  }, []);

  const loadShareLinks = async () => {
    try {
      setLoading(true);
      const result = await getShareLinks(document.id, 1); // TODO: Get org_id from auth
      setShareLinks(result);
    } catch (error) {
      console.error('Failed to load share links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShareLink = async () => {
    try {
      setCreating(true);
      const result = await createShareLink(document.id, {
        org_id: 1, // TODO: Get from auth context
        scope: newLink.scope,
        expires_at: newLink.expires_at || undefined,
        watermark: newLink.watermark,
        password: newLink.password || undefined
      });
      
      await loadShareLinks();
      
      // Reset form
      setNewLink({
        scope: 'view',
        expires_at: '',
        watermark: true,
        password: ''
      });
    } catch (error) {
      console.error('Failed to create share link:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeLink = async (shareId: number) => {
    if (!window.confirm('Are you sure you want to revoke this share link? Recipients will no longer be able to access the document.')) {
      return;
    }

    try {
      await revokeShareLink(document.id, shareId, 1); // TODO: Get org_id from auth
      await loadShareLinks();
    } catch (error) {
      console.error('Failed to revoke share link:', error);
    }
  };

  const handleCopyLink = async (token: string) => {
    const shareUrl = `${window.location.origin}/share/${token}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(token);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const getDefaultExpiryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30); // Default to 30 days
    return date.toISOString().split('T')[0];
  };

  const getScopeBadge = (scope: ShareLink['scope']) => {
    const config = scopeOptions.find(s => s.value === scope);
    if (!config) return null;

    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color} bg-zinc-800/50`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-lg">
              <Share2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Share Document</h2>
              <p className="text-zinc-400 text-sm">Create secure links to share "{document.title}"</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create New Share Link */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white">Create Share Link</h3>
              
              {/* Scope Selection */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-3">
                  Access Level
                </label>
                <div className="space-y-2">
                  {scopeOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setNewLink(prev => ({ ...prev, scope: option.value as ShareLink['scope'] }))}
                        className={`w-full p-3 text-left border rounded-lg transition-all duration-200 ${
                          newLink.scope === option.value
                            ? 'border-cyan-500 bg-cyan-500/10'
                            : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${option.color}`} />
                          <div className="flex-1">
                            <div className={`font-medium ${newLink.scope === option.value ? 'text-cyan-400' : 'text-white'}`}>
                              {option.label}
                            </div>
                            <div className="text-xs text-zinc-500">{option.description}</div>
                          </div>
                          {newLink.scope === option.value && (
                            <Check className="w-5 h-5 text-cyan-400" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={newLink.expires_at}
                  onChange={(e) => setNewLink(prev => ({ ...prev, expires_at: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setNewLink(prev => ({ ...prev, expires_at: getDefaultExpiryDate() }))}
                    className="text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    30 days
                  </button>
                  <button
                    onClick={() => {
                      const date = new Date();
                      date.setDate(date.getDate() + 7);
                      setNewLink(prev => ({ ...prev, expires_at: date.toISOString().split('T')[0] }));
                    }}
                    className="text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    7 days
                  </button>
                  <button
                    onClick={() => setNewLink(prev => ({ ...prev, expires_at: '' }))}
                    className="text-xs text-zinc-400 hover:text-zinc-300"
                  >
                    No expiry
                  </button>
                </div>
              </div>

              {/* Security Options */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-zinc-300">Security Options</h4>
                
                {/* Watermark */}
                <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-zinc-400" />
                    <div>
                      <div className="text-white text-sm font-medium">Watermark</div>
                      <div className="text-zinc-500 text-xs">Add watermark to viewed documents</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newLink.watermark}
                      onChange={(e) => setNewLink(prev => ({ ...prev, watermark: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>

                {/* Password Protection */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4 text-zinc-400" />
                    <label className="text-sm font-medium text-zinc-300">
                      Password Protection (Optional)
                    </label>
                  </div>
                  <input
                    type="password"
                    value={newLink.password}
                    onChange={(e) => setNewLink(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password..."
                    className="w-full px-4 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Create Button */}
              <button
                onClick={handleCreateShareLink}
                disabled={creating}
                className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creating && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                Create Share Link
              </button>
            </div>

            {/* Existing Share Links */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Active Share Links</h3>
                <span className="text-sm text-zinc-400">{shareLinks.length} links</span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400"></div>
                  <span className="ml-3 text-zinc-400">Loading links...</span>
                </div>
              ) : shareLinks.length === 0 ? (
                <div className="text-center py-8">
                  <Link className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-400">No share links created yet</p>
                  <p className="text-zinc-500 text-sm">Create your first share link to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {shareLinks.map((link) => (
                    <div 
                      key={link.id} 
                      className={`p-4 border rounded-lg transition-all ${
                        isExpired(link.expires_at) 
                          ? 'border-red-500/30 bg-red-500/5' 
                          : 'border-zinc-700 bg-zinc-800/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getScopeBadge(link.scope)}
                          {link.watermark && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-yellow-400 bg-yellow-500/10">
                              <Shield className="w-3 h-3" />
                              Watermark
                            </span>
                          )}
                          {link.password_protected && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-purple-400 bg-purple-500/10">
                              <Lock className="w-3 h-3" />
                              Protected
                            </span>
                          )}
                          {isExpired(link.expires_at) && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-red-400 bg-red-500/10">
                              Expired
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleRevokeLink(link.id)}
                          className="p-1 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                          title="Revoke link"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <code className="flex-1 px-3 py-2 bg-zinc-900 text-zinc-300 text-sm rounded border border-zinc-700 font-mono break-all">
                          {window.location.origin}/share/{link.token.substring(0, 16)}...
                        </code>
                        <button
                          onClick={() => handleCopyLink(link.token)}
                          className={`p-2 rounded transition-colors ${
                            copiedLink === link.token
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                          }`}
                          title="Copy link"
                        >
                          {copiedLink === link.token ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <a
                          href={`${window.location.origin}/share/${link.token}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                          title="Open link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>

                      <div className="flex items-center justify-between text-xs text-zinc-500">
                        <div className="flex items-center gap-4">
                          <span>Created {new Date(link.created_at).toLocaleDateString()}</span>
                          <span>{link.access_count} views</span>
                        </div>
                        {link.expires_at && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Expires {new Date(link.expires_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
