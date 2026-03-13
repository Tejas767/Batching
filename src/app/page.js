/**
 * page.js — Main application page (CDD orchestrator).
 *
 * This file is intentionally thin. It:
 *  1. Wires together custom hooks (data + logic layer)
 *  2. Handles auth guards (loading / not signed in)
 *  3. Renders layout shell + tab navigation
 *  4. Passes props down into isolated feature components
 *
 * NO business logic lives here — it belongs in the hooks.
 * NO UI markup lives here — it belongs in the components.
 */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// Layout
import { PageShell }  from "@/components/layout/PageShell";
import { AppHeader }  from "@/components/layout/AppHeader";
import { TabNav }     from "@/components/layout/TabNav";

// Feature components
import { BatchEntryForm }       from "@/components/features/entry/BatchEntryForm";
import { MixDesignEditor }      from "@/components/features/mix-design/MixDesignEditor";
import { AutographicReport, HiddenPrintReport } from "@/components/features/report/AutographicReport";
import { BatchHistoryFilters }  from "@/components/features/history/BatchHistoryFilters";
import { BatchHistoryTable }    from "@/components/features/history/BatchHistoryTable";
import { BatchDetailModal }     from "@/components/features/history/BatchDetailModal";
import { ConfirmDialog }        from "@/components/ui/ConfirmDialog";

// Hooks (all logic lives here)
import { useSession }      from "@/hooks/useSession";
import { useMixDesign }    from "@/hooks/useMixDesign";
import { useBatchEntry }   from "@/hooks/useBatchEntry";
import { useBatchHistory } from "@/hooks/useBatchHistory";
import { useReportData }   from "@/hooks/useReportData";

// Constants
import { initialMixDesign } from "@/constants/mixConfig";

/* ── Tab content animation ───────────────────── */
const tabVariants = {
  initial:  { opacity: 0, y: 12 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit:     { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

/* ════════════════════════════════════════════════
   Home — the page orchestrator
════════════════════════════════════════════════ */
export default function Home() {
  const [activeTab, setActiveTab] = useState("ENTRY");
  const [deleteId, setDeleteId] = useState(null);
  const [showClearAll, setShowClearAll] = useState(false);

  // ── Data / Logic hooks ──────────────────────
  const {
    mixDesign, syncMessage,
    loadMixDesign, saveMixDesign, updateCell, resetMixDesign,
  } = useMixDesign();

  const { entry, updateField, handleStart, handleStop, incrementDocketNo } = useBatchEntry();

  const {
    filteredHistory, historyQuery, setHistoryQuery,
    historyFrom, setHistoryFrom, historyTo, setHistoryTo,
    historyDetails, setHistoryDetails,
    loadHistory, saveToHistory, clearAllHistory, deleteFromHistory,
    setToday, setLast7Days, setThisMonth, clearFilters,
  } = useBatchHistory();

  // Targets = mix design row for the currently selected grade
  const targets = mixDesign[entry.grade] || mixDesign.M15 || initialMixDesign.M15;

  // Report data computed deterministically from entry + targets
  const reportData = useReportData(entry, targets);

  // Data is loaded automatically by the hooks on mount.
  useEffect(() => {
    // No-op - data loading is internal to hooks now
  }, []);

  // ── Print handler ───────────────────────────
  const handlePrint = () => {
    // Save to history first, then print the always-mounted HiddenPrintReport
    saveToHistory({
      ...entry,
      mixDesign: targets,
      reportRows: reportData.rows,
      totals: reportData.totals,
    }).then(loadHistory);
    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.print();
        incrementDocketNo();
      }, 200);
    }
  };

  const handleSaveToHistory = () => {
    saveToHistory({
      ...entry,
      mixDesign: targets,
      reportRows: reportData.rows,
      totals: reportData.totals,
    }).then(() => {
      loadHistory();
      incrementDocketNo();
      toast.success(`Docket ${entry.docketNo} saved successfully!`);
    });
  };



  // ── Main authenticated app ───────────────────
  return (
    <PageShell>
      <div className="print:hidden">
        <AppHeader />
        <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Tab content with enter/exit animations — hidden during print */}
      <div className="print:hidden">
      <AnimatePresence mode="wait">
        <motion.section
          key={activeTab}
          variants={tabVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="mt-8"
        >
          {/* ── ENTRY TAB ─── */}
          {activeTab === "ENTRY" && (
            <div className="md:mx-auto md:max-w-4xl">
              <div className="rounded-2xl md:rounded-3xl border border-border bg-white p-5 md:p-8 shadow-card">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-lg md:text-xl font-semibold text-brand-1">Batch Entry</h2>
                  <span className="rounded-full bg-brand-1/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand-1">
                    ENTRY
                  </span>
                </div>
                <BatchEntryForm
                  entry={entry}
                  onUpdateField={updateField}
                  onStart={handleStart}
                  onStop={handleStop}
                  onPrint={handlePrint}
                  onSaveToHistory={handleSaveToHistory}
                />
              </div>
            </div>
          )}



          {/* ── EDIT TAB ─── */}
          {activeTab === "EDIT" && (
            <MixDesignEditor
              mixDesign={mixDesign}
              syncMessage={syncMessage}
              onUpdateCell={updateCell}
              onSave={() => saveMixDesign(mixDesign)}
              onReset={resetMixDesign}
            />
          )}

          {/* ── REPORT TAB ─── */}
          {activeTab === "REPORT" && (
            <AutographicReport
              entry={entry}
              targets={targets}
              reportData={reportData}
              onPrint={handlePrint}
              onSaveToHistory={handleSaveToHistory}
              onUpdateField={updateField}
            />
          )}

          {/* ── HISTORY TAB ─── */}
          {activeTab === "HISTORY" && (
            <div className="rounded-2xl md:rounded-3xl border border-border bg-white p-4 md:p-8 shadow-card space-y-5 md:space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-brand-1">Batch History</h2>
                  <p className="mt-1 text-xs md:text-sm text-muted">Showing recent printed batches</p>
                </div>
                <button
                  onClick={loadHistory}
                  className="rounded-full border border-brand-1 bg-brand-1 px-3 md:px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-brand-1/90 transition-colors"
                >
                  Refresh
                </button>
              </div>

              <BatchHistoryFilters
                query={historyQuery}       onQueryChange={setHistoryQuery}
                dateFrom={historyFrom}     onDateFromChange={setHistoryFrom}
                dateTo={historyTo}         onDateToChange={setHistoryTo}
                onToday={setToday}
                onLast7Days={setLast7Days}
                onThisMonth={setThisMonth}
                onClear={clearFilters}
                onClearAll={() => setShowClearAll(true)}
                resultCount={filteredHistory.length}
              />

              <BatchHistoryTable
                rows={filteredHistory}
                onViewDetails={setHistoryDetails}
                onDeleteDetails={setDeleteId}
              />
            </div>
          )}
        </motion.section>
      </AnimatePresence>
      </div>

      {/* History detail modal — rendered at top level so it overlays everything */}
      <BatchDetailModal
        record={historyDetails}
        onClose={() => setHistoryDetails(null)}
      />

      {/* Delete Confirmation Modals */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteFromHistory(deleteId);
          toast.success("Batch record deleted");
        }}
        title="Delete Batch Record"
        message="Are you sure you want to permanently delete this batch record? This action cannot be undone."
        confirmText="Delete Record"
      />

      <ConfirmDialog
        open={showClearAll}
        onClose={() => setShowClearAll(false)}
        onConfirm={() => {
          clearAllHistory();
          toast.success("All history deleted");
        }}
        title="Clear All History"
        message="Are you sure you want to PERMANENTLY delete all batch history? This action will erase all records and cannot be undone."
        confirmText="Delete All"
      />
      {/* Always-mounted hidden print DOM — captured by window.print() regardless of active tab */}
      <HiddenPrintReport
        entry={entry}
        targets={targets}
        reportData={reportData}
      />
    </PageShell>
  );
}
