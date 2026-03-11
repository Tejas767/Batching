/**
 * useBatchHistory.js — Custom hook configured for local-only state (No DB).
 *
 * This version removes all database persistence to avoid networking errors.
 * History is stored in localStorage.
 */
"use client";

import { useState, useCallback, useMemo, useEffect } from "react";

export function useBatchHistory() {
  const [history, setHistory] = useState([]);
  const [historyQuery, setHistoryQuery] = useState("");
  const [historyFrom, setHistoryFrom] = useState("");
  const [historyTo, setHistoryTo] = useState("");
  const [historyDetails, setHistoryDetails] = useState(null);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("batchHistory");
      if (stored) {
        try { 
          setHistory(JSON.parse(stored)); 
        } catch (_) { /* ignore */ }
      }
    }
  }, []);

  // Save to history locally
  const saveToHistory = useCallback(async (data) => {
    const newRecord = {
      ...data,
      created_at: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9),
    };
    
    setHistory((prev) => {
      const updated = [newRecord, ...prev].slice(0, 50); // Keep last 50
      if (typeof window !== "undefined") {
        window.localStorage.setItem("batchHistory", JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  // Quick date range setters
  const setToday = useCallback(() => {
    const value = new Date().toISOString().slice(0, 10);
    setHistoryFrom(value);
    setHistoryTo(value);
  }, []);

  const setLast7Days = useCallback(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    setHistoryFrom(start.toISOString().slice(0, 10));
    setHistoryTo(end.toISOString().slice(0, 10));
  }, []);

  const setThisMonth = useCallback(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setHistoryFrom(start.toISOString().slice(0, 10));
    setHistoryTo(end.toISOString().slice(0, 10));
  }, []);

  const clearFilters = useCallback(() => {
    setHistoryQuery("");
    setHistoryFrom("");
    setHistoryTo("");
  }, []);

  // NEW: Delete all history
  const clearAllHistory = useCallback(() => {
    setHistory([]);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("batchHistory");
    }
  }, []);

  const deleteFromHistory = useCallback((id) => {
    setHistory((prev) => {
      const updated = prev.filter((row) => row.id !== id);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("batchHistory", JSON.stringify(updated));
      }
      return updated;
    });
    // Clear details if the deleted one was open
    if (historyDetails?.id === id) {
      setHistoryDetails(null);
    }
  }, [historyDetails]);

  // Derived filtered list
  const filteredHistory = useMemo(() => {
    return history
      .filter((row) => {
        if (!historyQuery.trim()) return true;
        const q = historyQuery.toLowerCase();
        return (
          String(row.docketNo      || "").toLowerCase().includes(q) ||
          String(row.customerName  || "").toLowerCase().includes(q) ||
          String(row.grade         || "").toLowerCase().includes(q) ||
          String(row.site          || "").toLowerCase().includes(q) ||
          String(row.truckNumber   || "").toLowerCase().includes(q)
        );
      })
      .filter((row) => {
        if (!historyFrom && !historyTo) return true;
        if (!row.created_at) return false;
        const day = new Date(row.created_at);
        const from = historyFrom ? new Date(historyFrom) : null;
        const to   = historyTo   ? new Date(historyTo)   : null;
        if (from && day < from) return false;
        if (to) {
          const end = new Date(to);
          end.setHours(23, 59, 59, 999);
          if (day > end) return false;
        }
        return true;
      });
  }, [history, historyQuery, historyFrom, historyTo]);

  return {
    history,
    filteredHistory,
    historyQuery,  setHistoryQuery,
    historyFrom,   setHistoryFrom,
    historyTo,     setHistoryTo,
    historyDetails, setHistoryDetails,
    loadHistory: () => {}, // No-op
    saveToHistory,
    clearAllHistory,
    deleteFromHistory,
    setToday,
    setLast7Days,
    setThisMonth,
    clearFilters,
  };
}
