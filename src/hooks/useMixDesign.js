"use client";

import { useState, useCallback, useEffect } from "react";
import { initialMixDesign, initialDifferences, DEFAULT_BATCH_SIZE } from "@/constants/mixConfig";

const initialState = {
  grades: initialMixDesign,
  batchSize: DEFAULT_BATCH_SIZE,
  differences: initialDifferences
};

export function useMixDesign() {
  const [data, setData] = useState(initialState);
  const [syncMessage, setSyncMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Load from MongoDB
  const loadMixDesign = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mix-design");
      const json = await res.json();
      if (json.data) {
        // Migration: If data.data is the old grades-only format, wrap it
        if (!json.data.grades && !json.data.differences) {
          setData(prev => ({ ...prev, grades: json.data }));
        } else {
          setData(json.data);
        }
      }
    } catch (err) {
      console.error("loadMixDesign error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMixDesign();
  }, [loadMixDesign]);

  // Save to MongoDB
  const saveMixDesign = useCallback(async (payload) => {
    setSyncMessage("Saving...");
    try {
      const res = await fetch("/api/mix-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ design: payload }),
      });
      if (res.ok) {
        setSyncMessage("Saved to Cloud ✅");
      } else {
        setSyncMessage("Save failed ❌");
      }
    } catch (err) {
      console.error("saveMixDesign error:", err);
      setSyncMessage("Error saving ❌");
    } finally {
      setTimeout(() => setSyncMessage(""), 3000);
    }
  }, []);

  // Auto-save logic (Debounced)
  useEffect(() => {
    if (loading) return; 
    
    const timer = setTimeout(() => {
      saveMixDesign(data);
    }, 1000);

    return () => clearTimeout(timer);
  }, [data, loading, saveMixDesign]);

  // Update a single cell in the mix design grid
  const updateCell = useCallback((grade, key, value) => {
    setData((prev) => ({
      ...prev,
      grades: {
        ...prev.grades,
        [grade]: { ...prev.grades[grade], [key]: value === "" ? "" : Number(value) }
      }
    }));
  }, []);

  const updateDifference = useCallback((key, value) => {
    setData((prev) => ({
      ...prev,
      differences: { 
        ...prev.differences, 
        [key]: value === "" ? "" : Number(value) 
      }
    }));
  }, []);

  const updateBatchSize = useCallback((value) => {
    setData((prev) => ({
      ...prev,
      batchSize: value === "" ? "" : Number(value)
    }));
  }, []);

  const resetMixDesign = useCallback(() => {
    if (confirm("Reset ALL mix designs to factory defaults?")) {
      setData(initialState);
      saveMixDesign(initialState);
      setSyncMessage("Reset to defaults");
      setTimeout(() => setSyncMessage(""), 2000);
    }
  }, [saveMixDesign]);

  return { 
    mixDesign: data.grades, // Keep alias for backward compatibility in Home
    batchSize: data.batchSize,
    differences: data.differences,
    syncMessage, 
    loading,
    loadMixDesign, 
    saveMixDesign, 
    updateCell, 
    updateDifference,
    updateBatchSize,
    resetMixDesign 
  };
}

