/**
 * TabNav.jsx — Layout component.
 *
 * CDD Layer 2: Animated tab navigation bar.
 * On mobile: full-width scrollable strip. On desktop: flex row.
 */
"use client";

import { motion } from "framer-motion";

const TABS = ["ENTRY", "EDIT", "REPORT", "HISTORY"];

export function TabNav({ activeTab, onTabChange }) {
  return (
    <nav
      aria-label="Main navigation"
      className="mt-5 md:mt-10 -mx-4 md:mx-0 px-4 md:px-0"
    >
      {/* Scrollable strip on mobile, flex row on desktop */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 md:flex-wrap md:overflow-visible">
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
                "relative rounded-full border px-4 py-2.5 text-xs font-semibold uppercase tracking-widest whitespace-nowrap shrink-0",
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
      </div>
    </nav>
  );
}
