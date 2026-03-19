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
import { CustomerManager }      from "@/components/features/customers/CustomerManager";
import { VehicleManager }       from "@/components/features/vehicles/VehicleManager";
import { ConfirmDialog }        from "@/components/ui/ConfirmDialog";

// Hooks (all logic lives here)
import { useSession }      from "@/hooks/useSession";
import { useMixDesign }    from "@/hooks/useMixDesign";
import { useBatchEntry }   from "@/hooks/useBatchEntry";
import { useBatchHistory } from "@/hooks/useBatchHistory";
import { useReportData }   from "@/hooks/useReportData";
import { useCustomers }    from "@/hooks/useCustomers";
import { useVehicles }     from "@/hooks/useVehicles";

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
  const { user, isLoaded, isSignedIn, signOut } = useSession({ 
    redirectTo: "/login",
    requireRole: "operator"
  });
  const [activeTab, setActiveTab] = useState("ENTRY");
  const [deleteId, setDeleteId] = useState(null);
  const [showClearAll, setShowClearAll] = useState(false);
  const [lastBatch, setLastBatch] = useState(null);

  // ── Data / Logic hooks ──────────────────────
  const {
    mixDesign, batchSize, setBatchSize, differences, updateDifference, syncMessage,
    loadMixDesign, saveMixDesign, updateCell, resetMixDesign,
  } = useMixDesign();

  const { entry, updateField, handleStart, handleStop, incrementDocketNo, resetForm } = useBatchEntry(user);

  const {
    customers, addCustomer, deleteCustomer, deleteAllCustomers, loading: customersLoading
  } = useCustomers();

  const {
    vehicles, addVehicle, deleteVehicle, deleteAllVehicles, loading: vehiclesLoading
  } = useVehicles();

  const {
    filteredHistory, historyQuery, setHistoryQuery,
    historyFrom, setHistoryFrom, historyTo, setHistoryTo,
    historyDetails, setHistoryDetails,
    loadHistory, saveToHistory, clearAllHistory, deleteFromHistory,
    setToday, setLast7Days, setThisMonth, clearFilters, exportToCSV, isExporting,
    currentPage, totalPages, totalCount, nextPage, prevPage, goToPage,
  } = useBatchHistory();

  // Targets = mix design row for the currently selected grade
  const targets = mixDesign[entry.grade] || mixDesign.M15 || initialMixDesign.M15;

  // Report data computed deterministically from entry + targets
  const reportData = useReportData(entry, targets, batchSize, differences);

  // ── Field update wrapper ──────────────────────
  // If we are viewing a report (lastBatch exists), we should update it too
  // so the screen reflect changes and printing works correctly.
  const handleUpdateField = (key, value) => {
    updateField(key, value);
    if (lastBatch) {
      setLastBatch(prev => prev ? { ...prev, [key]: value } : null);
    }
  };

  // Data is loaded automatically by the hooks on mount.
  useEffect(() => {
    // No-op - data loading is internal to hooks now
  }, []);

  // ── Print / Tab handlers ───────────────────────────
  const handleViewLastReport = () => {
    // Sync if needed
    if (!lastBatch && filteredHistory && filteredHistory.length > 0) {
      setLastBatch(filteredHistory[0]);
    }
    setActiveTab("REPORT");
  };

  const handlePrint = () => {
    // Print whatever is currently displayed on screen (live entry data)
    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.print();
      }, 300);
    }
  };

  const onStopBatch = () => {
    const time = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
    });
    
    // 1. Capture final state for the report
    const finalEntry = { ...entry, batchStop: time };
    const finalTargets = mixDesign[finalEntry.grade] || mixDesign.M15 || initialMixDesign.M15;
    
    const batchData = {
      ...finalEntry,
      mixDesign: finalTargets,
      batchSize,
      rows: reportData.rows,
      totals: reportData.totals,
      setWeights: reportData.setWeights,
      totalBatches: reportData.totalBatches
    };

    setLastBatch(batchData);

    // 2. Auto-save to history
    saveToHistory(batchData).then(loadHistory);

    // 3. Clear entry and increment docket (STAY ON ENTRY TAB)
    resetForm();
    toast.success(`Batch #${finalEntry.docketNo} SAVED ✅`, {
      description: "Ready for next docket entry."
    });
  };

  const handleSaveToHistory = () => {
    const dataToSave = lastBatch ? lastBatch : {
      ...entry,
      mixDesign: targets,
      batchSize,
      rows: reportData.rows,
      totals: reportData.totals,
      setWeights: reportData.setWeights,
      totalBatches: reportData.totalBatches
    };

    saveToHistory(dataToSave).then(() => {
      loadHistory();
      if (!lastBatch) {
        incrementDocketNo();
      }
      toast.success(`Docket ${dataToSave.docketNo} saved successfully!`);
    });
  };

  // 1. Loading state (Checking session...)
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FDFCF7]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-1 border-t-transparent" />
      </div>
    );
  }

  // 2. Auth Guard — If not signed in, show nothing while background redirect happens
  if (!isSignedIn) return null;

  // ── Main authenticated app ───────────────────
  return (
    <PageShell>
      <div className="print:hidden mx-auto w-full max-w-5xl flex flex-col md:flex-row md:items-center md:justify-between gap-6 pt-0 pb-6 md:pb-8">
        <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
        <AppHeader />
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
            <div className="md:mx-auto md:max-w-5xl">
              <div className="rounded-2xl md:rounded-3xl border border-border bg-white p-5 md:p-8 shadow-card">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-lg md:text-xl font-semibold text-brand-1">Batch Entry</h2>
                  <span className="rounded-full bg-brand-1/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand-1">
                    ENTRY
                  </span>
                </div>
                <BatchEntryForm
                  entry={entry}
                  customers={customers}
                  vehicles={vehicles}
                  onUpdateField={updateField}
                  onStart={handleStart}
                  onStop={onStopBatch}
                  onPrint={handleViewLastReport}
                  onSaveToHistory={handleSaveToHistory}
                />
              </div>
            </div>
          )}

          {/* ── CUSTOMER TAB ─── */}
          {activeTab === "CUSTOMERS" && (
            <div className="md:mx-auto md:max-w-5xl w-full">
              <CustomerManager
                customers={customers}
                onAdd={addCustomer}
                onDelete={deleteCustomer}
                onDeleteAll={deleteAllCustomers}
                loading={customersLoading}
              />
            </div>
          )}

          {/* ── VEHICLE TAB ─── */}
          {activeTab === "VEHICLE" && (
            <div className="md:mx-auto md:max-w-5xl w-full">
              <VehicleManager
                vehicles={vehicles}
                onAdd={addVehicle}
                onDelete={deleteVehicle}
                onDeleteAll={deleteAllVehicles}
                loading={vehiclesLoading}
              />
            </div>
          )}

          {/* ── MIX DESIGN TAB ─── */}
          {activeTab === "EDIT" && (
            <div className="md:mx-auto md:max-w-7xl">
              <MixDesignEditor
              mixDesign={mixDesign}
              batchSize={batchSize}
              setBatchSize={setBatchSize}
              differences={differences}
              onUpdateDifference={updateDifference}
              syncMessage={syncMessage}
              onUpdateCell={updateCell}
              onSave={() => saveMixDesign(mixDesign, batchSize, differences)}
              onReset={resetMixDesign}
              />
            </div>
          )}

          {/* ── REPORT TAB ─── */}
          {activeTab === "REPORT" && (
            <div className="md:mx-auto md:max-w-5xl">
              <AutographicReport
                entry={entry}
                targets={targets}
                reportData={reportData}
                batchSize={batchSize}
                onPrint={handlePrint}
                onSaveToHistory={handleSaveToHistory}
                onUpdateField={handleUpdateField}
              />
            </div>
          )}

          {/* ── HISTORY TAB ─── */}
          {activeTab === "HISTORY" && (
            <div className="md:mx-auto md:max-w-5xl rounded-2xl md:rounded-3xl border border-border bg-white p-4 md:p-8 shadow-card space-y-5 md:space-y-6">
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
                onExport={exportToCSV}
                isLoadingExport={isExporting}
                resultCount={totalCount}
              />

              <BatchHistoryTable
                rows={filteredHistory}
                onViewDetails={setHistoryDetails}
                onDeleteDetails={setDeleteId}
              />

              {/* ── Pagination Controls ── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <p className="text-xs text-muted">
                    Showing <span className="font-semibold text-foreground">{filteredHistory.length}</span> of{" "}
                    <span className="font-semibold text-foreground">{totalCount.toLocaleString()}</span> records
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevPage}
                      disabled={currentPage <= 1}
                      className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 hover:border-brand-1 hover:text-brand-1 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Prev
                    </button>
                    <span className="text-xs font-semibold text-stone-700">
                      Page {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={nextPage}
                      disabled={currentPage >= totalPages}
                      className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 hover:border-brand-1 hover:text-brand-1 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
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
        batchSize={batchSize}
      />
    </PageShell>
  );
}
