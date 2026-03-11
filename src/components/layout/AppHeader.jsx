/**
 * AppHeader.jsx — Layout component.
 *
 * CDD Layer 2: Top application header with brand identity.
 */
"use client";

import { motion } from "framer-motion";

export function AppHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col gap-2 md:gap-6 md:flex-row md:items-center md:justify-between"
    >
      {/* Brand */}
      <div>
        <p className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.3em] md:tracking-[0.4em] text-muted">
          Concrete Batching System
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-brand-1 md:text-4xl">
          Production Console
        </h1>
        <p className="mt-1 text-xs text-stone-500 md:text-sm md:max-w-xl hidden sm:block">
          Entry, mix design, and autographic report with live batch generation.
        </p>
      </div>
    </motion.header>
  );
}
