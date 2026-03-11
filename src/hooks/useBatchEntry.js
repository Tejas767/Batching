/**
 * useBatchEntry.js — Custom hook configured for local-only state (No DB).
 *
 * This version removes all database persistence to avoid networking errors.
 * Data is still mirrored to localStorage so it survives page refreshes.
 */
"use client";

import { useState, useEffect, useCallback } from "react";

const defaultEntry = {
  docketNo: "",
  customerName: "",
  site: "",
  grade: "M15",
  qty: "",
  truckDriver: "",
  truckNumber: "",
  batchStart: "",
  batchStop: "",
};

export function useBatchEntry() {
  const [entry, setEntry] = useState(defaultEntry);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem("entryData");
    if (stored) {
      try { 
        setEntry(JSON.parse(stored)); 
      } catch (_) { /* ignore */ }
    }
  }, []);

  // Mirror to localStorage whenever entry changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("entryData", JSON.stringify(entry));
  }, [entry]);

  // Update a single field
  const updateField = useCallback((key, value) => {
    setEntry((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Record batch start time
  const handleStart = useCallback(() => {
    const time = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
    });
    setEntry((prev) => ({ ...prev, batchStart: time, batchStop: time }));
  }, []);

  // Record batch stop time
  const handleStop = useCallback(() => {
    const time = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
    });
    setEntry((prev) => ({ ...prev, batchStop: time }));
  }, []);

  // Increment docket number after successful print/save
  const incrementDocketNo = useCallback(() => {
    setEntry((prev) => {
      const current = parseInt(prev.docketNo, 10);
      if (isNaN(current)) return prev;
      return { ...prev, docketNo: (current + 1).toString() };
    });
  }, []);

  return { entry, updateField, handleStart, handleStop, incrementDocketNo };
}
