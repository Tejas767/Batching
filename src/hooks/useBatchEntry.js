"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "shreehari_latest_entry";

const defaultEntry = {
  docketNo: "",
  customerName: "",
  site: "",
  grade: "",
  qty: "",
  truckDriver: "",
  truckNumber: "",
  batchStart: "",
  batchStop: "",
  plantSN: "",
  companyName: "",
  orderNo: "",
};

export function useBatchEntry(user = null) {
  // Use lazy initializer to load from localStorage immediately — no effect needed.
  const [entry, setEntry] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return { ...defaultEntry, ...JSON.parse(saved) };
        } catch { /* ignore malformed JSON */ }
      }
    }
    return defaultEntry;
  });
  const [isLoaded, setIsLoaded] = useState(typeof window !== "undefined");
  const [hasMergedCloud, setHasMergedCloud] = useState(false);
  
  // Track previous values to avoid saving if nothing changed
  const lastSavedCloudSN = useRef("");
  const lastSavedCloudCompany = useRef("");



  // 2. Initial Sync (Cloud Settings Overwrite Local)
  useEffect(() => {
    if (isLoaded && user && !hasMergedCloud) {
      const updates = {};

      // If cloud has a plantSN value, and it's different from local, use cloud
      if (user.plantSN && user.plantSN !== entry.plantSN) {
        updates.plantSN = user.plantSN;
      }

      // If cloud has a companyName value, and it's different from local, use cloud
      if (user.companyName && user.companyName !== entry.companyName) {
        updates.companyName = user.companyName;
      }

      if (Object.keys(updates).length > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Safe: one-time cloud merge on mount.
        setEntry(prev => ({ ...prev, ...updates }));
      }
      
      // Crucial: Mark what we have in cloud right now so we don't "save" it back
      lastSavedCloudSN.current = user.plantSN || entry.plantSN || "3851";
      lastSavedCloudCompany.current = user.companyName || entry.companyName || "";
      setHasMergedCloud(true);
    }
  }, [user, isLoaded, hasMergedCloud, entry.plantSN, entry.companyName]);

  // 3. Keep Local Storage sync
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
    }
  }, [entry, isLoaded]);

  // 4. Debounced Cloud Save (plantSN + companyName)
  useEffect(() => {
    // Only save if we have a user, local is ready, and we've already done the initial merge
    if (!isLoaded || !hasMergedCloud || !user) return;

    const currentSN = entry.plantSN || "3851";
    const currentCompany = entry.companyName || "";
    
    // Check if either value changed from what's in cloud
    const snChanged = currentSN !== lastSavedCloudSN.current;
    const companyChanged = currentCompany !== lastSavedCloudCompany.current;
    
    if (!snChanged && !companyChanged) return;

    const timer = setTimeout(async () => {
      try {
        const payload = {};
        if (snChanged) payload.plantSN = currentSN;
        if (companyChanged) payload.companyName = currentCompany;

        const res = await fetch("/api/settings/plant-sn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          if (snChanged) lastSavedCloudSN.current = currentSN;
          if (companyChanged) lastSavedCloudCompany.current = currentCompany;
        }
      } catch (err) {
        console.error("Cloud Sync Error:", err);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [entry.plantSN, entry.companyName, isLoaded, hasMergedCloud, user]);

  const updateField = useCallback((key, value) => {
    if (key === "qty" && Number(value) > 100) return;
    setEntry((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleStart = useCallback(() => {
    const time = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
    });
    setEntry((prev) => ({ ...prev, batchStart: time, batchStop: time }));
  }, []);

  const handleStop = useCallback(() => {
    const time = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
    });
    setEntry((prev) => ({ ...prev, batchStop: time }));
  }, []);

  const resetForm = useCallback(() => {
    setEntry((prev) => {
      const current = parseInt(prev.docketNo, 10);
      const nextDocket = isNaN(current) ? "" : (current + 1).toString();
      const fresh = {
        ...defaultEntry,
        docketNo: nextDocket,
        plantSN: prev.plantSN,
        companyName: prev.companyName,
        grade: ""
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    });
  }, []);

  const incrementDocketNo = useCallback(() => {
    setEntry((prev) => {
      const current = parseInt(prev.docketNo, 10);
      if (isNaN(current)) return prev;
      return { ...prev, docketNo: (current + 1).toString() };
    });
  }, []);

  return { entry, updateField, handleStart, handleStop, incrementDocketNo, resetForm };
}
