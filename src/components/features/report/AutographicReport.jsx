/**
 * AutographicReport.jsx — Feature component.
 *
 * CDD Layer 3: Modern screen UI + Accurate Classic Print Layout.
 * Updated to match SUPERTECH RMC CHARHOLI layout.
 */
"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Printer, Save } from "lucide-react";
import { reportColumns, groupOrder, MIXER_CAPACITY } from "@/constants/mixConfig";

const LOGO_SRC = "/schwing_stetter_logo_clean_1773223963556.png"; 

// ── Shared Helper Logic ─────────────────────────────────────────────────────

const getTargetDisplay = (colKey, targets) => {
  if (colKey === "moi") return "in%";
  if (colKey === "pm") return "+/-";
  if (colKey === "admix1" || colKey === "admix2") return Number(targets[colKey] || 0).toFixed(2);
  return targets[colKey] || 0;
};

const getActualDisplay = (colKey, val) => {
  if (colKey === "moi") return "0.0";
  if (colKey === "pm") return "0";
  if (colKey === "admix1" || colKey === "admix2") return Number(val || 0).toFixed(2);
  return val || 0;
};

// ── CLASSIC LAYOUT (Used for Printing) ──────────────────────────────────────

function ClassicReportLayout({ entry, targets, reportData }) {
  const productionQty = Number(entry.qty || 0);
  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric"
  }).replace(/ /g, "-");

  return (
    <div className="font-sans text-black tracking-tight text-[11.5px] bg-white print:block print:w-full print:max-w-none print:m-0 print:p-0 max-w-[850px] mx-auto p-4">
      {/* ── HEADER ── */}
      <div className="text-center font-bold text-[18px] mb-2 uppercase">SUPERTECH RMC CHARHOLI</div>
      
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-3">
          <img src={LOGO_SRC} alt="Logo" className="w-[45px] h-[45px] object-contain mix-blend-multiply" />
          <div className="pt-1">
             <div className="font-bold text-[13px] leading-tight text-stone-800">MCI 70 N Control System Ver 3.0</div>
             <div className="text-[10px] font-bold leading-tight mt-0.5 text-stone-700">
                SCHWING<br/>Stetter
             </div>
          </div>
        </div>
      </div>

      <div className="text-center font-bold text-[13px] mb-6 uppercase tracking-wider">
        Docket / Batch Report / AUTOGRAPHIC RECORD
      </div>

      {/* ── INFO SECTION ── */}
      <div className="grid grid-cols-2 gap-x-12 mb-6">
        {/* Left Column */}
        <div className="space-y-0.5">
          <div className="flex"><span className="font-bold w-48">Batch Date</span><span className="w-4">:</span><span>{today}</span></div>
          <div className="flex"><span className="font-bold w-48">Batch Start Time</span><span className="w-4">:</span><span>{entry.batchStart || "00:00:00"}</span></div>
          <div className="flex"><span className="font-bold w-48">Batch End Time</span><span className="w-4">:</span><span>{entry.batchStop || "00:00:00"}</span></div>
          
          <div className="h-4"></div>

          <div className="flex"><span className="font-bold w-48">Batch Number / Docket Number</span><span className="w-4">:</span><span>{entry.docketNo || "0"}</span></div>
          <div className="flex"><span className="font-bold w-48">Customer</span><span className="w-4">:</span><span className="uppercase">{entry.customerName || "—"}</span></div>
          <div className="flex"><span className="font-bold w-48">Site</span><span className="w-4">:</span><span className="uppercase">{entry.site || "—"}</span></div>
          <div className="flex"><span className="font-bold w-48">Recipe Code</span><span className="w-4">:</span><span className="uppercase">{entry.grade || "—"}</span></div>
          <div className="flex"><span className="font-bold w-48">Recipe Name</span><span className="w-4">:</span><span className="uppercase">{entry.grade || "—"}</span></div>
          <div className="flex"><span className="font-bold w-48">Truck Number</span><span className="w-4">:</span><span className="uppercase">{entry.truckNumber || "—"}</span></div>
          <div className="flex"><span className="font-bold w-48">Truck Driver</span><span className="w-4">:</span><span className="uppercase">{entry.truckDriver || "—"}</span></div>
          <div className="flex"><span className="font-bold w-48">Order Number</span><span className="w-4">:</span><span>{entry.grade || "—"}</span></div>
          <div className="flex"><span className="font-bold w-48">Batcher Name</span><span className="w-4">:</span><span>Stetter</span></div>
        </div>

        {/* Right Column */}
        <div className="space-y-0.5 mt-0">
          <div className="flex justify-between w-full pr-12">
            <span className="font-bold">Plant Serial Number</span>
            <span>{entry.plantSN || "3851"}</span>
          </div>
          
          <div className="h-[74px]"></div>

          <div className="flex justify-between w-full pr-12">
            <span className="font-bold">Ordered Quantity</span>
            <div className="flex items-center"><span className="w-4">:</span><span className="w-16 text-right">0.00 M³</span></div>
          </div>
          <div className="flex justify-between w-full pr-12">
            <span className="font-bold">Production Quantity</span>
            <div className="flex items-center"><span className="w-4">:</span><span className="w-16 text-right">{(productionQty || 0).toFixed(2)} M³</span></div>
          </div>
          <div className="flex justify-between w-full pr-12">
            <span className="font-bold">Adj/Manual Quantity</span>
            <div className="flex items-center"><span className="w-4">:</span><span className="w-16 text-right">0.00 M³</span></div>
          </div>
          <div className="flex justify-between w-full pr-12">
            <span className="font-bold">With This Load</span>
            <div className="flex items-center"><span className="w-4">:</span><span className="w-16 text-right">{(productionQty || 0).toFixed(2)} M³</span></div>
          </div>
          <div className="flex justify-between w-full pr-12">
            <span className="font-bold">Mixer Capacity</span>
            <div className="flex items-center"><span className="w-4">:</span><span className="w-16 text-right">{MIXER_CAPACITY.toFixed(2)} M³</span></div>
          </div>
          <div className="flex justify-between w-full pr-12">
            <span className="font-bold">Batch Size</span>
            <div className="flex items-center"><span className="w-4">:</span><span className="w-16 text-right">{MIXER_CAPACITY.toFixed(2)} M³</span></div>
          </div>
        </div>
      </div>


        {/* Table representation matching photo */}
        <table className="w-full text-[11px] border-collapse border-spacing-0 mb-4">
          <thead>
            {/* Group headers */}
            <tr>
              {groupOrder.map(g => {
                const len = reportColumns.filter(c => c.group === g).length;
                const label = g === "Silica" ? "MS / ICE" : g;
                return <th key={g} colSpan={len} className="font-bold text-center pb-1 text-[12px]">{label}</th>
              })}
            </tr>
            {/* Column headers */}
            <tr className="border-b-[1px] border-black">
              {reportColumns.map((c, i) => <th key={c.key} className={`font-normal text-center pb-2 whitespace-nowrap px-1 ${i===0?'text-left pl-1':''}`}>{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {/* 1. Targets row section */}
            <tr>
              <td colSpan={reportColumns.length} className="font-normal pt-2 pl-1 leading-none">Targets based on batchsize in</td>
            </tr>
            <tr className="border-b-[1px] border-black">
              {reportColumns.map((col, idx) => (
                <td key={col.key} className={`text-center py-1.5 ${idx===0?'text-left pl-1':''}`}>
                  {idx === 0 ? <><span className="font-bold pr-1">Kgs.</span>{getTargetDisplay(col.key, targets)}</> : getTargetDisplay(col.key, targets)}
                </td>
              ))}
            </tr>
            
            {/* 2. Actuals section */}
            <tr>
              <td colSpan={reportColumns.length} className="font-normal pt-2 pl-1 leading-none">Actual in Kgs.</td>
            </tr>
            {reportData.rows.map((r, idx) => (
              <tr key={idx}>
                {reportColumns.map((c, i) => (
                  <td key={c.key} className={`text-center font-normal py-0.5 ${i===0?'text-left pl-1':''}`}>
                    {getActualDisplay(c.key, r[c.key])}
                  </td>
                ))}
              </tr>
            ))}

            {/* 3. Total Set Weight section */}
            <tr className="border-t-[1px] border-black">
              <td colSpan={reportColumns.length} className="font-normal pt-2 pl-1 leading-none">Total Set Weight in Kgs.</td>
            </tr>
            <tr className="font-bold text-center">
              {reportColumns.map((col, i) => {
                if (col.key === "moi" || col.key === "pm") return <td key={col.key}></td>;
                let st = targets[col.key] ? Number(targets[col.key]) : 0;
                let display = Math.round(st * (reportData.totalBatches || 0));
                if (col.key === "admix1" || col.key === "admix2") display = (st * (reportData.totalBatches || 0)).toFixed(2);
                return <td key={col.key} className={`py-1.5 ${i===0?'text-left pl-1':''}`}>{display}</td>;
              })}
            </tr>

            {/* 4. Total Actual section */}
            <tr className="border-t-[1px] border-black">
              <td colSpan={reportColumns.length} className="font-normal pt-2 pl-1 leading-none">Total Actual in Kgs.</td>
            </tr>
            <tr className="font-bold border-b-[1px] border-black text-center mb-2">
              {reportColumns.map((col, i) => {
                if (col.key === "moi" || col.key === "pm") return <td key={col.key} className="pb-1"></td>;
                const val = reportData.totals[col.key] || 0;
                const act = col.key.includes("admix") ? Number(val).toFixed(2) : Math.round(val);
                return <td key={col.key} className={`pb-2 ${i===0?'text-left pl-1':''}`}>{act}</td>;
              })}
            </tr>
          </tbody>
        </table>
        
        <div className="flex justify-between mt-8 px-4 text-[12px] font-bold">
            <div>Operator Signature</div>
            <div>Customer Signature</div>
        </div>
    </div>
  );
}

// ── MODERN SCREEN UI (REPORT TAB) ───────────────────────────────────────────

export function AutographicReport({ entry, targets, reportData, onPrint, onSaveToHistory, hideActions = false, onUpdateField }) {
  const productionQty = Number(entry.qty || 0);
  const today = new Date().toLocaleDateString("en-GB", { 
    day: "2-digit", 
    month: "short", 
    year: "numeric" 
  }).replace(/ /g, "-");

  return (
    <>
      <div className="print:hidden">
        <Card>
          <div className="mb-6 flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                SUPERTECH RMC CHARHOLI
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-brand-1">
                Autographic Record
              </h2>
            </div>
            {!hideActions && (
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-border bg-surface px-5 py-2 text-sm hidden sm:block">
                  <p className="text-[10px] uppercase tracking-widest text-muted">Plant S/N</p>
                  {onUpdateField ? (
                    <div className="flex items-center gap-1">
                      <input 
                        type="text"
                        className="bg-transparent font-semibold border-none focus:outline-none focus:ring-1 focus:ring-brand-1/20 w-24 text-lg p-0"
                        value={entry.plantSN ?? ""}
                        onChange={(e) => onUpdateField("plantSN", e.target.value)}
                      />
                    </div>
                  ) : (
                    <p className="mt-0.5 text-lg font-semibold text-foreground">{entry.plantSN || "3851"}</p>
                  )}
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
            )}
          </div>

          <div className="mb-8 grid gap-8 md:grid-cols-2">
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
                ["Production Quantity", `${(productionQty || 0).toFixed(2)} m³`],
                ["Adj/Manual Quantity", "0.00 m³"],
                ["With This Load", `${(productionQty || 0).toFixed(2)} m³`],
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

          {/* Records Table Preview */}
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="min-w-full border-separate border-spacing-0 text-xs">
              <thead>
                <tr className="bg-surface text-stone-600">
                  <th className="px-3 py-2 text-left"> </th>
                  {groupOrder.map((group) => {
                    const span = reportColumns.filter((c) => c.group === group).length;
                    return (
                      <th key={group} colSpan={span} className="px-3 py-2 text-xs font-semibold uppercase tracking-widest text-center border-l border-border first:border-l-0">
                        {group}
                      </th>
                    );
                  })}
                </tr>
                <tr className="bg-brand-1 text-white text-center">
                  <th className="px-3 py-2 text-left text-[11px] uppercase tracking-widest">Batch</th>
                  {reportColumns.map((col) => (
                    <th key={col.key} className="px-3 py-2 text-[11px] uppercase tracking-widest text-center">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white text-center">
                  <td className="border-b border-border px-3 py-2 font-semibold text-stone-700 text-left">Targets</td>
                  {reportColumns.map((col) => (
                    <td key={col.key} className="border-b border-border px-3 py-2">
                      {getTargetDisplay(col.key, targets)}
                    </td>
                  ))}
                </tr>
                {reportData.rows.map((row) => (
                  <tr key={row.id} className={`text-center ${row.id % 2 === 0 ? "bg-white" : "bg-stone-50/50"}`}>
                    <td className="border-b border-border px-3 py-2 font-semibold text-brand-1 text-left">{row.id}</td>
                    {reportColumns.map((col) => (
                      <td key={col.key} className="border-b border-border px-3 py-2">
                        {getActualDisplay(col.key, row[col.key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot className="text-center font-bold">
                <tr className="bg-surface text-stone-800">
                  <td className="px-3 py-3 text-left">Total Set Weight</td>
                  {reportColumns.map((col) => {
                    if (col.key === "moi" || col.key === "pm") return <td key={col.key}></td>;
                    let st = targets[col.key] ? Number(targets[col.key]) : 0;
                    let display = Math.round(st * (reportData.totalBatches || 0));
                    if (col.key === "admix1" || col.key === "admix2") display = (st * (reportData.totalBatches || 0)).toFixed(2);
                    return <td key={col.key} className="px-3 py-3">{display === 0 ? "0" : display}</td>;
                  })}
                </tr>
                <tr className="bg-white text-brand-1">
                  <td className="px-3 py-3 text-left border-t border-border">Total Actual</td>
                  {reportColumns.map((col) => {
                    if (col.key === "moi" || col.key === "pm") return <td key={col.key} className="px-3 py-3 border-t border-border"></td>;
                    const val = reportData.totals[col.key] || 0;
                    const act = col.key.includes("admix1") || col.key.includes("admix2") ? Number(val).toFixed(2) : Math.round(val);
                    return (
                      <td key={col.key} className="px-3 py-3 border-t border-border">
                        {act}
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

// ── HIDDEN PRINT UI ── //
export function HiddenPrintReport({ entry, targets, reportData }) {
  return (
    <div className="hidden print:block">
      <ClassicReportLayout entry={entry} targets={targets} reportData={reportData} />
    </div>
  );
}
