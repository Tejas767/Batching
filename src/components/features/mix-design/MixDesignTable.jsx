/**
 * MixDesignTable.jsx — Feature component.
 *
 * CDD Layer 3: Read-only display of all mix design values per grade (MAIN tab).
 */
"use client";

import { motion } from "framer-motion";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { grades, mixColumns } from "@/constants/mixConfig";

export function MixDesignTable({ mixDesign }) {
  return (
    <Card variant="glass">
      <CardHeader
        label="Current Configuration"
        title="Mix Design Table"
        action={<Badge variant="gold">MAIN</Badge>}
      />
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
                  } ${i === mixColumns.length - 1 ? "rounded-tr-xl" : ""}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grades.map((grade, rowIdx) => (
              <motion.tr
                key={grade}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: rowIdx * 0.05, duration: 0.3 }}
                className={rowIdx % 2 === 0 ? "bg-white" : "bg-surface"}
              >
                <td className="border-b border-border px-4 py-3 font-semibold text-brand-1">
                  {grade}
                </td>
                {mixColumns.map((col) => (
                  <td
                    key={`${grade}-${col.key}`}
                    className="border-b border-border px-4 py-3 text-stone-700 text-center"
                  >
                    {mixDesign[grade]?.[col.key] === "" || mixDesign[grade]?.[col.key] === undefined ? (
                      <span className="text-stone-400">—</span>
                    ) : (
                      mixDesign[grade][col.key]
                    )}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
