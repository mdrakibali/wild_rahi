import React, { useEffect } from 'react';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Button } from './Button';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
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
  itemName,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onClose,
}) => {
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
    danger: <AlertCircle className="w-6 h-6 text-foreground" />,
    warning: <AlertTriangle className="w-6 h-6 text-foreground" />,
    info: <Info className="w-6 h-6 text-foreground" />,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-obsidian/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={() => !loading && onClose()}
      />

      {/* Modal Dialog Card (rounded-2xl) */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 sm:p-7 z-10 transition-all transform animate-scale-in"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-secondary disabled:opacity-50"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center bg-secondary border border-border">
            {icons[variant]}
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <h3 className="text-xl font-serif font-bold tracking-tight text-foreground">
              {title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {message}
            </p>

            {itemName && (
              <div className="mt-3 px-3 py-2 bg-secondary border border-border rounded-xl text-xs font-mono text-foreground break-all">
                {itemName}
              </div>
            )}
          </div>
        </div>

        {/* Buttons (rounded-full) */}
        <div className="mt-6 pt-4 border-t border-border flex items-center justify-end gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>

          <Button
            variant={variant === 'danger' ? 'destructive' : 'primary'}
            size="md"
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
