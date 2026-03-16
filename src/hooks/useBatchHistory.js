/**
 * useBatchHistory.js — Connected to MongoDB via /api/history.
 *
 * Server-side pagination: loads 50 records per page.
 * Scales to 70,000+ records without performance issues.
 */
"use client";

import { useState, useCallback, useEffect, useRef } from "react";

const PAGE_SIZE = 50;

export function useBatchHistory() {
  const [history, setHistory]           = useState([]);
  const [loading, setLoading]           = useState(false);
  const [historyQuery, setHistoryQuery] = useState("");
  const [historyFrom, setHistoryFrom]   = useState("");
  const [historyTo, setHistoryTo]       = useState("");
  const [historyDetails, setHistoryDetails] = useState(null);

  // ── Pagination state ────────────────────────────────────────
  const [currentPage, setCurrentPage]   = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [totalCount, setTotalCount]     = useState(0);

  // ── Load from MongoDB (paginated) ───────────────────────────
  const loadHistory = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (historyFrom)         params.set("from",   historyFrom);
      if (historyTo)           params.set("to",     historyTo);
      if (historyQuery.trim()) params.set("search", historyQuery);
      params.set("page",  String(page));
      params.set("limit", String(PAGE_SIZE));

      const res  = await fetch(`/api/history?${params.toString()}`);
      const json = await res.json();

      setHistory(json.data || []);

      // Update pagination meta
      if (json.pagination) {
        setCurrentPage(json.pagination.page);
        setTotalPages(json.pagination.totalPages);
        setTotalCount(json.pagination.total);
      }
    } catch (err) {
      console.error("loadHistory error:", err);
    } finally {
      setLoading(false);
    }
  }, [historyFrom, historyTo, historyQuery]);

  // Auto-reload when filters change — reset to page 1
  const debounceTimer = useRef(null);
  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setCurrentPage(1);
      loadHistory(1);
    }, 500);
    return () => clearTimeout(debounceTimer.current);
  }, [historyFrom, historyTo, historyQuery, loadHistory]);

  // Navigate pages
  const goToPage = useCallback((page) => {
    setCurrentPage(page);
    loadHistory(page);
  }, [loadHistory]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) goToPage(currentPage + 1);
  }, [currentPage, totalPages, goToPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

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
      setTotalCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("deleteFromHistory error:", err);
    }
  }, []);

  // ── Clear all (1 DB call — instant even for 70,000+ records) ──
  const clearAllHistory = useCallback(async () => {
    try {
      await fetch("/api/history?all=true", { method: "DELETE" });
      setHistory([]);
      setTotalCount(0);
      setCurrentPage(1);
      setTotalPages(1);
    } catch (err) {
      console.error("clearAllHistory error:", err);
    }
  }, []);

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

  const filteredHistory = history;

  return {
    history,
    filteredHistory,
    loading,
    historyQuery,    setHistoryQuery,
    historyFrom,     setHistoryFrom,
    historyTo,       setHistoryTo,
    historyDetails,  setHistoryDetails,
    // Pagination
    currentPage,
    totalPages,
    totalCount,
    goToPage,
    nextPage,
    prevPage,
    loadHistory: () => loadHistory(currentPage),
    saveToHistory,
    clearAllHistory,
    deleteFromHistory,
    setToday,
    setLast7Days,
    setThisMonth,
    clearFilters,
  };
}

