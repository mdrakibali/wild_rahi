import React, { useEffect } from 'react';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Button } from './Button';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message?: string;
  description?: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  description,
  itemName,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onClose,
}) => {
  const displayText = message || description || '';

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const icons = {
    danger: <AlertCircle className="w-5 h-5 text-foreground" />,
    warning: <AlertTriangle className="w-5 h-5 text-foreground" />,
    info: <Info className="w-5 h-5 text-foreground" />,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-obsidian/60 transition-opacity"
        onClick={() => !loading && onClose()}
      />

      {/* Modal Dialog Card (rounded-md, flat, no shadow) */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md bg-card border border-border rounded-md p-6 z-10"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary disabled:opacity-50"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-md shrink-0 flex items-center justify-center bg-secondary border border-border">
            {icons[variant]}
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <h3 className="text-lg font-serif font-bold tracking-tight text-foreground">
              {title}
            </h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              {displayText}
            </p>

            {itemName && (
              <div className="mt-3 px-3 py-1.5 bg-secondary border border-border rounded-md text-xs font-mono text-foreground break-all">
                {itemName}
              </div>
            )}
          </div>
        </div>

        {/* Buttons (rounded-md) */}
        <div className="mt-6 pt-4 border-t border-border flex items-center justify-end gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>

          <Button
            variant={variant === 'danger' ? 'destructive' : 'primary'}
            size="sm"
            loading={loading}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
