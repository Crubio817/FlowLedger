import React from 'react';
import Modal from './Modal.tsx';

type Size = 'sm' | 'md' | 'lg' | 'xl';

type Props = {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onPrimary: () => void | Promise<void>;
  primaryLabel?: string;
  cancelLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  size?: Size;
};

const sizeToClass: Record<Size, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export default function FormModal({
  title,
  children,
  onClose,
  onPrimary,
  primaryLabel = 'Save',
  cancelLabel = 'Cancel',
  disabled = false,
  loading = false,
  size = 'lg',
}: Props) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      className={`w-full ${sizeToClass[size]}`}
      footer={(
        <div className="flex items-center justify-between gap-3">
          <div>
            <button className="btn-cancel" onClick={onClose} disabled={loading}>{cancelLabel}</button>
          </div>
          <div>
            <button className="btn-create" onClick={onPrimary} disabled={loading || disabled}>
              {loading ? 'Saving…' : primaryLabel}
            </button>
          </div>
        </div>
      )}
    >
      {children}
    </Modal>
  );
}

