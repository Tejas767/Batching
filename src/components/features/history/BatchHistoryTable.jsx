/**
 * BatchHistoryTable.jsx — Feature component.
 *
 * CDD Layer 3: Table rendering the filtered history records.
 * The "View" button triggers the detail modal via onViewDetails.
 */
"use client";

import { motion } from "framer-motion";
import { Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

const COLS = [
  { key: "created_at",    label: "Time",     render: (v) => v ? new Date(v).toLocaleString() : "—" },
  { key: "docketNo",      label: "Docket" },
  { key: "customerName",  label: "Customer" },
  { key: "grade",         label: "Grade" },
  { key: "qty",           label: "Qty" },
  { key: "truckNumber",   label: "Truck" },
];

export function BatchHistoryTable({ rows, onViewDetails, onDeleteDetails }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="min-w-full border-separate border-spacing-0 text-sm">
        <thead>
          <tr className="bg-brand-1 text-white">
            {COLS.map((col, i) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest ${
                  i === 0 ? "rounded-tl-xl" : ""
                }`}
              >
                {col.label}
              </th>
            ))}
            <th className="rounded-tr-xl px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={COLS.length + 1}
                className="px-4 py-10 text-center text-sm text-muted"
              >
                No history records yet.
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03, duration: 0.25 }}
                className={idx % 2 === 0 ? "bg-white" : "bg-surface"}
              >
                {COLS.map((col) => (
                  <td key={col.key} className="border-b border-border px-4 py-3 text-stone-700">
                    {col.render ? col.render(row[col.key]) : (row[col.key] || "—")}
                  </td>
                ))}
                <td className="border-b border-border px-4 py-2 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(row)}
                      icon={<Eye size={13} />}
                      className="border-brand-1/40 text-brand-1 hover:border-brand-1"
                    >
                      View
                    </Button>
                    {onDeleteDetails && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteDetails(row.id)}
                        icon={<Trash2 size={13} />}
                        className="border-red-500/40 text-red-600 hover:border-red-600 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
