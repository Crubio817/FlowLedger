import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '../ui/badge.tsx';
import { Button } from '../ui/button.tsx';
import { 
  Brain, 
  Clock, 
  AlertTriangle, 
  Plus,
  ChevronDown,
  ChevronUp,
  User,
  FileText,
  Lightbulb,
  Shield
} from 'lucide-react';
import { getMemoryCard, createMemoryAtom } from '../services/workstream.api.ts';
import type { MemoryCard as MemoryCardType, MemoryAtom } from '../services/workstream.types.ts';
import { toast } from 'react-hot-toast';

interface MemoryCardProps {
  entityType: string;
  entityId: number;
  variant?: 'full' | 'compact' | 'drawer';
  className?: string;
}

const ATOM_TYPE_ICONS = {
  note: FileText,
  risk: AlertTriangle,
  preference: Lightbulb,
  decision: Shield,
  status: Brain
} as const;

const ATOM_TYPE_COLORS = {
  note: 'text-blue-600 bg-blue-50 border-blue-200',
  risk: 'text-red-600 bg-red-50 border-red-200',
  preference: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  decision: 'text-green-600 bg-green-50 border-green-200',
  status: 'text-purple-600 bg-purple-50 border-purple-200'
} as const;

export function MemoryCard({ 
  entityType, 
  entityId, 
  variant = 'full',
  className = ''
}: MemoryCardProps) {
  const [showTimeline, setShowTimeline] = useState(false);
  const [newAtomContent, setNewAtomContent] = useState('');
  const [newAtomType, setNewAtomType] = useState<MemoryAtom['atom_type']>('note');
  const [showAddForm, setShowAddForm] = useState(false);

  const queryClient = useQueryClient();

  const { 
    data: memoryCard, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['memory-card', entityType, entityId],
    queryFn: () => getMemoryCard(entityType, entityId),
    staleTime: 30 * 1000, // 30 seconds
    retry: 2
  });

  const createAtomMutation = useMutation({
    mutationFn: (payload: {
      entity_type: string;
      entity_id: number;
      atom_type: MemoryAtom['atom_type'];
      content: string;
      tags?: string[];
    }) => createMemoryAtom(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory-card', entityType, entityId] });
      setNewAtomContent('');
      setShowAddForm(false);
      toast.success('Context added successfully');
    },
    onError: () => {
      toast.error('Failed to add context');
    }
  });

  const handleAddAtom = () => {
    if (!newAtomContent.trim()) return;

    createAtomMutation.mutate({
      entity_type: entityType,
      entity_id: entityId,
      atom_type: newAtomType,
      content: newAtomContent.trim()
    });
  };

  if (isLoading) {
    return (
      <div className={`border rounded-lg p-4 animate-pulse bg-card ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-4 w-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded w-24"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded"></div>
          <div className="h-3 bg-muted rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error || !memoryCard) {
    return (
      <div className={`border border-gray-200 rounded-lg p-4 bg-card ${className}`}>
        <div className="flex items-center gap-2 text-gray-500">
          <Brain className="h-4 w-4" />
          <span className="text-sm">No context available</span>
        </div>
      </div>
    );
  }

  const { top_atoms, summary, last_built_at } = memoryCard;
  const atoms = top_atoms || [];
  const recentAtoms = atoms.slice(0, variant === 'compact' ? 2 : 5);

  // Group atoms by type for insights
  const atomsByType = atoms.reduce((acc: Record<string, number>, atom: MemoryAtom) => {
    acc[atom.atom_type] = (acc[atom.atom_type] || 0) + 1;
    return acc;
  }, {});

  const risks = atoms.filter((atom: MemoryAtom) => atom.atom_type === 'risk');
  const preferences = atoms.filter((atom: MemoryAtom) => atom.atom_type === 'preference');
  const recentDecisions = atoms.filter((atom: MemoryAtom) => atom.atom_type === 'decision').slice(0, 2);

  if (variant === 'compact') {
    return (
      <div className={`border rounded-lg p-3 bg-card ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">Context</span>
          </div>
          {atoms && atoms.length > 0 && (
            <Badge variant="muted" className="text-xs">
              {atoms.length}
            </Badge>
          )}
        </div>
        
        {recentAtoms.length > 0 ? (
          <div className="space-y-1">
            {recentAtoms.map((atom, index) => {
              const Icon = ATOM_TYPE_ICONS[atom.atom_type] || FileText;
              return (
                <div key={index} className="flex items-start gap-2 text-xs">
                  <Icon className="h-3 w-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground line-clamp-1">
                    {atom.content}
                  </span>
                </div>
              );
            })}
            {atoms && atoms.length > 2 && (
              <div className="text-xs text-muted-foreground text-center pt-1">
                +{atoms.length - 2} more
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">No context yet</div>
        )}
      </div>
    );
  }

  return (
    <div className={`border rounded-lg bg-card ${className}`}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <h3 className="font-medium">Context Memory</h3>
          </div>
          <div className="flex items-center gap-2">
            {atoms && atoms.length > 0 && (
              <Badge variant="muted" className="text-xs">
                {atoms.length} items
              </Badge>
            )}
            {last_built_at && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {new Date(last_built_at).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Key Insights */}
        {(risks.length > 0 || preferences.length > 0 || recentDecisions.length > 0) && (
          <div className="space-y-3">
            {/* Risks */}
            {risks.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Key Risks ({risks.length})
                </h4>
                <div className="space-y-1">
                  {risks.slice(0, 2).map((risk, index) => (
                    <div key={index} className="text-sm text-red-600 bg-red-50 rounded px-2 py-1 border border-red-200">
                      • {risk.content}
                    </div>
                  ))}
                  {risks.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{risks.length - 2} more risks
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Preferences */}
            {preferences.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-yellow-700 mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Preferences ({preferences.length})
                </h4>
                <div className="space-y-1">
                  {preferences.slice(0, 2).map((pref, index) => (
                    <div key={index} className="text-sm text-yellow-600 bg-yellow-50 rounded px-2 py-1 border border-yellow-200">
                      • {pref.content}
                    </div>
                  ))}
                  {preferences.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{preferences.length - 2} more preferences
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent Decisions */}
            {recentDecisions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Recent Decisions
                </h4>
                <div className="space-y-1">
                  {recentDecisions.map((decision, index) => (
                    <div key={index} className="text-sm text-green-600 bg-green-50 rounded px-2 py-1 border border-green-200">
                      📝 {decision.content}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Timeline Toggle */}
        {atoms && atoms.length > 0 && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTimeline(!showTimeline)}
              className="flex items-center gap-2"
            >
              {showTimeline ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showTimeline ? 'Hide' : 'Show'} Timeline ({atoms.length})
            </Button>

            {showTimeline && (
              <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                {atoms.map((atom, index) => {
                  const Icon = ATOM_TYPE_ICONS[atom.atom_type] || FileText;
                  const colorClass = ATOM_TYPE_COLORS[atom.atom_type] || ATOM_TYPE_COLORS.note;
                  
                  return (
                    <div key={index} className={`border rounded p-2 text-sm ${colorClass}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-3 w-3" />
                        <span className="text-xs font-medium capitalize">{atom.atom_type}</span>
                        {atom.occurred_at && (
                          <span className="text-xs opacity-75">
                            {new Date(atom.occurred_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div>{atom.content}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Add Context Form */}
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2"
          >
            <Plus className="h-3 w-3" />
            Add Context
          </Button>

          {showAddForm && (
            <div className="mt-3 space-y-3 border rounded p-3 bg-muted/30">
              <div className="flex gap-2">
                {(['note', 'risk', 'preference', 'decision'] as const).map((type) => (
                  <Button
                    key={type}
                    variant={newAtomType === type ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setNewAtomType(type)}
                    className="text-xs capitalize"
                  >
                    {type}
                  </Button>
                ))}
              </div>
              
              <textarea
                value={newAtomContent}
                onChange={(e) => setNewAtomContent(e.target.value)}
                placeholder={`Add a ${newAtomType}...`}
                className="w-full text-sm border rounded p-2 bg-background"
                rows={2}
              />
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAddAtom}
                  disabled={!newAtomContent.trim() || createAtomMutation.isPending}
                >
                  {createAtomMutation.isPending ? 'Adding...' : 'Add'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {(!atoms || atoms.length === 0) && (
          <div className="text-center py-4 text-muted-foreground">
            <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No context captured yet</p>
            <p className="text-xs">Add notes, risks, or preferences to build context</p>
          </div>
        )}
      </div>
    </div>
  );
}
