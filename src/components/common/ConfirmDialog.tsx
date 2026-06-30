"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  /** Tailwind classes for the confirm button */
  confirmClassName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  confirmClassName = "bg-gold text-midnight hover:bg-gold-light",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="cd-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={onCancel}
          />
          <motion.div
            key="cd-panel"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0, 1] }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-sm bg-card border border-border rounded-sm shadow-2xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <span className="text-amber-400 shrink-0 mt-0.5">
                    <AlertTriangle size={20} />
                  </span>
                  <div>
                    <h3 className="font-heading text-lg text-foreground mb-1">{title}</h3>
                    <p className="text-muted-foreground text-sm font-body leading-relaxed">{message}</p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={onCancel}
                    className="text-muted-foreground hover:text-foreground text-xs font-body tracking-[0.15em] uppercase px-4 py-2 border border-border hover:border-border/80 transition-colors"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={() => { onConfirm(); onCancel(); }}
                    className={`text-xs font-body font-semibold tracking-[0.15em] uppercase px-5 py-2 transition-colors ${confirmClassName}`}
                  >
                    {confirmLabel}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
