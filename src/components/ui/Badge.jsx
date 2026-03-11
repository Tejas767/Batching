/**
 * Badge.jsx — Atomic UI component.
 *
 * CDD Layer 1: Compact pill-shaped badges for status and labels.
 * Props:
 *   variant — "teal" | "gold" | "green" | "red" | "neutral"
 */
"use client";

const variants = {
  teal:    "bg-brand-1/10 text-brand-1",
  gold:    "bg-brand-2/20 text-amber-800",
  green:   "bg-green-100 text-green-800",
  red:     "bg-red-100 text-red-700",
  neutral: "bg-stone-100 text-stone-600",
};

export function Badge({ children, variant = "teal", className = "" }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-3 py-1",
        "text-xs font-semibold uppercase tracking-widest",
        variants[variant] ?? variants.neutral,
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
