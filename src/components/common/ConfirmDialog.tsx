import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle,
  Trash2,
  Archive,
  Info,
  Shield,
  ChevronRight,
  AlertCircle,
  Ban,
  Clock,
  CheckCircle
} from 'lucide-react';

type Props = { 
  open: boolean; 
  title?: string; 
  description?: string; 
  confirmText?: string; 
  cancelText?: string; 
  onConfirm: ()=>void; 
  onCancel: ()=>void; 
  confirming?: boolean;
  // New props for dual action
  showSecondaryAction?: boolean;
  secondaryText?: string;
  onSecondaryAction?: ()=>void;
  secondaryConfirming?: boolean;
  // New props for the enhanced dialog
  clientName?: string;
  variant?: 'danger' | 'warning' | 'info';
};

export const ConfirmDialog: React.FC<Props> = ({ 
  open, 
  title='Confirm', 
  description, 
  confirmText='Confirm', 
  cancelText='Cancel', 
  onConfirm, 
  onCancel, 
  confirming,
  showSecondaryAction = false,
  secondaryText = 'Delete',
  onSecondaryAction,
  secondaryConfirming = false,
  clientName = "this client",
  variant = 'warning'
}) => {
  const [selectedAction, setSelectedAction] = useState<'deactivate' | 'delete' | null>(null);
  const [confirmDeleteText, setConfirmDeleteText] = useState('');
  const requiredText = "DELETE";

  const handleClose = () => {
    setSelectedAction(null);
    setConfirmDeleteText('');
    onCancel();
  };

  const handleDeactivate = () => {
    onConfirm();
    handleClose();
  };

  const handleDelete = () => {
    if (onSecondaryAction) {
      onSecondaryAction();
    }
    handleClose();
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
          
          {/* Header with warning gradient */}
          <div className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-amber-500/10 border-b border-zinc-800 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="text-amber-400" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Client Action Required</h2>
                  <p className="text-sm text-zinc-400 mt-1">
                    Choose how to handle <span className="text-white font-medium">"{clientName}"</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={handleClose}
                className="p-2 hover:bg-zinc-800/50 rounded-lg transition-colors"
                disabled={confirming || secondaryConfirming}
              >
                <X className="text-zinc-400 hover:text-white" size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-track-zinc-900 scrollbar-thumb-zinc-700">
            {/* Warning Message */}
            <div className="mb-6 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
              <div className="flex gap-3">
                <Info className="text-amber-400 flex-shrink-0 mt-0.5" size={18} />
                <div className="space-y-1">
                  <p className="text-sm text-zinc-300 font-medium">
                    You can deactivate to preserve data or permanently delete.
                  </p>
                  <p className="text-xs text-zinc-500">
                    {description || "This action cannot be undone. All associated data, history, and configurations will be affected."}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Options */}
            <div className="space-y-3 mb-6">
              {/* Deactivate Option */}
              <button
                onClick={() => setSelectedAction('deactivate')}
                disabled={confirming || secondaryConfirming}
                className={`w-full p-4 rounded-xl border transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedAction === 'deactivate'
                    ? 'bg-cyan-500/10 border-cyan-500/30'
                    : 'bg-zinc-900/30 border-zinc-800 hover:bg-zinc-900/50 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    selectedAction === 'deactivate'
                      ? 'bg-cyan-500/20'
                      : 'bg-zinc-800'
                  }`}>
                    <Archive className={selectedAction === 'deactivate' ? 'text-cyan-400' : 'text-zinc-400'} size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">Deactivate Client</h3>
                      <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-xs rounded-full">Recommended</span>
                    </div>
                    <p className="text-sm text-zinc-400 mt-1">
                      Temporarily disable this client. Data is preserved and can be reactivated later.
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <CheckCircle size={14} className="text-emerald-400" />
                        Reversible
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield size={14} className="text-blue-400" />
                        Data preserved
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} className="text-amber-400" />
                        Can reactivate anytime
                      </span>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAction === 'deactivate'
                      ? 'border-cyan-400 bg-cyan-400'
                      : 'border-zinc-600'
                  }`}>
                    {selectedAction === 'deactivate' && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
              </button>

              {/* Delete Option - Only show if secondary action is available */}
              {showSecondaryAction && onSecondaryAction && (
                <button
                  onClick={() => setSelectedAction('delete')}
                  disabled={confirming || secondaryConfirming}
                  className={`w-full p-4 rounded-xl border transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedAction === 'delete'
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-zinc-900/30 border-zinc-800 hover:bg-zinc-900/50 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      selectedAction === 'delete'
                        ? 'bg-red-500/20'
                        : 'bg-zinc-800'
                    }`}>
                      <Trash2 className={selectedAction === 'delete' ? 'text-red-400' : 'text-zinc-400'} size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">Delete Permanently</h3>
                        <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-xs rounded-full">Dangerous</span>
                      </div>
                      <p className="text-sm text-zinc-400 mt-1">
                        Permanently remove this client and all associated data. This cannot be undone.
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Ban size={14} className="text-red-400" />
                          Irreversible
                        </span>
                        <span className="flex items-center gap-1">
                          <AlertCircle size={14} className="text-orange-400" />
                          All data lost
                        </span>
                        <span className="flex items-center gap-1">
                          <Trash2 size={14} className="text-red-400" />
                          Immediate deletion
                        </span>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedAction === 'delete'
                        ? 'border-red-400 bg-red-400'
                        : 'border-zinc-600'
                    }`}>
                      {selectedAction === 'delete' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </button>
              )}
            </div>

            {/* Confirmation Input for Delete */}
            {selectedAction === 'delete' && (
              <div className="mb-6 p-4 bg-red-500/5 border border-red-500/20 rounded-xl opacity-0 max-h-0 animate-[slideDown_0.3s_ease-out_forwards]">
                <label className="block text-sm font-medium text-red-400 mb-2">
                  Type "DELETE" to confirm permanent deletion
                </label>
                <input
                  type="text"
                  value={confirmDeleteText}
                  onChange={(e) => setConfirmDeleteText(e.target.value.toUpperCase())}
                  placeholder="Type DELETE here"
                  disabled={confirming || secondaryConfirming}
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-red-500/30 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-red-500/50 transition-all disabled:opacity-50"
                />
              </div>
            )}

            {/* What will happen section */}
            <details className="group">
              <summary className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors">
                <ChevronRight className="group-open:rotate-90 transition-transform" size={16} />
                What will happen to my data?
              </summary>
              <div className="mt-3 pl-6 space-y-2 text-sm text-zinc-400">
                {selectedAction === 'deactivate' ? (
                  <>
                    <p>• Client will be marked as inactive</p>
                    <p>• All data and history will be preserved</p>
                    <p>• You can reactivate at any time</p>
                    <p>• No billing will occur while deactivated</p>
                  </>
                ) : selectedAction === 'delete' ? (
                  <>
                    <p>• All client data will be permanently deleted</p>
                    <p>• Projects and tasks will be removed</p>
                    <p>• Time entries and invoices will be deleted</p>
                    <p>• This action cannot be reversed</p>
                  </>
                ) : (
                  <p>Select an action to see what will happen</p>
                )}
              </div>
            </details>
          </div>

          {/* Footer */}
          <div className="border-t border-zinc-800 p-6 bg-zinc-900/30 flex-shrink-0">
            <div className="flex items-center justify-between">
              <button 
                onClick={handleClose}
                disabled={confirming || secondaryConfirming}
                className="px-5 py-2.5 text-zinc-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
              
              <div className="flex items-center gap-3">
                {selectedAction === 'deactivate' && (
                  <button 
                    onClick={handleDeactivate}
                    disabled={confirming || secondaryConfirming}
                    className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium rounded-xl transition-all flex items-center gap-2 disabled:cursor-not-allowed"
                  >
                    <Archive size={18} />
                    {confirming ? 'Working…' : confirmText}
                  </button>
                )}
                
                {selectedAction === 'delete' && showSecondaryAction && onSecondaryAction && (
                  <button 
                    disabled={confirmDeleteText !== requiredText || confirming || secondaryConfirming}
                    onClick={handleDelete}
                    className="px-6 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium rounded-xl transition-all flex items-center gap-2 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={18} />
                    {secondaryConfirming ? 'Deleting…' : secondaryText}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
