/**
 * AutographicReport.jsx — Feature component.
 *
 * CDD Layer 3: Reverted screen UI to match the application's modern look.
 * Added a hidden print-ready version that follows the SCHWING Stetter format exactly.
 */
"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Printer, Save } from "lucide-react";
import { reportColumns, groupOrder, MIXER_CAPACITY } from "@/constants/mixConfig";

const LOGO_SRC = "/schwing_stetter_logo_clean_1773223963556.png"; 

// Helper for Target row display specifics
const getTargetDisplay = (colKey, targets) => {
  if (colKey === "moi") return "in%";
  if (colKey === "pm") return "+/-";
  if (colKey === "zero3") return "   "; // Blank cell in print for targets
  if (colKey === "zero1" || colKey === "zero2" || colKey === "zero4") return "0";
  if (colKey === "admix1" || colKey === "admix2") return Number(targets[colKey] || 0).toFixed(2);
  return targets[colKey] || 0;
};

// Helper for Actual row display specifics
const getActualDisplay = (colKey, val) => {
  if (colKey === "moi") return "0.0";
  if (colKey === "pm") return "0";
  if (colKey === "zero1" || colKey === "zero2" || colKey === "zero3" || colKey === "zero4") return "0";
  if (colKey === "admix1" || colKey === "admix2") return Number(val || 0).toFixed(2);
  return val || 0;
};

export function AutographicReport({ entry, targets, reportData, onPrint, onSaveToHistory }) {
  const productionQty = Number(entry.qty || 0);
  const today = new Date().toLocaleDateString("en-GB", { 
    day: "2-digit", 
    month: "short", 
    year: "2-digit" 
  }).replace(/ /g, "-");

  return (
    <>
      {/* ── SCREEN UI (Original App Style) ── */}
      <div className="print:hidden">
        <Card>
          <div className="mb-6 flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                Docket / Batch Report
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-brand-1">
                Autographic Record
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-border bg-surface px-5 py-3 text-sm hidden sm:block">
                <p className="text-xs uppercase tracking-widest text-muted">Plant S/N</p>
                <p className="mt-1 text-lg font-semibold text-foreground">3851</p>
              </div>
              {onSaveToHistory && (
                <Button variant="secondary" size="md" onClick={onSaveToHistory} icon={<Save size={14} />}>
                  Save
                </Button>
              )}
              <Button variant="primary" size="md" onClick={onPrint} icon={<Printer size={14} />}>
                Print
              </Button>
            </div>
          </div>

          <div className="mb-8 grid gap-6 md:grid-cols-2">
            <div className="space-y-2 text-sm text-stone-700">
              {[
                ["Batch Date", today],
                ["Batch Start Time", entry.batchStart || "—"],
                ["Batch End Time", entry.batchStop || "—"],
                ["Batch Number / Docket No", entry.docketNo],
                ["Customer", entry.customerName],
                ["Site", entry.site],
                ["Recipe Code", entry.grade],
                ["Truck Number", entry.truckNumber],
                ["Truck Driver", entry.truckDriver],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-border/50 pb-1 last:border-0">
                  <span className="text-muted">{label}</span>
                  <span className="font-semibold">{value || "—"}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm text-stone-700">
              {[
                ["Ordered Quantity", "0.00 m³"],
                ["Production Quantity", `${productionQty.toFixed(2)} m³`],
                ["Adj/Manual Quantity", "0.00 m³"],
                ["With This Load", `${productionQty.toFixed(2)} m³`],
                ["Mixer Capacity", `${MIXER_CAPACITY.toFixed(2)} m³`],
                ["Batch Size", `${MIXER_CAPACITY.toFixed(2)} m³`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-border/50 pb-1 last:border-0">
                  <span className="text-muted">{label}</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="min-w-full border-separate border-spacing-0 text-xs">
              <thead>
                <tr className="bg-surface text-stone-600">
                  <th className="px-3 py-2 text-left"> </th>
                  {groupOrder.map((group) => {
                    const span = reportColumns.filter((c) => c.group === group).length;
                    return (
                      <th key={group} colSpan={span} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-widest">
                        {group}
                      </th>
                    );
                  })}
                </tr>
                <tr className="bg-brand-1 text-white">
                  <th className="px-3 py-2 text-left text-[11px] uppercase tracking-widest">Batch</th>
                  {reportColumns.map((col) => (
                    <th key={col.key} className="px-3 py-2 text-left text-[11px] uppercase tracking-widest">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="border-b border-border px-3 py-2 font-semibold text-stone-700">Targets</td>
                  {reportColumns.map((col) => (
                    <td key={col.key} className="border-b border-border px-3 py-2">
                      {getTargetDisplay(col.key, targets)}
                    </td>
                  ))}
                </tr>
                {reportData.rows.map((row) => (
                  <tr key={row.id} className={row.id % 2 === 0 ? "bg-white" : "bg-[#fffdf9]"}>
                    <td className="border-b border-border px-3 py-2 font-semibold text-brand-1">{row.id}</td>
                    {reportColumns.map((col) => (
                      <td key={col.key} className="border-b border-border px-3 py-2">
                        {getActualDisplay(col.key, row[col.key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-surface font-semibold text-stone-700">
                  <td className="px-3 py-2">Total Set Weight</td>
                  {reportColumns.map((col) => {
                    let st = targets[col.key] ? Number(targets[col.key]) : 0;
                    if (col.key === "moi" || col.key === "pm" || col.key === "zero1" || col.key === "zero2" || col.key === "zero3" || col.key === "zero4") st = 0;
                    let display = Math.round(st * reportData.totalBatches);
                    if (col.key === "admix1" || col.key === "admix2") display = (st * reportData.totalBatches).toFixed(2);
                    return <td key={col.key} className="px-3 py-2">{display === 0 ? "0" : display}</td>;
                  })}
                </tr>
                <tr className="bg-brand-2/20 font-semibold text-stone-700">
                  <td className="px-3 py-2">Total Actual</td>
                  {reportColumns.map((col) => {
                    if (col.key === "moi" || col.key === "pm" || col.key === "zero1" || col.key === "zero2" || col.key === "zero3" || col.key === "zero4") return <td key={col.key} className="px-3 py-2">0</td>;
                    return (
                      <td key={col.key} className="px-3 py-2">
                        {col.key.includes("admix") ? reportData.totals[col.key].toFixed(2) : Math.round(reportData.totals[col.key])}
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}

// ── HIDDEN PRINT UI (Exact Schwing Stetter Match) ── //
// Exported separately so it can be mounted at the app root unaffected by layout animations
export function HiddenPrintReport({ entry, targets, reportData }) {
  const productionQty = Number(entry.qty || 0);
  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "2-digit"
  }).replace(/ /g, "-");

  return (
    <div className="hidden print:block font-sans text-[11px] uppercase text-black leading-snug tracking-tight">
      {/* Top Header */}
      <div className="text-center font-bold text-lg mb-2 pt-2 tracking-wide">JANAI INFRACON</div>
        
        <div className="relative mb-6">
          <div className="absolute left-0 top-0 flex items-start flex-col gap-1">
            <div className="border border-black p-0.5 ml-2">
              <img src="/schwing_stetter_logo_clean_1773223963556.png" alt="Logo" className="w-[50px] mix-blend-multiply" />
            </div>
            <div className="text-[9px] font-bold leading-none text-center">
              SCHWING<br/><span className="mt-0.5 block font-normal">Stetter</span>
            </div>
          </div>
          <div className="absolute left-[110px] top-4 font-bold text-xs tracking-wide">
            MCI 370 Control System Ver 3.1
          </div>
          <div className="text-center font-bold text-[13px] pt-14">
            Docket / Batch Report / AUTOGRAPHIC RECORD
          </div>
        </div>

        {/* Info Block 1 */}
        <div className="flex justify-between font-bold text-[11px] mb-2">
          <div className="space-y-[2px]">
            <div className="flex"><span className="w-48">Batch Date</span><span className="mr-2">:</span><span className="font-normal">{today}</span></div>
            <div className="flex"><span className="w-48">Batch Start Time</span><span className="mr-2">:</span><span className="font-normal">{entry.batchStart || "12:00:00 AM"}</span></div>
            <div className="flex"><span className="w-48">Batch End Time</span><span className="mr-2">:</span><span className="font-normal">{entry.batchStop || "12:00:00 AM"}</span></div>
          </div>
          <div className="space-y-[2px] pr-12">
            <div className="flex"><span className="w-48">Plant Serial Number</span><span className="font-normal text-right">3851</span></div>
          </div>
        </div>

        {/* Info Block 2 */}
        <div className="flex justify-between font-bold text-[11px] mb-4">
          <div className="space-y-[2px]">
            <div className="flex"><span className="w-48">Batch Number / Docket Number</span><span className="mr-2">:</span><span className="font-normal">{entry.docketNo || "0"}</span></div>
            <div className="flex"><span className="w-48">Customer</span><span className="mr-2">:</span><span className="font-normal">{entry.customerName || "0"}</span></div>
            <div className="flex"><span className="w-48">Site</span><span className="mr-2">:</span><span className="font-normal">{entry.site || "0"}</span></div>
            <div className="flex"><span className="w-48">Recipe Code</span><span className="mr-2">:</span><span className="font-normal">{entry.grade || "0"}</span></div>
            <div className="flex"><span className="w-48">Recipe Name</span><span className="mr-2">:</span><span className="font-normal">{entry.grade || "0"}</span></div>
            <div className="flex"><span className="w-48">Truck Number</span><span className="mr-2">:</span><span className="font-normal">{entry.truckNumber || "0"}</span></div>
            <div className="flex"><span className="w-48">Truck Driver</span><span className="mr-2">:</span><span className="font-normal">{entry.truckDriver || "0"}</span></div>
            <div className="flex"><span className="w-48">Order Number</span><span className="mr-2">:</span><span className="font-normal">{entry.grade || "0"}</span></div>
            <div className="flex"><span className="w-48">Batcher Name</span><span className="mr-2">:</span><span className="font-normal">Stetter</span></div>
          </div>
          <div className="space-y-[2px] pr-12">
            <div className="flex"><span className="w-40">Ordered Quantity</span><span className="mr-2">:</span><span className="font-normal">0.00 M³</span></div>
            <div className="flex"><span className="w-40">Production Quantity</span><span className="mr-2">:</span><span className="font-normal">{productionQty.toFixed(2)} M³</span></div>
            <div className="flex"><span className="w-40">Adj/Manual Quantity</span><span className="mr-2">:</span><span className="font-normal">0.00 M³</span></div>
            <div className="flex"><span className="w-40">With This Load</span><span className="mr-2">:</span><span className="font-normal">{productionQty.toFixed(2)} M³</span></div>
            <div className="flex"><span className="w-40">Mixer Capacity</span><span className="mr-2">:</span><span className="font-normal">{MIXER_CAPACITY.toFixed(2)} M³</span></div>
            <div className="flex"><span className="w-40">Batch Size</span><span className="mr-2">:</span><span className="font-normal">{MIXER_CAPACITY.toFixed(2)} M³</span></div>
          </div>
        </div>

        {/* Table representation matching 15-columns */}
        <table className="w-full text-[11px] leading-[1.3] mt-2 border-collapse border-spacing-0">
          <thead>
            {/* Group headers */}
            <tr>
              <th className="w-10"></th>
              {groupOrder.map(g => {
                const len = reportColumns.filter(c => c.group === g).length;
                return <th key={g} colSpan={len} className="font-bold text-center pl-2">{g}</th>
              })}
            </tr>
            {/* Column headers */}
            <tr>
              <th></th>
              {reportColumns.map(c => <th key={c.key} className="font-normal text-center whitespace-nowrap">{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={reportColumns.length + 1} className="font-normal normal-case pt-2">Targets based on batchsize in</td>
            </tr>
            <tr className="border-b border-black">
              <td className="font-normal text-left pb-1">Kgs.</td>
              {reportColumns.map(col => (
                <td key={col.key} className="text-center font-normal pb-1">
                  {getTargetDisplay(col.key, targets)}
                </td>
              ))}
            </tr>
            
            {/* Actuals */}
            <tr>
              <td colSpan={reportColumns.length + 1} className="font-normal normal-case pt-1">Actual in Kgs.</td>
            </tr>
            {reportData.rows.map((r, idx) => (
              <tr key={idx}>
                <td></td>
                {reportColumns.map(c => (
                  <td key={c.key} className={`text-center font-normal ${idx === reportData.rows.length - 1 ? "pb-[6px]" : ""}`}>
                    {getActualDisplay(c.key, r[c.key])}
                  </td>
                ))}
              </tr>
            ))}
            
            {/* Total Set Weight */}
            <tr className="border-t border-black">
              <td colSpan={reportColumns.length + 1} className="font-normal normal-case pt-1">Total Set Weight in Kgs.</td>
            </tr>
            <tr>
              <td></td>
              {reportColumns.map(col => {
                if (col.key === "moi" || col.key === "pm" || col.key === "zero3" || col.key === "zero4") {
                  return <td key={col.key}></td>; // leave blank purely for layout
                }
                if (col.key === "zero1" || col.key === "zero2") {
                  return <td key={col.key} className="text-center font-normal">0</td>;
                }
                let st = targets[col.key] ? Number(targets[col.key]) : 0;
                let display = Math.round(st * reportData.totalBatches);
                if (col.key === "admix1" || col.key === "admix2") {
                   display = (st * reportData.totalBatches).toFixed(2);
                   return <td key={col.key} className="text-center font-normal">{display === "0.00" || display === 0 ? "0.00" : display}</td>;
                }
                return <td key={col.key} className="text-center font-normal">{display}</td>;
              })}
            </tr>

            {/* Total Actual */}
            <tr>
              <td colSpan={reportColumns.length + 1} className="font-normal normal-case pt-3 pb-1">Total Actual in Kgs</td>
            </tr>
            <tr className="border-b border-black">
              <td className="pb-1"></td>
              {reportColumns.map(col => {
                if (col.key === "moi" || col.key === "pm" || col.key === "zero3") {
                   return <td key={col.key} className="pb-1"></td>;
                }
                if (col.key === "zero1" || col.key === "zero2" || col.key === "zero4") {
                  return <td key={col.key} className="pb-1 text-center font-normal border-b border-black">0</td>;
                }
                const act = col.key.includes("admix") ? reportData.totals[col.key].toFixed(2) : Math.round(reportData.totals[col.key]);
                return <td key={col.key} className="text-center font-normal pb-1 border-b border-black">{act}</td>;
              })}
            </tr>
          </tbody>
        </table>
    </div>
  );
}
