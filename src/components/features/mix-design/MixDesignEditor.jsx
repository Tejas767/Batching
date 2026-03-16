/**
 * MixDesignEditor.jsx — Feature component.
 *
 * CDD Layer 3: Editable mix design grid for the EDIT tab.
 * Includes an editable DIFFERENCE row for controlling variance per column.
 */
"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { grades, mixColumns } from "@/constants/mixConfig";
import { RotateCcw } from "lucide-react";

export function MixDesignEditor({ 
  mixDesign, 
  batchSize, 
  setBatchSize, 
  differences,
  onUpdateDifference,
  syncMessage, 
  onUpdateCell, 
  onSave, 
  onReset 
}) {
  return (
    <Card>
      <CardHeader
        label="MIX DESIGN CONFIGURATION"
        title="Mix Design Editor"
        action={
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-start gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Batch Size (M³)</span>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                className="w-20 rounded-lg border border-border bg-stone-50 px-3 py-1.5 text-sm font-bold text-brand-1 focus:border-brand-1 focus:outline-none transition-colors"
                placeholder="0.5"
              />
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={onReset}
              icon={<RotateCcw size={13} />}
            >
              Reset
            </Button>
          </div>
        }
      />
      <p className="mb-1 -mt-2 text-sm text-stone-500">
        Update mix design values. Changes apply to MAIN and REPORT tabs.
      </p>
      {/* Status message */}
      <p className={`mb-5 text-xs font-semibold transition-opacity duration-300 ${syncMessage ? "text-brand-1 opacity-100" : "opacity-0 select-none"}`}>
        {syncMessage || "‎"}
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="bg-brand-1 text-white">
              <th className="rounded-tl-xl px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest">
                Grade
              </th>
              {mixColumns.map((col, i) => (
                <th
                  key={col.key}
                  className={`py-3 text-xs font-semibold uppercase tracking-widest ${
                    col.label === "-" ? "text-center px-2" : "text-left px-4"
                  } ${
                    i === mixColumns.length - 1 ? "rounded-tr-xl" : ""
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Mix design rows per grade */}
            {grades.map((grade, rowIdx) => (
              <tr key={grade} className={rowIdx % 2 === 0 ? "bg-white" : "bg-surface"}>
                <td className="border-b border-border px-4 py-2.5 font-semibold text-brand-1">
                  {grade}
                </td>
                {mixColumns.map((col) => (
                  <td
                    key={`${grade}-${col.key}`}
                    className="border-b border-border px-3 py-2 text-center"
                  >
                    <input
                      id={`mix-${grade}-${col.key}`}
                      type="number"
                      inputMode="decimal"
                      value={mixDesign[grade]?.[col.key] ?? ""}
                      onChange={(e) => onUpdateCell(grade, col.key, e.target.value)}
                      className="w-[72px] rounded-lg border border-border bg-white px-2 py-1.5 text-sm focus:border-brand-1 focus:outline-none focus:ring-1 focus:ring-brand-1/30 transition-colors"
                    />
                  </td>
                ))}
              </tr>
            ))}

            {/* ── DIFFERENCE ROW ── */}
            <tr className="bg-stone-100 border-t-2 border-brand-1/30">
              <td className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-stone-600 whitespace-nowrap">
                Difference (±)
              </td>
              {mixColumns.map((col) => (
                <td key={`diff-${col.key}`} className="px-3 py-2 text-center">
                  <input
                    id={`diff-${col.key}`}
                    type="number"
                    step="0.1"
                    min="0"
                    inputMode="decimal"
                    value={differences?.[col.key] ?? ""}
                    onChange={(e) => onUpdateDifference(col.key, e.target.value)}
                    className="w-[72px] rounded-lg border border-amber-300 bg-amber-50 px-2 py-1.5 text-sm font-semibold text-amber-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-400/30 transition-colors"
                    placeholder="0"
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        <p className="mt-3 text-xs text-muted">
          💡 <strong>Difference (±)</strong> — Sets the maximum allowed variance per batch between <em>Total Set Weight</em> and <em>Total Actual</em> for each material.
        </p>
      </div>
    </Card>
  );
}
