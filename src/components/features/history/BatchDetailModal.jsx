/**
 * BatchDetailModal.jsx — Feature component.
 *
 * CDD Layer 3: Slide-in detail panel for a single history record.
 * Shows metadata, per-batch rows table, and totals.
 */
"use client";

import { Modal } from "@/components/ui/Modal";
import { AutographicReport } from "@/components/features/report/AutographicReport";

export function BatchDetailModal({ record, onClose }) {
  if (!record) return null;

  // Reconstruct the data structures expected by AutographicReport
  const entry = record;
  const targets = record.mixDesign || {};
  const reportData = {
    rows: record.reportRows || [],
    totals: record.totals || {},
    totalBatches: (record.reportRows || []).length,
  };

  return (
    <Modal
      open={!!record}
      onClose={onClose}
      subtitle="Historical Batch Report"
      title={`Docket ${record.docketNo || "—"}`}
      maxWidth="max-w-5xl"
    >
      <div className="-mx-8 -my-2 border-t border-border mt-4">
        {/* Render the exact same report layout */}
        <div className="p-8">
          <AutographicReport
            entry={entry}
            targets={targets}
            reportData={reportData}
            hideActions={true}
          />
        </div>
      </div>
    </Modal>
  );
}
