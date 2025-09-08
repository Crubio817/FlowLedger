import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button.tsx';
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter } from '../ui/dialog.tsx';
import { listTaskPacksDetailed, seedTasksFromPack, type TaskPackDetailed } from '../services/api.ts';
import { toast } from '../lib/toast.ts';
import { Package, Search } from 'lucide-react';

interface SeedTaskPackModalProps {
  open: boolean;
  clientId: number;
  onClose: () => void;
  onSuccess: (insertedCount: number) => void;
}

export function SeedTaskPackModal({ open, clientId, onClose, onSuccess }: SeedTaskPackModalProps) {
  const [packs, setPacks] = useState<TaskPackDetailed[]>([]);
  const [selectedPackCode, setSelectedPackCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPacks, setLoadingPacks] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadTaskPacks = async () => {
    try {
      setLoadingPacks(true);
      const response = await listTaskPacksDetailed(
        'any', // status_scope
        searchQuery || undefined,
        false, // includeInactive
        1,
        50
      );
      setPacks(response.data || []);
    } catch (error) {
      console.error('Failed to load task packs:', error);
      toast.error('Failed to load task packs');
    } finally {
      setLoadingPacks(false);
    }
  };

  const handleSeed = async () => {
    if (!selectedPackCode) return;

    try {
      setLoading(true);
      const result = await seedTasksFromPack(clientId, selectedPackCode);
      onSuccess(result.inserted);
    } catch (error) {
      console.error('Failed to seed tasks:', error);
      toast.error('Failed to seed tasks from pack');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadTaskPacks();
      setSelectedPackCode('');
    }
  }, [open, searchQuery]);

  const filteredPacks = packs.filter(pack => 
    pack.pack_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pack.pack_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (pack.description && pack.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader title="Seed Tasks from Pack" />
        
        <DialogBody className="px-6">
          <div className="space-y-4">
            <p className="text-zinc-400 text-sm">
              Select a task pack to automatically create onboarding tasks for this client. 
              Duplicate task names will be skipped.
            </p>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={16} />
              <input
                type="text"
                placeholder="Search task packs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-10 py-2 rounded-lg focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Pack Selection */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {loadingPacks ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2 text-zinc-400">Loading task packs...</span>
                </div>
              ) : filteredPacks.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-zinc-400 mb-2">No task packs found</h3>
                  <p className="text-zinc-500">
                    {searchQuery ? 'Try adjusting your search terms' : 'No task packs are available'}
                  </p>
                </div>
              ) : (
                filteredPacks.map((pack) => (
                  <label
                    key={pack.pack_id}
                    className={`block p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedPackCode === pack.pack_code
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="taskPack"
                        value={pack.pack_code}
                        checked={selectedPackCode === pack.pack_code}
                        onChange={(e) => setSelectedPackCode(e.target.value)}
                        className="mt-1"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-white">{pack.pack_name}</h4>
                          <code className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded">
                            {pack.pack_code}
                          </code>
                          {pack.status_scope && (
                            <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-1 rounded">
                              {pack.status_scope}
                            </span>
                          )}
                        </div>
                        
                        {pack.description && (
                          <p className="text-sm text-zinc-400">{pack.description}</p>
                        )}
                        
                        <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                          {pack.effective_from_utc && (
                            <span>From: {new Date(pack.effective_from_utc).toLocaleDateString()}</span>
                          )}
                          {pack.effective_to_utc && (
                            <span>To: {new Date(pack.effective_to_utc).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        </DialogBody>

        <DialogFooter className="flex gap-3 justify-end px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="primary" 
            onClick={handleSeed}
            loading={loading} 
            disabled={!selectedPackCode}
          >
            Seed Tasks
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
