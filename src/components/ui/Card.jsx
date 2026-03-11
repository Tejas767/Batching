/**
 * Card.jsx — Atomic UI component.
 *
 * CDD Layer 1: Reusable card container with elevation and glass variants.
 * Props:
 *   variant  — "default" | "dark" | "glass"
 *   className — additional classes
 */
"use client";

import { motion } from "framer-motion";

const variants = {
  default: "bg-white border border-border shadow-card",
  dark:    "bg-gradient-to-br from-brand-1 via-[#13494b] to-brand-1 text-white border-transparent shadow-card-lg",
  glass:   "bg-white/80 border border-border backdrop-blur shadow-card",
  subtle:  "bg-surface border border-border",
};

export function Card({ children, variant = "default", className = "", animate = true, ...props }) {
  const Comp = animate ? motion.div : "div";
  const animProps = animate
    ? { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35, ease: "easeOut" } }
    : {};

  return (
    <Comp
      className={[
        "rounded-3xl p-6 md:p-8",
        variants[variant] ?? variants.default,
        className,
      ].join(" ")}
      {...animProps}
      {...props}
    >
      {children}
    </Comp>
  );
}

// Convenience: section header inside a card
export function CardHeader({ label, title, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        {label && (
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">{label}</p>
        )}
        {title && (
          <h2 className="mt-1 text-xl font-semibold text-brand-1">{title}</h2>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
