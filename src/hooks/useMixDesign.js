/**
 * useMixDesign.js — Custom hook configured for local-only state (No DB).
 *
 * This version removes all database persistence to avoid networking errors.
 * Data is still saved to localStorage so it survives page refreshes.
 */
"use client";

import { useState, useCallback, useEffect } from "react";
import { initialMixDesign } from "@/constants/mixConfig";

export function useMixDesign() {
  const [mixDesign, setMixDesign] = useState(initialMixDesign);
  const [syncMessage, setSyncMessage] = useState("");

  // Load mix design from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("mixDesign");
      if (stored) {
        try { 
          setMixDesign(JSON.parse(stored)); 
        } catch (_) { /* ignore */ }
      }
    }
  }, []);

  // Save to localStorage
  const saveMixDesign = useCallback((design) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("mixDesign", JSON.stringify(design));
    }
    setSyncMessage("Saved locally");
    setTimeout(() => setSyncMessage(""), 2000);
  }, []);

  // Update a single cell in the mix design grid
  const updateCell = useCallback((grade, key, value) => {
    setMixDesign((prev) => ({
      ...prev,
      [grade]: { ...prev[grade], [key]: value === "" ? "" : Number(value) },
    }));
  }, []);

  const resetMixDesign = useCallback(() => {
    setMixDesign(initialMixDesign);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("mixDesign");
    }
    setSyncMessage("Reset to defaults");
    setTimeout(() => setSyncMessage(""), 2000);
  }, []);

  return { mixDesign, syncMessage, saveMixDesign, updateCell, resetMixDesign };
}
