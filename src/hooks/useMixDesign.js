/**
 * useMixDesign.js — Purely in-memory state.
 *
 * Data is no longer mirrored to localStorage.
 * Everything resets to defaults on refresh until we connect to MongoDB.
 */
"use client";

import { useState, useCallback } from "react";
import { initialMixDesign } from "@/constants/mixConfig";

export function useMixDesign() {
  const [mixDesign, setMixDesign] = useState(initialMixDesign);
  const [syncMessage, setSyncMessage] = useState("");

  // Save - temporarily showing a message
  const saveMixDesign = useCallback((design) => {
    setSyncMessage("Saved to memory");
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
    setSyncMessage("Reset to defaults");
    setTimeout(() => setSyncMessage(""), 2000);
  }, []);

  return { 
    mixDesign, 
    syncMessage, 
    loadMixDesign: () => {}, 
    saveMixDesign, 
    updateCell, 
    resetMixDesign 
  };
}
