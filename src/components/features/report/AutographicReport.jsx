import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Printer, Save } from "lucide-react";
import { toast } from "sonner";
import { reportColumns, groupOrder } from "@/constants/mixConfig";

const LOGO_SRC = "/report_logo.jpg";

// ── Shared Helper Logic ─────────────────────────────────────────────────────

const getTargetDisplay = (colKey, targets) => {
  if (colKey === "admix1" || colKey === "admix2") return Number(targets[colKey] || 0).toFixed(2);
  return targets[colKey] || 0;
};

const getActualDisplay = (colKey, val) => {
  if (colKey === "moi") return "0.0";
  if (colKey === "pm") return "0";
  if (colKey === "admix1" || colKey === "admix2") return Number(val || 0).toFixed(2);
  return val || 0;
};

// ── CLASSIC LAYOUT (The actual document design) ─────────────────────────────

function ClassicReportLayout({ entry, targets, reportData, batchSize = 0.5 }) {
  const productionQty = Number(entry.qty || 0);
  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric"
  }).replace(/ /g, "-");

  return (
    <div className="bg-white text-black print:block print:m-0 print:p-0">
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .a4-print-container {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 8mm 6mm 5mm 6mm;
            box-sizing: border-box;
            background: white;
            color: black;
          }
        }
        
        .a4-print-container {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          padding: 8mm 6mm 5mm 6mm;
          font-family: "Times New Roman", Times, serif;
          font-size: 9pt;
          line-height: 1.2;
          letter-spacing: 0px;
          box-sizing: border-box;
          color: black;
          background: white;
          text-align: left;
        }

        .rep-header-main {
          text-align: center;
          font-weight: bold;
          font-size: 16pt;
          margin-bottom: 2mm;
          text-transform: uppercase;
          font-family: "Times New Roman", Times, serif;
          letter-spacing: 0.5px;
        }

        .rep-logo-area {
          display: flex;
          align-items: flex-start;
          margin-bottom: 1mm;
          padding-left: 16mm;
        }

        .rep-logo-col {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 50px;
        }

        .rep-logo-img {
          width: 50px;
          height: 40px;
          object-fit: contain;
          margin-bottom: 1.5mm;
          filter: grayscale(1) contrast(1.2) brightness(1.1);
        }

        .rep-schwing {
          font-weight: bold;
          font-size: 9.5pt;
          line-height: 1.1;
          font-family: "Times New Roman", Times, serif;
        }

        .rep-system-ver {
          font-weight: bold;
          font-size: 12.5pt;
          padding-left: 1mm;
          padding-top: 3.8mm;
          font-family: "Times New Roman", Times, serif;
          letter-spacing: -0.1px;
        }

        .rep-doc-title {
          text-align: center;
          font-weight: bold;
          font-size: 10pt;
          margin: 1mm 0 8mm 0;
          font-family: "Times New Roman", Times, serif;
          letter-spacing: 0.3px;
        }

        .rep-meta-grid {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0mm;
          margin-top: 2mm;
          width: 100%;
        }

        .rep-meta-left {
          width: 121mm;
          flex-shrink: 0;
        }

        .rep-kv-table {
          width: auto;
          border-collapse: collapse;
          table-layout: auto;
        }

        .lower-meta {
          margin-left: 2mm;
          margin-top: 4mm;
        }

        .rep-kv-table td {
          padding: 0.8mm 0;
          vertical-align: top;
          line-height: 1.2;
          font-size: 9pt;
        }

        .rep-kv-table .k {
          font-weight: bold;
          letter-spacing: 0.6px;
          white-space: nowrap;
        }

        .top-meta-k {
          width: 29mm;
          font-weight: bold;
          white-space: nowrap;
          font-family: "Times New Roman", Times, serif;
        }

        .top-meta-s {
          width: 3mm;
          text-align: left;
          font-weight: bold;
        }

        .top-meta-v {
          font-weight: normal;
          display: inline-block;
          white-space: nowrap;
          font-family: "Times New Roman", Times, serif;
        }

        .meta-k {
          width: 50mm;
          font-weight: bold;
          white-space: nowrap;
          font-family: "Times New Roman", Times, serif;
        }

        .meta-s {
          width: 3mm;
          text-align: center;
          font-weight: bold;
        }

        .meta-v {
          font-weight: normal;
          text-transform: uppercase;
          padding-left: 4.5mm;
          display: inline-block;
          white-space: nowrap;
          font-family: "Times New Roman", Times, serif;
        }

        .rep-plant-sn-right {
          text-align: left;
          font-weight: bold;
          font-size: 9.5pt;
          margin-bottom: 2mm;
          margin-top: 0.2mm;
          white-space: nowrap;
          width: max-content;
          transform: translateX(7.5mm) translateY(-4mm);
          font-family: "Times New Roman", Times, serif;
        }

        .rep-plant-sn-right .v {
          font-weight: normal;
          margin-left: 2mm;
        }

        .right-kv {
          table-layout: fixed;
          width: 75mm;
        }

        .qty-k {
          width: 40mm;
          font-weight: bold;
          white-space: nowrap;
          text-align: left;
          transform: translateX(6mm);
          font-family: "Times New Roman", Times, serif;
        }

        .qty-s {
          width: 6mm;
          text-align: left;
          font-weight: bold;
        }

        .qty-v {
          width: 13mm;
          text-align: left;
          white-space: nowrap;
          font-family: "Times New Roman", Times, serif;
        }

        .qty-u {
          width: 14mm;
          text-align: right;
          white-space: nowrap;
          font-family: "Times New Roman", Times, serif;
        }

        .rep-data-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          font-size: 8.5pt;
          margin-top: 2mm;
        }

        .rep-data-table thead th {
          font-weight: bold;
          text-align: center;
          padding: 0.5mm 0.2mm;
          vertical-align: bottom;
          letter-spacing: 0.2px;
        }

        .rep-data-table thead .group-th {
          font-size: 11pt;
          font-weight: bold;
          padding-top: 2mm;
          padding-bottom: 1.5mm;
          letter-spacing: 0.2px;
          font-family: "Times New Roman", Times, serif;
          text-align: center;
        }

        .rep-data-table thead .col-th {
          font-weight: normal;
          font-size: 8.5pt;
          padding-bottom: 1mm;
          line-height: 1.1;
          font-family: "Times New Roman", Times, serif;
          letter-spacing: -0.2px;
        }

        .rep-data-table td {
          text-align: center;
          padding: 0.6mm 0.2mm;
          line-height: 1.1;
          font-size: 8.5pt;
          font-family: "Times New Roman", Times, serif;
        }

        .rep-data-table .label-cell {
          text-align: left;
          font-weight: normal;
          padding-top: 0mm;
          padding-bottom: 0.5mm;
          font-size: 9.5pt;
          font-family: "Times New Roman", Times, serif;
        }

        .rep-data-table .border-top {
          border-top: 1px solid black;
        }

        .rep-data-table .border-bottom {
          border-bottom: 1px solid black;
        }

        .rep-data-table .border-bottom-thin {
          border-bottom: 1px solid black;
        }

        .rep-data-table .targets-row td {
          padding-bottom: 1.5mm;
        }

        .rep-data-table .totals-row td {
          font-weight: normal;
          padding-top: 1mm;
          padding-bottom: 1mm;
        }

        .totals-section-top .label-cell {
          padding-top: 1mm;
        }

        .total-actual-row .label-cell {
          padding-top: 1mm;
        }

        .rep-right-align {
          text-align: right !important;
        }

        .pm-col-shift {
          transform: translateX(-8mm);
        }

        .mm10-col-shift {
          transform: translateX(3mm);
        }

        .moi-col-shift {
          transform: translateX(-3.5mm);
        }

        .col-row-shift {
          transform: translateX(-3.5mm);
        }

        .target-kg-shift {
          transform: translateX(1mm);
        }

        .rep-left-align {
          text-align: left !important;
        }
      `}</style>

      <div className="a4-print-container">
        {/* Header Section */}
        <div className="rep-header-main">{entry.companyName || ""}</div>

        <div className="rep-logo-area">
          <div className="rep-logo-col">
            <img src={LOGO_SRC} alt="Logo" className="rep-logo-img" />
            <div className="rep-schwing mt-2">SCHWING</div>
            <div className="rep-schwing">Stetter</div>
          </div>
          <div className="rep-system-ver">
            MCI 70 N Control System Ver 3.0
          </div>
        </div>

        <div className="rep-doc-title">Docket / Batch Report / Autographic Record</div>

        {/* Metadata Section */}
        <div className="rep-meta-grid">
          {/* Left Metadata */}
          <div className="rep-meta-left">
            <table className="rep-kv-table compact-top">
              <tbody>
                <tr><td className="top-meta-k">Batch Date</td><td className="top-meta-s">:</td><td className="top-meta-v">{today}</td></tr>
                <tr><td className="top-meta-k">Batch Start Time</td><td className="top-meta-s">:</td><td className="top-meta-v">{entry.batchStart || "00:00:00 AM"}</td></tr>
                <tr><td className="top-meta-k">Batch End Time</td><td className="top-meta-s">:</td><td className="top-meta-v">{entry.batchStop || "00:00:00 AM"}</td></tr>
              </tbody>
            </table>

            <table className="rep-kv-table lower-meta">
              <tbody>
                <tr><td className="meta-k">Batch Number / Docket Number</td><td className="meta-s">:</td><td className="meta-v">{entry.docketNo || "0"}</td></tr>
                <tr><td className="meta-k">Customer</td><td className="meta-s">:</td><td className="meta-v">{entry.customerName || "—"}</td></tr>
                <tr><td className="meta-k">Site</td><td className="meta-s">:</td><td className="meta-v">{entry.site || "—"}</td></tr>
                <tr><td className="meta-k">Recipe Code</td><td className="meta-s">:</td><td className="meta-v">{entry.grade || "—"}</td></tr>
                <tr><td className="meta-k">Recipe Name</td><td className="meta-s">:</td><td className="meta-v">{entry.grade || "—"}</td></tr>
                <tr><td className="meta-k">Truck Number</td><td className="meta-s">:</td><td className="meta-v">{entry.truckNumber || "—"}</td></tr>
                <tr><td className="meta-k">Truck Driver</td><td className="meta-s">:</td><td className="meta-v">{entry.truckDriver || "—"}</td></tr>
                <tr><td className="meta-k">Order Number</td><td className="meta-s">:</td><td className="meta-v">-</td></tr>
                <tr><td className="meta-k">Batcher Name</td><td className="meta-s">:</td><td className="meta-v">STETTER</td></tr>
              </tbody>
            </table>
          </div>

          {/* Right Metadata */}
          <div style={{ marginRight: "12mm", marginTop: "4mm" }}>
            <div className="rep-plant-sn-right">
              Plant Serial Number : <span className="v" style={{ fontWeight: 'normal' }}>{entry.plantSN || "—"}</span>
            </div>
            <table className="rep-kv-table right-kv">
              <colgroup>
                <col style={{ width: '43mm' }} />
                <col style={{ width: '6mm' }} />
                <col style={{ width: '13mm' }} />
                <col style={{ width: '18mm' }} />
              </colgroup>
              <tbody>
                <tr style={{ height: "10mm" }}><td></td><td></td><td></td><td></td></tr>
                <tr>
                  <td className="qty-k">Ordered Quantity</td>
                  <td className="qty-s">:</td>
                  <td className="qty-v">0.00</td>
                  <td className="qty-u">M³</td>
                </tr>
                <tr>
                  <td className="qty-k">Production Quantity</td>
                  <td className="qty-s">:</td>
                  <td className="qty-v">{(Number(entry.qty) || 0).toFixed(2)}</td>
                  <td className="qty-u">M³</td>
                </tr>
                <tr>
                  <td className="qty-k">Adj/Manual Quantity</td>
                  <td className="qty-s">:</td>
                  <td className="qty-v">0.00</td>
                  <td className="qty-u">M³</td>
                </tr>
                <tr>
                  <td className="qty-k">With This Load</td>
                  <td className="qty-s">:</td>
                  <td className="qty-v">{(Number(entry.qty) || 0).toFixed(2)}</td>
                  <td className="qty-u">M³</td>
                </tr>
                <tr>
                  <td className="qty-k">Mixer Capacity</td>
                  <td className="qty-s">:</td>
                  <td className="qty-v">{Number(batchSize || 0.5).toFixed(2)}</td>
                  <td className="qty-u">M³</td>
                </tr>
                <tr>
                  <td className="qty-k">Batch Size</td>
                  <td className="qty-s">:</td>
                  <td className="qty-v">{Number(batchSize || 0.5).toFixed(2)}</td>
                  <td className="qty-u">M³</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Data Table Section */}
        <table className="rep-data-table">
          <colgroup><col style={{ width: '11mm' }} /><col style={{ width: '13mm' }} /><col style={{ width: '12mm' }} /><col style={{ width: '14mm' }} /><col style={{ width: '13mm' }} /><col style={{ width: '13mm' }} /><col style={{ width: '13mm' }} /><col style={{ width: '14mm' }} /><col style={{ width: '16mm' }} /><col style={{ width: '7mm' }} /><col style={{ width: '13mm' }} /><col style={{ width: '13mm' }} /><col style={{ width: '13mm' }} /><col style={{ width: '13mm' }} /></colgroup>
          <thead>
            <tr className="group-tr">
              {groupOrder.map(g => {
                const len = reportColumns.filter(c => c.group === g).length;
                const isAggregate = g === "Aggregate";
                return (
                  <th
                    key={g}
                    colSpan={len}
                    className="group-th"
                    style={isAggregate ? { textAlign: 'left', paddingLeft: '25mm' } : {}}
                  >
                    {g}
                  </th>
                );
              })}
            </tr>
            <tr className="col-tr col-row-shift">
              {reportColumns.map((col, i) => {
                let cellContent = col.label;
                if (col.key === "pm") cellContent = "";
                else if (col.key === "water") cellContent = "WATE";

                return (
                  <th
                    key={col.key}
                    className={`col-th ${i === 0 ? "rep-left-align" : ""} ${col.key === "pm" ? "pm-col-shift" : ""} ${col.key === "moi" ? "moi-col-shift" : ""} ${col.key === "mm10" ? "mm10-col-shift" : ""}`}
                  >
                    <div>{cellContent}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <tr><td colSpan={reportColumns.length} className="label-cell">Targets based on batchsize in</td></tr>
            <tr className="targets-row border-bottom-thin">
              {reportColumns.map((col, i) => (
                <td
                  key={col.key}
                  className={`${i === 0 ? "rep-left-align target-kg-shift" : ""} ${col.key === "pm" ? "pm-col-shift" : ""} ${col.key === "moi" ? "moi-col-shift" : ""} ${col.key === "mm10" ? "mm10-col-shift" : ""}`}
                >
                  {i === 0 && <span style={{ marginRight: "-1.5mm", fontWeight: 'normal' }}>Kgs.</span>}
                  {col.key === "moi" && <span style={{ marginRight: '1mm', fontWeight: 'normal' }}>in %</span>}
                  {col.key === "pm" && <span style={{ marginRight: '1mm', fontWeight: 'normal' }}>+/-</span>}
                  {getTargetDisplay(col.key, targets)}
                </td>
              ))}
            </tr>

            <tr><td colSpan={reportColumns.length} className="label-cell">Actual in Kgs.</td></tr>
            {reportData.rows.map((row, idx) => (
              <tr key={idx}>
                {reportColumns.map((col, i) => (
                  <td
                    key={col.key}
                    className={`${i === 0 ? "rep-left-align" : ""} ${col.key === "pm" ? "pm-col-shift" : ""} ${col.key === "moi" ? "moi-col-shift" : ""} ${col.key === "mm10" ? "mm10-col-shift" : ""}`}
                  >
                    {getActualDisplay(col.key, row[col.key])}
                  </td>
                ))}
              </tr>
            ))}

            <tr className="totals-section-top border-top"><td colSpan={reportColumns.length} className="label-cell">Total Set Weight in Kgs.</td></tr>
            <tr className="totals-row">
              {reportColumns.map((col, i) => {
                const isPlaceholder = col.key === "moi" || col.key === "pm";
                const sw = isPlaceholder ? null : (reportData.setWeights?.[col.key] ?? ((Number(targets[col.key]) || 0) * (reportData.totalBatches || 0)));
                const display = isPlaceholder ? null : ((col.key.includes("admix")) ? Number(sw).toFixed(2) : Math.round(sw));
                return (
                  <td
                    key={col.key}
                    className={`${i === 0 ? "rep-left-align" : ""} ${col.key === "pm" ? "pm-col-shift" : ""} ${col.key === "moi" ? "moi-col-shift" : ""} ${col.key === "mm10" ? "mm10-col-shift" : ""}`}
                  >
                    {display}
                  </td>
                );
              })}
            </tr>

            <tr style={{ height: '1mm' }}><td colSpan={reportColumns.length}></td></tr>

            <tr className="total-actual-row"><td colSpan={reportColumns.length} className="label-cell">Total Actual in Kgs.</td></tr>
            <tr className="totals-row border-bottom">
              {reportColumns.map((col, i) => {
                const isPlaceholder = col.key === "moi" || col.key === "pm";
                const val = isPlaceholder ? null : (reportData.totals[col.key] || 0);
                const act = isPlaceholder ? null : (col.key.includes("admix") ? Number(val).toFixed(2) : Math.round(val));
                return (
                  <td
                    key={col.key}
                    className={`${i === 0 ? "rep-left-align" : ""} ${col.key === "pm" ? "pm-col-shift" : ""} ${col.key === "moi" ? "moi-col-shift" : ""} ${col.key === "mm10" ? "mm10-col-shift" : ""}`}
                  >
                    {act}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── SCREEN UI (REPORT TAB) ──────────────────────────────────────────────────

export function AutographicReport({
  entry,
  targets,
  reportData,
  batchSize = 0.5,
  onPrint,
  onSaveToHistory,
  hideActions = false,
  onUpdateField
}) {
  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="print:hidden">
        {/* Modern Sticky Header for Actions */}
        <div className="sticky top-0 z-30 mb-8 flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-border bg-white/80 p-4 shadow-sm backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1">Company Name</p>
              {onUpdateField ? (
                <input
                  type="text"
                  className="text-base font-extrabold tracking-widest text-brand-1 bg-transparent border-b border-border focus:outline-none focus:border-brand-1/40 p-0 w-full min-w-[280px] uppercase"
                  value={entry.companyName ?? ""}
                  placeholder="ENTER COMPANY NAME..."
                  onChange={(e) => onUpdateField("companyName", e.target.value)}
                />
              ) : (
                <p className="text-base font-extrabold tracking-widest text-brand-1 uppercase">
                  {entry.companyName || "(No Company Name)"}
                </p>
              )}
            </div>

            <div className="h-10 w-px bg-border hidden sm:block" />

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1">Plant S/N</p>
              {onUpdateField ? (
                <input
                  type="text"
                  className="bg-transparent font-extrabold border-b border-border focus:outline-none focus:border-brand-1/40 w-24 text-base p-0 text-brand-1 uppercase"
                  value={entry.plantSN ?? ""}
                  onChange={(e) => onUpdateField("plantSN", e.target.value)}
                />
              ) : (
                <p className="text-base font-extrabold text-brand-1 uppercase">{entry.plantSN || "—"}</p>
              )}
            </div>
          </div>

          {!hideActions && (
            <div className="flex items-center gap-3">
              <Button variant="primary" size="md" onClick={onPrint} icon={<Printer size={14} />} className="rounded-xl bg-brand-1 hover:bg-brand-1/90 shadow-lg shadow-brand-1/20 transition-all active:scale-95">
                Print Report
              </Button>
            </div>
          )}
        </div>

        {/* The Digital Twin Preview */}
        <div className="flex justify-center overflow-x-auto p-4 md:p-10 bg-stone-100/50 rounded-3xl border border-dashed border-stone-200">
          <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-stone-900/5 rounded-sm origin-top scale-90 sm:scale-100">
             <ClassicReportLayout 
               entry={entry} 
               targets={targets} 
               reportData={reportData} 
               batchSize={batchSize} 
             />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── HIDDEN PRINT UI ── //
export function HiddenPrintReport({ entry, targets, reportData, batchSize }) {
  return (
    <div className="hidden print:block">
      <ClassicReportLayout entry={entry} targets={targets} reportData={reportData} batchSize={batchSize} />
    </div>
  );
}
