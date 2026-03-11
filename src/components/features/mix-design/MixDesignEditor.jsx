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
import { Save, RotateCcw } from "lucide-react";

export function MixDesignEditor({ mixDesign, syncMessage, onUpdateCell, onSave, onReset }) {
  return (
    <Card>
      <CardHeader
        label="Edit Configuration"
        title="Mix Design Editor"
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={onReset}
            icon={<RotateCcw size={13} />}
          >
            Reset
          </Button>
        }
      />
      <p className="mb-1 -mt-2 text-sm text-stone-500">
        Update mix design values. Changes apply to MAIN and REPORT tabs.
      </p>
      {/* Status message — stable line below subtitle, won't cause layout shift */}
      <p className={`mb-5 text-xs font-semibold transition-opacity duration-300 ${syncMessage ? "text-brand-1 opacity-100" : "opacity-0 select-none"}`}>
        {syncMessage || "‎"}{/* non-empty so it keeps its line height */}
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
          </tbody>
        </table>
      </div>
    </Card>
  );
}
