/**
 * PrintDocketCard.jsx — Feature component.
 *
 * CDD Layer 3: Dark teal card showing the current batch preview
 * with Print and Save-to-History actions.
 */
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Printer, BookmarkPlus } from "lucide-react";

export function PrintDocketCard({ entry, reportData, targets, onPrint, onSaveToHistory }) {
  const productionQty = Number(entry.qty || 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
      className="rounded-3xl bg-gradient-to-br from-brand-1 via-[#13494b] to-brand-1 p-8 text-white shadow-card-lg"
    >
      <h3 className="text-xs font-semibold uppercase tracking-[0.4em] text-brand-2">
        Print Docket
      </h3>
      <p className="mt-3 text-2xl font-semibold">Autographic Record</p>
      <p className="mt-2 text-sm text-white/70">
        Generate the report based on mix design targets and actual batch weights.
      </p>

      {/* Preview stats */}
      <div className="mt-8 rounded-2xl bg-white/10 p-5 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
          Preview
        </p>
        <div className="mt-4 grid gap-3 text-sm">
          {[
            { label: "Grade",   value: entry.grade },
            { label: "Qty",     value: `${productionQty.toFixed(2)} m³` },
            { label: "Batches", value: reportData.totalBatches },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-white/70">{label}</span>
              <span className="font-semibold">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3">
        <Button
          variant="gold"
          size="lg"
          onClick={onPrint}
          icon={<Printer size={15} />}
          className="w-full justify-center rounded-2xl"
        >
          Print Report
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={onSaveToHistory}
          icon={<BookmarkPlus size={15} />}
          className="w-full justify-center rounded-2xl border-white/30 text-white hover:bg-white/10"
        >
          Save to History
        </Button>
      </div>
    </motion.div>
  );
}
