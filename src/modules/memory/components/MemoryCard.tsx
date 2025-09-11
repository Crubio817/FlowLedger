/**
 * Core Memory Card Component
 * Reusable component that any module can integrate
 */

import React, { useState } from 'react';
import { 
  Brain, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Tag,
  AlertTriangle,
  Shield,
  Heart,
  BarChart3,
  FileText,
  Milestone,
  Eye,
  EyeOff,
  MoreHorizontal
} from 'lucide-react';
import { useMemoryCard, useMemoryCapture } from '../hooks/useMemory.ts';
import { MemoryAtom } from '../services/memory.types.ts';

interface MemoryCardProps {
  entityType: 'pursuit' | 'candidate' | 'engagement' | 'comms_thread';
  entityId: number;
  orgId?: number;
  className?: string;
  compact?: boolean;
  expandable?: boolean;
  showTimeline?: boolean;
  maxAtoms?: number;
  onAddNote?: (content: string) => void;
}

// Memory atom type icons and styling
const atomTypeConfig = {
  decision: { 
    icon: BarChart3, 
    color: 'text-blue-400', 
    bg: 'bg-blue-500/10', 
    border: 'border-blue-500/30',
    label: 'Decision'
  },
  risk: { 
    icon: AlertTriangle, 
    color: 'text-red-400', 
    bg: 'bg-red-500/10', 
    border: 'border-red-500/30',
    label: 'Risk'
  },
  preference: { 
    icon: Heart, 
    color: 'text-emerald-400', 
    bg: 'bg-emerald-500/10', 
    border: 'border-emerald-500/30',
    label: 'Preference'
  },
  status: { 
    icon: BarChart3, 
    color: 'text-zinc-400', 
    bg: 'bg-zinc-500/10', 
    border: 'border-zinc-500/30',
    label: 'Status'
  },
  note: { 
    icon: FileText, 
    color: 'text-purple-400', 
    bg: 'bg-purple-500/10', 
    border: 'border-purple-500/30',
    label: 'Note'
  },
  milestone: { 
    icon: Milestone, 
    color: 'text-amber-400', 
    bg: 'bg-amber-500/10', 
    border: 'border-amber-500/30',
    label: 'Milestone'
  }
};

const MemoryAtomComponent: React.FC<{ atom: MemoryAtom; compact?: boolean }> = ({ 
  atom, 
  compact = false 
}) => {
  const config = atomTypeConfig[atom.atom_type] || atomTypeConfig.note;
  const IconComponent = config.icon;
  
  return (
    <div className={`
      p-3 rounded-lg border ${config.bg} ${config.border} 
      ${compact ? 'mb-2' : 'mb-3'} transition-all hover:shadow-sm
    `}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 p-1.5 rounded ${config.bg}`}>
          <IconComponent className={`w-4 h-4 ${config.color}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium ${config.color}`}>
              {config.label}
            </span>
            <span className="text-xs text-zinc-500">
              {new Date(atom.occurred_at).toLocaleDateString()}
            </span>
            {atom.score && (
              <span className="text-xs text-zinc-500">
                Score: {atom.score}
              </span>
            )}
          </div>
          
          <p className={`text-sm text-zinc-300 ${compact ? 'line-clamp-2' : ''}`}>
            {atom.content}
          </p>
          
          {atom.tags && atom.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {atom.tags.map((tag, idx) => (
                <span 
                  key={idx}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-zinc-700 text-zinc-300 rounded"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {!compact && atom.source && (
            <div className="text-xs text-zinc-500 mt-1">
              Source: {atom.source.system}
              {atom.source_url && (
                <a 
                  href={atom.source_url} 
                  className="ml-1 text-purple-400 hover:text-purple-300"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  View
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MemoryCard: React.FC<MemoryCardProps> = ({
  entityType,
  entityId,
  orgId = 1,
  className = '',
  compact = false,
  expandable = false,
  showTimeline = false,
  maxAtoms = compact ? 3 : 10,
  onAddNote
}) => {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [showingAll, setShowingAll] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);
  
  const { data: memoryCard, isLoading, error } = useMemoryCard(entityType, entityId, orgId);
  const { captureMemory, isLoading: isCapturing } = useMemoryCapture(orgId);
  
  if (isLoading) {
    return (
      <div className={`panel bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-5 h-5 text-purple-400 animate-pulse" />
          <div className="h-4 bg-zinc-700 rounded w-32 animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-16 bg-zinc-800 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`panel bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 ${className}`}>
        <div className="flex items-center gap-3 text-red-400">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm">Failed to load memory</span>
        </div>
      </div>
    );
  }
  
  const atoms = memoryCard?.top_atoms || [];
  const displayAtoms = showingAll ? atoms : atoms.slice(0, maxAtoms);
  const hasMore = atoms.length > maxAtoms;
  
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      if (onAddNote) {
        onAddNote(newNote);
      } else {
        await captureMemory(entityType, entityId, newNote, 'note');
      }
      setNewNote('');
      setShowAddNote(false);
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  };
  
  return (
    <div className={`panel bg-zinc-900/50 border border-zinc-800 rounded-xl ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-purple-400" />
            <h3 className="text-white font-semibold">
              {compact ? 'Memory' : 'Institutional Memory'}
            </h3>
            {atoms.length > 0 && (
              <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full">
                {atoms.length}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {expandable && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 hover:bg-zinc-700 rounded transition-colors"
              >
                {isExpanded ? <EyeOff className="w-4 h-4 text-zinc-400" /> : <Eye className="w-4 h-4 text-zinc-400" />}
              </button>
            )}
            
            <button
              onClick={() => setShowAddNote(!showAddNote)}
              className="p-1.5 hover:bg-zinc-700 rounded transition-colors"
              title="Add note"
            >
              <Plus className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
        </div>
        
        {memoryCard?.last_built_at && (
          <div className="flex items-center gap-1 mt-2 text-xs text-zinc-500">
            <Clock className="w-3 h-3" />
            Last updated {new Date(memoryCard.last_built_at).toLocaleDateString()}
          </div>
        )}
      </div>
      
      {/* Content */}
      {isExpanded && (
        <div className="p-6">
          {/* Add note input */}
          {showAddNote && (
            <div className="mb-4 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Capture a memory about this entity..."
                className="w-full bg-transparent text-white placeholder-zinc-400 resize-none focus:outline-none"
                rows={2}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setShowAddNote(false)}
                  className="px-3 py-1 text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || isCapturing}
                  className="px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCapturing ? 'Adding...' : 'Add Note'}
                </button>
              </div>
            </div>
          )}
          
          {/* Memory atoms */}
          {atoms.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm mb-2">No memories captured yet</p>
              <p className="text-zinc-500 text-xs">
                Start building institutional knowledge by adding notes and insights
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                {displayAtoms.map((atom: MemoryAtom) => (
                  <MemoryAtomComponent 
                    key={atom.atom_id || `${atom.atom_type}-${atom.occurred_at}`}
                    atom={atom} 
                    compact={compact} 
                  />
                ))}
              </div>
              
              {hasMore && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => setShowingAll(!showingAll)}
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    {showingAll ? 'Show less' : `Show ${atoms.length - maxAtoms} more`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MemoryCard;
