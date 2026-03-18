/**
 * Input.jsx — Atomic UI component.
 *
 * CDD Layer 1: Styled input field with label, validation indicator, and focus ring.
 */
"use client";

import { ChevronDown } from "lucide-react";

export function Input({ label, id, valid = null, className = "", ...inputProps }) {
  return (
    <div className="block">
      {label && (
        <label htmlFor={id} className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted">
          {label}
        </label>
      )}
      <div
        className={[
          "flex items-center gap-3 rounded-xl border bg-surface px-4 py-3",
          "transition-colors duration-200",
          "focus-within:border-brand-1 focus-within:ring-2 focus-within:ring-brand-1/20",
          "border-border",
          className,
        ].join(" ")}
      >
        <input
          id={id}
          name={inputProps.name || id}
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-stone-400"
          {...inputProps}
        />
      </div>
    </div>
  );
}

export function DisplayField({ label, value, muted = false }) {
  return (
    <div>
      {label && (
        <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted">
          {label}
        </span>
      )}
      <div
        className={[
          "rounded-xl border border-border px-4 py-3 text-sm font-semibold",
          muted ? "bg-stone-100 text-stone-500" : "bg-surface text-foreground",
        ].join(" ")}
      >
        {value || <span className="text-stone-400">—</span>}
      </div>
    </div>
  );
}

export function Select({ label, id, options, valid = null, className = "", ...selectProps }) {
  return (
    <div className="block">
      {label && (
        <label htmlFor={id} className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted">
          {label}
        </label>
      )}
      <div
        className={[
          "relative flex items-center gap-3 rounded-xl border bg-surface px-4 py-3",
          "transition-colors duration-200",
          "focus-within:border-brand-1 focus-within:ring-2 focus-within:ring-brand-1/20",
          "border-border",
          className,
        ].join(" ")}
      >
        <select
          id={id}
          name={selectProps.name || id}
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-foreground outline-none appearance-none cursor-pointer pr-8"
          {...selectProps}
        >
          {options.map((opt, idx) => (
            <option key={`${opt}-${idx}`} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-4 flex items-center gap-2">
          <ChevronDown size={14} className="text-muted" />
        </div>
      </div>
    </div>
  );
}
