'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, Info, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Button } from './Button';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  itemName?: string;
  variant?: 'destructive' | 'primary' | 'warning';
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  itemName,
  variant = 'destructive',
  loading = false,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, loading, onClose]);

  const isDestructive = variant === 'destructive';

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => !loading && onClose()}
            className="fixed inset-0 bg-obsidian/70 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-md bg-card border border-border rounded-xl p-6 sm:p-7 shadow-2xl space-y-5 text-left"
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors cursor-pointer disabled:opacity-50"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              <div
                className={`w-11 h-11 rounded-full shrink-0 flex items-center justify-center ${
                  isDestructive
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-primary/10 text-primary'
                }`}
              >
                {isDestructive ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <Info className="w-5 h-5" />
                )}
              </div>

              <div className="space-y-1.5 min-w-0 pr-6">
                <h3 className="text-lg font-serif font-bold text-foreground tracking-tight leading-snug">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            {itemName && (
              <div className="bg-secondary/70 border border-border rounded-md px-3.5 py-2.5 text-xs">
                <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px] block mb-0.5">
                  Target Record:
                </span>
                <span className="font-semibold text-foreground break-all">{itemName}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={loading}
              >
                {cancelText}
              </Button>
              <Button
                type="button"
                variant={isDestructive ? 'destructive' : 'primary'}
                size="sm"
                loading={loading}
                onClick={onConfirm}
                icon={isDestructive ? <Trash2 className="w-3.5 h-3.5" /> : undefined}
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

