/**
 * TabNav.jsx — Layout component.
 *
 * CDD Layer 2: Animated tab navigation bar.
 * The active tab gets a sliding underline via Framer Motion layoutId.
 */
"use client";

import { motion } from "framer-motion";

const TABS = ["ENTRY", "EDIT", "REPORT", "HISTORY"];

export function TabNav({ activeTab, onTabChange }) {
  return (
    <nav
      aria-label="Main navigation"
      className="mt-10 flex flex-wrap gap-2"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <motion.button
            key={tab}
            onClick={() => onTabChange(tab)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            aria-current={isActive ? "page" : undefined}
            className={[
              "relative rounded-full border px-5 py-2.5 text-xs font-semibold uppercase tracking-widest",
              "transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-1/40",
              isActive
                ? "border-brand-1 bg-brand-1 text-white"
                : "border-border bg-white text-stone-600 hover:border-brand-1 hover:text-brand-1",
            ].join(" ")}
          >
            {tab}
            {isActive && (
              <motion.span
                layoutId="tab-indicator"
                className="absolute inset-0 rounded-full bg-brand-1"
                style={{ zIndex: -1 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </nav>
  );
}
