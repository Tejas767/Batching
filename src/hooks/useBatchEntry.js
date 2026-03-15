"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "shreehari_latest_entry";

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

export function useBatchEntry(user = null) {
  const [entry, setEntry] = useState(defaultEntry);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasMergedCloud, setHasMergedCloud] = useState(false);
  
  // Track previous value to avoid saving if nothing changed
  const lastSavedCloudSN = useRef("");

  // 1. Initial Load from Local Storage (Immediate)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setEntry(prev => ({ ...prev, ...parsed }));
    }
    setIsLoaded(true);
  }, []);

  // 2. Initial Sync (Cloud Settings Overwrite Local)
  useEffect(() => {
    if (isLoaded && user && !hasMergedCloud) {
      // If cloud has a value, and it's different from local, upgrade local
      if (user.plantSN && user.plantSN !== entry.plantSN) {
        setEntry(prev => ({ ...prev, plantSN: user.plantSN }));
      }
      
      // Crucial: Mark what we have in cloud right now so we don't "save" it back
      lastSavedCloudSN.current = user.plantSN || entry.plantSN || "3851";
      setHasMergedCloud(true);
    }
  }, [user, isLoaded, hasMergedCloud, entry.plantSN]);

  // 3. Keep Local Storage sync
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
    }
  }, [entry, isLoaded]);

  // 4. Debounced Cloud Save
  useEffect(() => {
    // Only save if we have a user, local is ready, and we've already done the initial merge
    if (!isLoaded || !hasMergedCloud || !user) return;

    const currentVal = entry.plantSN || "3851";
    
    // Don't save if it matches the last thing we got from or sent to cloud
    if (currentVal === lastSavedCloudSN.current) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/settings/plant-sn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plantSN: currentVal }),
        });
        if (res.ok) {
          lastSavedCloudSN.current = currentVal;
          toast.success("Settings synced to cloud", { id: "cloud-sync" });
        }
      } catch (err) {
        console.error("Cloud Sync Error:", err);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [entry.plantSN, isLoaded, hasMergedCloud, user]);

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
        grade: "M15"
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
