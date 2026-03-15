/**
 * useBatchHistory.js — Connected to MongoDB via /api/history.
 *
 * Replaces localStorage with real database calls.
 * History persists across devices and sessions.
 */
"use client";

import { useState, useCallback, useMemo, useEffect } from "react";

export function useBatchHistory() {
  const [history, setHistory]           = useState([]);
  const [loading, setLoading]           = useState(false);
  const [historyQuery, setHistoryQuery] = useState("");
  const [historyFrom, setHistoryFrom]   = useState("");
  const [historyTo, setHistoryTo]       = useState("");
  const [historyDetails, setHistoryDetails] = useState(null);

  // ── Load from MongoDB ────────────────────────────────────────
  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (historyFrom)      params.set("from",   historyFrom);
      if (historyTo)        params.set("to",     historyTo);
      if (historyQuery.trim()) params.set("search", historyQuery);

      const res  = await fetch(`/api/history?${params.toString()}`);
      const data = await res.json();
      setHistory(data.data || []);
    } catch (err) {
      console.error("loadHistory error:", err);
    } finally {
      setLoading(false);
    }
  }, [historyFrom, historyTo, historyQuery]);

  // Debounced Effect: Only load history after the user stops typing for 500ms
  useEffect(() => {
    const handler = setTimeout(() => {
      loadHistory();
    }, 500);

    return () => clearTimeout(handler);
  }, [historyFrom, historyTo, historyQuery, loadHistory]);

  // ── Save a batch record to MongoDB ───────────────────────────
  const saveToHistory = useCallback(async (data) => {
    try {
      await fetch("/api/history", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ item: data }),
      });
    } catch (err) {
      console.error("saveToHistory error:", err);
    }
  }, []);

  // ── Delete one record ────────────────────────────────────────
  const deleteFromHistory = useCallback(async (id) => {
    try {
      await fetch(`/api/history?id=${id}`, { method: "DELETE" });
      setHistory((prev) => prev.filter((row) => String(row.id) !== String(id)));
      setHistoryDetails((d) => (d && String(d.id) === String(id) ? null : d));
    } catch (err) {
      console.error("deleteFromHistory error:", err);
    }
  }, []);

  // ── Clear all — just reloads with no records (admin action) ──
  const clearAllHistory = useCallback(async () => {
    // Remove all records one by one (simple approach)
    for (const row of history) {
      await fetch(`/api/history?id=${row.id}`, { method: "DELETE" });
    }
    setHistory([]);
  }, [history]);

  // ── Date quick filters ───────────────────────────────────────
  const setToday = useCallback(() => {
    const v = new Date().toISOString().slice(0, 10);
    setHistoryFrom(v);
    setHistoryTo(v);
  }, []);

  const setLast7Days = useCallback(() => {
    const end   = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    setHistoryFrom(start.toISOString().slice(0, 10));
    setHistoryTo(end.toISOString().slice(0, 10));
  }, []);

  const setThisMonth = useCallback(() => {
    const now   = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setHistoryFrom(start.toISOString().slice(0, 10));
    setHistoryTo(end.toISOString().slice(0, 10));
  }, []);

  const clearFilters = useCallback(() => {
    setHistoryQuery("");
    setHistoryFrom("");
    setHistoryTo("");
  }, []);

  // No local filtering needed anymore, constant reference for compatibility
  const filteredHistory = history;

  return {
    history,
    filteredHistory,
    loading,
    historyQuery,    setHistoryQuery,
    historyFrom,     setHistoryFrom,
    historyTo,       setHistoryTo,
    historyDetails,  setHistoryDetails,
    loadHistory,
    saveToHistory,
    clearAllHistory,
    deleteFromHistory,
    setToday,
    setLast7Days,
    setThisMonth,
    clearFilters,
  };
}
