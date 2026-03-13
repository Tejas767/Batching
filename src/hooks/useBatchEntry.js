/**
 * useBatchEntry.js — Purely in-memory state.
 *
 * Data is no longer mirrored to localStorage.
 * This ensures no data is left behind on the user's computer.
 */
"use client";

import { useState, useCallback } from "react";

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
  plantSN: "3851",
};

export function useBatchEntry() {
  const [entry, setEntry] = useState(defaultEntry);

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
