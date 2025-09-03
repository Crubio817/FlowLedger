import React from 'react';
import { Dialog } from '../../ui/dialog.tsx';
import { Button } from '../../ui/button.tsx';

type Props = { open: boolean; title?: string; description?: string; confirmText?: string; cancelText?: string; onConfirm: ()=>void; onCancel: ()=>void; confirming?: boolean };
export const ConfirmDialog: React.FC<Props> = ({ open, title='Confirm', description, confirmText='Confirm', cancelText='Cancel', onConfirm, onCancel, confirming }) => (
  <Dialog open onOpenChange={(o)=>{ if(!o) onCancel(); }}>
    <div className="p-4 w-full max-w-md">
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="mt-2 text-sm text-[var(--text-2)]">{description}</p>}
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={confirming}>{cancelText}</Button>
        <Button variant="primary" onClick={onConfirm} disabled={confirming}>{confirming ? 'Working…' : confirmText}</Button>
      </div>
    </div>
  </Dialog>
);
