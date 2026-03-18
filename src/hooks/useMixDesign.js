import { useState, useCallback, useEffect } from "react";
import { initialMixDesign, MIXER_CAPACITY, defaultDifferences } from "@/constants/mixConfig";

export function useMixDesign() {
  const [mixDesign, setMixDesign] = useState(initialMixDesign);
  const [batchSize, setBatchSize] = useState(MIXER_CAPACITY);
  const [differences, setDifferences] = useState(defaultDifferences);
  const [syncMessage, setSyncMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Load from MongoDB
  const loadMixDesign = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mix-design");
      const data = await res.json();
      if (data.data) {
        if (data.data.grades) {
          setMixDesign(data.data.grades);
          setBatchSize(data.data.batchSize ?? MIXER_CAPACITY);
          setDifferences(data.data.differences ?? defaultDifferences);
        } else {
          setMixDesign(data.data);
          setBatchSize(MIXER_CAPACITY);
          setDifferences(defaultDifferences);
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
  const saveMixDesign = useCallback(async (grades, size, diffs) => {
    setSyncMessage("Saving...");
    try {
      const res = await fetch("/api/mix-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ design: { grades, batchSize: size, differences: diffs } }),
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

  // Auto-save logic (Debounced 3s) — only fires after user stops editing
  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      saveMixDesign(mixDesign, batchSize, differences);
    }, 3000);
    return () => clearTimeout(timer);
  }, [mixDesign, batchSize, differences, loading, saveMixDesign]);

  // Update a single cell in the mix design grid
  const updateCell = useCallback((grade, key, value) => {
    setMixDesign((prev) => ({
      ...prev,
      [grade]: { ...prev[grade], [key]: value === "" ? "" : Number(value) },
    }));
  }, []);

  // Update a single difference value
  const updateDifference = useCallback((key, value) => {
    setDifferences((prev) => ({
      ...prev,
      [key]: value === "" ? 0 : Number(value),
    }));
  }, []);

  const resetMixDesign = useCallback(() => {
    if (confirm("Reset ALL mix designs, batch size, and differences to factory defaults?")) {
      setMixDesign(initialMixDesign);
      setBatchSize(MIXER_CAPACITY);
      setDifferences(defaultDifferences);
      saveMixDesign(initialMixDesign, MIXER_CAPACITY, defaultDifferences);
      setSyncMessage("Reset to defaults");
      setTimeout(() => setSyncMessage(""), 2000);
    }
  }, [saveMixDesign]);

  return {
    mixDesign,
    batchSize, setBatchSize,
    differences, updateDifference,
    syncMessage,
    loading,
    loadMixDesign,
    saveMixDesign,
    updateCell,
    resetMixDesign,
  };
}

