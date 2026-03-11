/**
 * ConfirmDialog.jsx — Atomic UI component.
 *
 * CDD Layer 1: Animated modal dialog for action confirmations.
 */
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText = "Confirm", variant = "danger" }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog block */}
          <motion.div
            className="relative z-10 w-full max-w-md rounded-3xl bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <h3 className="mb-2 text-xl font-semibold text-brand-1">{title}</h3>
            <p className="mb-6 text-sm text-stone-500">{message}</p>

            <div className="flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={onClose} className="border border-border text-stone-500 hover:bg-stone-50 transition-colors">
                Cancel
              </Button>
              <Button
                variant={variant}
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
