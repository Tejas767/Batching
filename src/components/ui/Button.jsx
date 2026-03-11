/**
 * Button.jsx — Atomic UI component.
 *
 * CDD Layer 1: Reusable button with variants, sizes, and Framer Motion tap.
 * Props:
 *   variant  — "primary" | "secondary" | "danger" | "ghost" | "gold"
 *   size     — "sm" | "md" | "lg"
 *   icon     — React element to prepend
 *   loading  — bool, shows spinner and disables
 *   className — additional classes
 */
"use client";

import { motion } from "framer-motion";

const variants = {
  primary:   "bg-brand-1 text-white border-brand-1 hover:bg-brand-1/90",
  secondary: "bg-white text-brand-1 border-border hover:border-brand-1",
  danger:    "bg-red-600 text-white border-red-600 hover:bg-red-700",
  ghost:     "bg-transparent text-stone-600 border-border hover:bg-stone-100",
  gold:      "bg-brand-2 text-amber-900 border-brand-2 hover:bg-brand-2/90 shadow-lg",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs tracking-widest",
  md: "px-5 py-2.5 text-xs tracking-widest",
  lg: "px-7 py-3 text-sm tracking-widest",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  className = "",
  ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      disabled={loading || props.disabled}
      className={[
        "inline-flex items-center gap-2 rounded-full border font-semibold uppercase",
        "transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.md,
        className,
      ].join(" ")}
      {...props}
    >
      {loading ? (
        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  );
}
