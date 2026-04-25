/**
 * BatchDetailModal.jsx — Feature component.
 *
 * CDD Layer 3: Slide-in detail panel for a single history record.
 * Shows metadata, per-batch rows table, and totals.
 * Report rows are reconstructed client-side using useReportData.
 */
"use client";

import { Modal } from "@/components/ui/Modal";
import { AutographicReport } from "@/components/features/report/AutographicReport";
import { useReportData } from "@/hooks/useReportData";
import { Printer } from "lucide-react";

export function BatchDetailModal({ record, onClose, onPrint }) {
  // Reconstruct report data client-side (deterministic from docketNo+customer+grade+qty)
  // Hooks must be called unconditionally (before any early return).
  const entry = record || {};
  const targets = record?.mixDesign || {};
  const differences = record?.differences || {};
  const batchSize = record?.batchSize || 0.5;

  // useReportData generates the exact same rows as when the batch was originally created
  const reportData = useReportData(entry, targets, batchSize, differences);

  if (!record) return null;

  return (
    <Modal
      open={!!record}
      onClose={onClose}
      subtitle="Historical Batch Report"
      title={`Docket ${record.docketNo || "—"}`}
      maxWidth="max-w-5xl"
    >
      {/* Print button */}
      <div className="flex justify-end -mt-2 mb-2">
        <button
          onClick={() => onPrint?.(record)}
          className="flex items-center gap-2 rounded-xl bg-brand-1 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-sm hover:bg-brand-1/90 transition-all hover:scale-[1.02]"
        >
          <Printer size={15} />
          Print Report
        </button>
      </div>

      <div className="-mx-8 -my-2 border-t border-border mt-2">
        {/* Render the exact same report layout */}
        <div className="p-8">
          <AutographicReport
            entry={entry}
            targets={targets}
            reportData={reportData}
            batchSize={batchSize}
            hideActions={true}
          />
        </div>
      </div>
    </Modal>
  );
}
