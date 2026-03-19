/**
 * Input.jsx — Atomic UI component.
 */
"use client";

import React, { forwardRef, useState, useRef, useEffect, useMemo, useImperativeHandle } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Input = forwardRef(({ label, id, valid = null, className = "", ...inputProps }, ref) => {
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
          ref={ref}
          id={id}
          name={inputProps.name || id}
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-stone-400"
          {...inputProps}
        />
      </div>
    </div>
  );
});

Input.displayName = "Input";

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

export const Select = forwardRef(({ label, id, options, valid = null, className = "", ...selectProps }, ref) => {
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
          ref={ref}
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
});

Select.displayName = "Select";



export const Combobox = forwardRef(({ label, id, options = [], value, onChange, placeholder, onKeyDown, valid = null, className = "" }, ref) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  
  // Expose focus() to parent via ref
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus()
  }));

  // Sync internal query with value when value changes externally
  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  const filteredOptions = useMemo(() => {
    const rawFiltered = query === "" 
      ? options 
      : options.filter((opt) => opt.toLowerCase().includes(query.toLowerCase()));
    
    // Limit to top 50 results for performance and usability
    return rawFiltered.slice(0, 50);
  }, [options, query]);

  // Reset active index when query or options change
  useEffect(() => {
    setActiveIndex(0);
  }, [filteredOptions]);

  const handleSelect = (opt) => {
    onChange?.(opt);
    setQuery(opt);
    setIsOpen(false);
    setActiveIndex(0);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown") setIsOpen(true);
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        // If dropdown is open and we have a match, handle internal selection
        if (isOpen && filteredOptions[activeIndex]) {
          e.preventDefault();
          handleSelect(filteredOptions[activeIndex]);
          // After selection, notify parent to move to next field if onKeyDown exists
          onKeyDown?.(e);
        } else {
          // Otherwise, allow external onKeyDown (like Enter-to-next-field)
          onKeyDown?.(e);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
      case "Tab":
        setIsOpen(false);
        break;
      default:
        onKeyDown?.(e); // Pass other keys (like Tab) to parent if needed
        break;
    }
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative block">
      {label && (
        <label htmlFor={id} className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted">
          {label}
        </label>
      )}
      
      <div 
        className={[
          "relative flex items-center gap-3 rounded-xl border bg-surface px-4 py-3",
          "transition-colors duration-200",
          isOpen ? "border-brand-1 ring-2 ring-brand-1/20" : "border-border",
          className,
        ].join(" ")}
      >
        <input
          ref={inputRef}
          id={id}
          type="text"
          autoComplete="off"
          placeholder={placeholder}
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            if (e.target.value === "") onChange?.("");
          }}
          onKeyDown={handleKeyDown}
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-stone-400"
        />
      </div>

      <AnimatePresence>
        {isOpen && filteredOptions.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-border bg-white p-1.5 shadow-xl shadow-brand-1/5 focus:outline-none"
          >
            {filteredOptions.map((opt, idx) => (
              <li
                key={`${opt}-${idx}`}
                onClick={() => handleSelect(opt)}
                onMouseEnter={() => setActiveIndex(idx)}
                className={[
                  "cursor-pointer select-none rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                  idx === activeIndex 
                    ? "bg-brand-1 text-white" 
                    : "text-stone-700 hover:bg-brand-1/5 hover:text-brand-1",
                  value === opt && idx !== activeIndex ? "text-brand-1" : ""
                ].join(" ")}
              >
                {opt}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
});

Combobox.displayName = "Combobox";
