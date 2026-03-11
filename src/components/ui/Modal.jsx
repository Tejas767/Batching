/**
 * Modal.jsx — Atomic UI component.
 *
 * CDD Layer 1: Animated slide-in drawer modal with backdrop.
 * Uses Framer Motion AnimatePresence for enter/exit transitions.
 * Props:
 *   open      — bool
 *   onClose   — () => void
 *   title     — string
 *   subtitle  — string (optional)
 *   children  — content
 */
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export function Modal({ open, onClose, title, subtitle, children, maxWidth = "max-w-3xl" }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-end"
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

          {/* Drawer panel */}
          <motion.div
            className={`relative z-10 h-full w-full ${maxWidth} overflow-y-auto rounded-3xl bg-white p-8 shadow-[0_24px_80px_rgba(0,0,0,0.25)]`}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
          >
            {/* Header */}
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                  {subtitle}
                </p>
                <h3 className="mt-1 text-2xl font-semibold text-brand-1">{title}</h3>
              </div>
              <button
                onClick={onClose}
                className="mt-1 rounded-full border border-border p-2 text-stone-500 hover:border-brand-1 hover:text-brand-1 transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
