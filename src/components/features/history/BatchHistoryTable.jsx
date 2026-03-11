/**
 * BatchHistoryTable.jsx — Feature component.
 *
 * CDD Layer 3: Table rendering the filtered history records.
 * Mobile: stacked cards. Desktop: full table.
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
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-border px-4 py-10 text-center text-sm text-muted">
        No history records yet.
      </div>
    );
  }

  return (
    <>
      {/* ── Mobile card list (hidden on md+) ── */}
      <div className="flex flex-col gap-3 md:hidden">
        {rows.map((row, idx) => (
          <motion.div
            key={row.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03, duration: 0.25 }}
            className="rounded-2xl border border-border bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <p className="text-xs text-muted uppercase tracking-wide">Docket #{row.docketNo || "—"}</p>
                <p className="font-semibold text-brand-1 text-sm mt-0.5">{row.customerName || "—"}</p>
              </div>
              <span className="rounded-full bg-brand-1/10 px-2 py-0.5 text-xs font-semibold text-brand-1">{row.grade || "—"}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-stone-600 mb-3">
              <div><span className="text-muted">Qty:</span> {row.qty || "—"} m³</div>
              <div><span className="text-muted">Truck:</span> {row.truckNumber || "—"}</div>
              <div className="col-span-2"><span className="text-muted">Time:</span> {row.created_at ? new Date(row.created_at).toLocaleString() : "—"}</div>
            </div>
            <div className="flex gap-2 pt-1 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(row)}
                icon={<Eye size={13} />}
                className="flex-1 justify-center border-brand-1/40 text-brand-1 hover:border-brand-1"
              >
                View
              </Button>
              {onDeleteDetails && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteDetails(row.id)}
                  icon={<Trash2 size={13} />}
                  className="flex-1 justify-center border-red-500/40 text-red-600 hover:border-red-600 hover:bg-red-50"
                >
                  Delete
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Desktop table (hidden on mobile) ── */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-border">
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
            {rows.map((row, idx) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
