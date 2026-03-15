/**
 * MixDesignEditor.jsx — Feature component.
 *
 * CDD Layer 3: Editable mix design grid for the EDIT tab.
 * Receives mixDesign, updateCell, saveMixDesign, resetMixDesign, syncMessage from parent.
 */
"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { grades, mixColumns } from "@/constants/mixConfig";
import { Save, RotateCcw, Plus } from "lucide-react";

export function MixDesignEditor({ 
  mixDesign, 
  batchSize,
  differences,
  syncMessage, 
  onUpdateCell, 
  onUpdateBatchSize,
  onUpdateDifference,
  onSave, 
  onReset 
}) {
  return (
    <Card>
      <CardHeader
        label="MIX DESIGN CONFIGURATION"
        title="Mix Design Editor"
        action={
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
               <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Batch Size (M³)</span>
               <input 
                 type="number"
                 step="0.1"
                 value={batchSize ?? ""}
                 onChange={(e) => onUpdateBatchSize(e.target.value)}
                 className="w-20 px-3 py-1.5 rounded-lg border border-border bg-white text-sm font-semibold focus:border-brand-1 focus:outline-none focus:ring-1 focus:ring-brand-1/30 transition-shadow"
               />
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={14} />}
              className="bg-brand-1 hover:bg-brand-1/90"
            >
              Add Grade
            </Button>

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
      
      <p className={`mb-5 text-xs font-semibold transition-opacity duration-300 ${syncMessage ? "text-brand-1 opacity-100" : "opacity-0 select-none"}`}>
        {syncMessage || "‎"}
      </p>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="bg-[#0f3433] text-white">
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest border-r border-white/10">
                Grade
              </th>
              {mixColumns.map((col, i) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-center text-xs font-bold uppercase tracking-widest border-r border-white/10 last:border-r-0"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grades.map((grade, rowIdx) => (
              <tr key={grade} className={rowIdx % 2 === 0 ? "bg-white" : "bg-surface"}>
                <td className="border-b border-border border-r px-4 py-2.5 font-bold text-stone-700">
                  {grade}
                </td>
                {mixColumns.map((col) => (
                  <td
                    key={`${grade}-${col.key}`}
                    className="border-b border-border border-r px-2 py-2 text-center last:border-r-0"
                  >
                    <input
                      id={`mix-${grade}-${col.key}`}
                      type="number"
                      inputMode="decimal"
                      value={mixDesign[grade]?.[col.key] ?? ""}
                      onChange={(e) => onUpdateCell(grade, col.key, e.target.value)}
                      className="w-full max-w-[80px] rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-center text-sm focus:border-brand-1 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-1/30 transition-all font-medium"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-[#e9f0f1]">
              <td className="px-4 py-3 font-bold text-stone-800 uppercase text-xs tracking-wider border-r border-stone-200">
                Difference (±)
              </td>
              {mixColumns.map((col) => (
                <td key={`diff-${col.key}`} className="px-2 py-2 text-center border-r border-stone-200 last:border-r-0">
                  <input
                    type="number"
                    step="0.01"
                    value={differences[col.key] ?? ""}
                    onChange={(e) => onUpdateDifference(col.key, e.target.value)}
                    className="w-full max-w-[80px] rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-center text-sm font-bold text-brand-1 focus:border-brand-1 focus:bg-white focus:outline-none transition-all"
                  />
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
}
