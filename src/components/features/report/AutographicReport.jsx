import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Printer, Save } from "lucide-react";
import { toast } from "sonner";
import { reportColumns, groupOrder } from "@/constants/mixConfig";
import { useReportData } from "@/hooks/useReportData";

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

// ── CLASSIC LAYOUT (Used for Printing) ──────────────────────────────────────

function ClassicReportLayout({ entry, targets, reportData, batchSize = 0.5 }) {
  const productionQty = Number(entry.qty || 0);
  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric"
  }).replace(/ /g, "-");

  const bSize = Number(batchSize || 0.5);

  return (
    <div className="bg-white text-black">
      <style>{`
        /* ── RESET ALL TRANSFORMS ON PRINT ── */
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 6mm 6mm 6mm;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }

          /* Kill every transform/scale that screen preview uses */
          * {
            transform: none !important;
            -webkit-transform: none !important;
          }

          .a4-print-container {
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            background: white !important;
            color: black !important;
            font-size: 8pt !important;
            font-weight: 400 !important;
            -webkit-text-stroke: 0px black !important;
          }

          .rep-header-main {
            font-size: 12.5pt !important;
            font-weight: 900 !important;
            -webkit-text-stroke: 0px black !important;
          }

          .rep-system-ver {
            font-size: 12pt !important;
            font-weight: 900 !important;
            -webkit-text-stroke: 0.1px black !important;
          }

          .rep-doc-title {
            font-size: 9.5pt !important;
            font-weight: 900 !important;
            -webkit-text-stroke: 0.2px black !important;
          }

          .rep-kv-table td {
            font-size: 8.2pt !important;
            font-weight: 400 !important;
            -webkit-text-stroke: 0.1px black !important;
          }

          .rep-kv-table td.top-meta-k,
          .rep-kv-table td.meta-k,
          .rep-kv-table td.qty-k,
          .rep-kv-table .k {
            font-weight: 800 !important;
            -webkit-text-stroke: 0.1px black !important;
          }

          .rep-plant-sn-right {
            font-size: 10pt !important;
            font-weight: 800 !important;
            -webkit-text-stroke: 0.1px black !important;
          }

          .rep-data-table {
            font-size: 8.5pt !important;
            -webkit-text-stroke: 0.1px black !important;
          }

          .rep-data-table thead .group-th {
            font-size: 12pt !important;
            font-weight: 900 !important;
            -webkit-text-stroke: 0.1px black !important;
          }

          .rep-data-table thead .col-th {
            font-size: 10pt !important;
            font-weight: 400 !important;
            -webkit-text-stroke: 0.1px black !important;
          }

          .rep-data-table .label-cell {
            font-size: 8pt !important;
            font-weight: 400 !important;
            -webkit-text-stroke: 0.1px black !important;
          }

          .rep-data-table .totals-row td {
            font-weight: 400 !important;
            -webkit-text-stroke: 0px black !important;
          }

          .rep-schwing {
            font-size: 8pt !important;
            font-weight: 900 !important;
          }

          .rep-logo-img {
            filter: grayscale(1) contrast(1.6) brightness(0.85) !important;
          }
        }

        /* ── SCREEN STYLES (preview only) ── */
        .a4-print-container {
          width: 210mm;
          max-width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          padding: 8mm 6mm 5mm 6mm;
          font-family: "Times New Roman", Times, serif;
          font-size: 8pt;
          font-weight: 400;
          line-height: 1.15;
          letter-spacing: 0px;
          box-sizing: border-box;
          color: black;
          -webkit-text-stroke: 0px black;
        }

        .rep-header-main {
          text-align: center;
          font-weight: 900;
          font-size: 12.5pt;
          margin-bottom: 1mm;
          text-transform: uppercase;
          -webkit-text-stroke: 0.5px black;
        }

        .rep-logo-area {
          display: flex;
          align-items: flex-start;
          margin-bottom: 1mm;
          padding-left: 6mm;
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
          filter: grayscale(1) contrast(1.6) brightness(0.85);
        }

        .rep-schwing {
          font-weight: 900;
          font-size: 9pt;
          line-height: 1.1;
          -webkit-text-stroke: 0.3px black;
        }

        .rep-system-ver {
          font-weight: 900;
          font-size: 10pt;
          padding-left: 1mm;
          padding-top: 3.8mm;
          letter-spacing: -0.1px;
          -webkit-text-stroke: 0.4px black;
        }

        .rep-doc-title {
          text-align: center;
          font-weight: 900;
          font-size: 9.5pt;
          margin: 0.5mm 0 4mm 0;
          letter-spacing: 0.3px;
          -webkit-text-stroke: 0.2px black;
        }

        .rep-meta-grid {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0mm;
          margin-top: 1mm;
          width: 100%;
        }

        .rep-meta-left {
          width: 100mm;
          flex-shrink: 0;
        }

        .rep-kv-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .lower-meta {
          margin-left: 2mm;
          margin-top: 2mm;
        }

        .rep-kv-table td {
          padding: 0.4mm 0;
          vertical-align: top;
          font-size: 8.2pt;
          font-weight: 400;
        }

        .rep-kv-table .k {
          font-weight: 900;
          letter-spacing: 0.2px;
          white-space: nowrap;
        }

        .top-meta-k {
          width: 28mm;
          font-weight: 800;
          -webkit-text-stroke: 0.1px black;
          white-space: nowrap;
        }

        .top-meta-s {
          width: 2mm;
          text-align: left;
          font-weight: 400;
          -webkit-text-stroke: 0.1px black;
        }

        .top-meta-v {
          font-weight: 400;
          white-space: nowrap;
          -webkit-text-stroke: 0.1px black;
        }

        .meta-k {
          width: 48mm;
          font-weight: 800;
          -webkit-text-stroke: 0.1px black;
          white-space: nowrap;
        }

        .meta-s {
          width: 2mm;
          text-align: center;
          font-weight: 400;
          -webkit-text-stroke: 0.1px black;
        }

        .meta-v {
          font-weight: 400;
          -webkit-text-stroke: 0.1px black;
          text-transform: uppercase;
          transform: translateX(1mm);
          display: inline-block;
          white-space: nowrap;
        }

        .rep-plant-sn-right {
          font-size: 10pt;
          font-weight: 800;
          -webkit-text-stroke: 0.1px black;
          margin-bottom: 1mm;
          margin-top: 0.2mm;
          white-space: nowrap;
          width: max-content;
          transform: translateY(-4mm);
        }

        .rep-plant-sn-right .v {
          font-weight: 400;
          margin-left: 2mm;
          -webkit-text-stroke: 0.1px black;
        }

        .right-kv {
          width: 78mm;
          table-layout: fixed;
          border-collapse: collapse;
        }

        .qty-k {
          width: 41mm;
          font-weight: 800;
          -webkit-text-stroke: 0.1px black;
          white-space: nowrap;
          text-align: left;
          transform: translateX(4mm);
        }

        .qty-s {
          width: 3mm;
          text-align: left;
          font-weight: 400;
          -webkit-text-stroke: 0.1px black;
        }

        .qty-v {
          width: 15mm;
          text-align: left;
          font-weight: 400;
          white-space: nowrap;
          -webkit-text-stroke: 0.1px black;
        }

        .qty-u {
          width: 18mm;
          text-align: left;
          font-weight: 400;
          white-space: nowrap;
          -webkit-text-stroke: 0.1px black;
        }

        .rep-data-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          font-size: 8.5pt;
          margin-top: 1mm;
        }

        .rep-data-table thead th {
          font-weight: 400;
          text-align: center;
          padding: 0.5mm 0.2mm;
          vertical-align: bottom;
          letter-spacing: 0.2px;
          -webkit-text-stroke: 0px black;
        }

        .rep-data-table thead .group-th {
          font-size: 12pt;
          font-weight: 900;
          padding-top: 1mm;
          padding-bottom: 0.8mm;
          -webkit-text-stroke: 0.1px black;
        }

        .rep-data-table thead .col-th {
          font-size: 10pt;
          padding-bottom: 0.5mm;
          line-height: 1.1;
          font-weight: 400;
          letter-spacing: -0.2px;
          -webkit-text-stroke: 0.2px black;
        }

        .rep-data-table td {
          text-align: center;
          padding: 0.3mm 0.1mm;
          line-height: 1.1;
          font-weight: 400;
          -webkit-text-stroke: 0.2px black;
        }

        .rep-data-table .label-cell {
          text-align: left;
          font-weight: 400;
          padding-top: 0mm;
          padding-bottom: 0.5mm;
          font-size: 8pt;
          -webkit-text-stroke: 0.2px black;
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
          padding-bottom: 0.8mm;
        }

        .rep-data-table .totals-row td {
          font-weight: 400;
          padding-top: 0.5mm;
          padding-bottom: 0.5mm;
          -webkit-text-stroke: 0px black;
        }

        .totals-section-top .label-cell {
          padding-top: 0.5mm;
        }

        .total-actual-row .label-cell {
          padding-top: 0.5mm;
        }

        .rep-right-align {
          text-align: right !important;
        }

        .pm-col-shift {
          transform: translateX(-2mm);
        }

        .mm10-col-shift {
          transform: translateX(1mm);
        }

        .moi-col-shift {
          transform: translateX(0mm);
        }

        .col-row-shift {
          transform: translateX(0mm);
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
                <tr><td className="meta-k">Batcher Name</td><td className="meta-s">:</td><td className="meta-v">Stetter</td></tr>
              </tbody>
            </table>
          </div>

          {/* Right Metadata */}
          <div style={{ marginTop: "4mm" }}>
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
                  <td className="qty-v">{(productionQty || 0).toFixed(2)}</td>
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
                  <td className="qty-v">{(productionQty || 0).toFixed(2)}</td>
                  <td className="qty-u">M³</td>
                </tr>
                <tr>
                  <td className="qty-k">Mixer Capacity</td>
                  <td className="qty-s">:</td>
                  <td className="qty-v">{bSize.toFixed(2)}</td>
                  <td className="qty-u">M³</td>
                </tr>
                <tr>
                  <td className="qty-k">Batch Size</td>
                  <td className="qty-s">:</td>
                  <td className="qty-v">{bSize.toFixed(2)}</td>
                  <td className="qty-u">M³</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Data Table Section */}
        <table className="rep-data-table">
          <colgroup>
            <col style={{ width: '11mm' }} />
            <col style={{ width: '13mm' }} />
            <col style={{ width: '12mm' }} />
            <col style={{ width: '14mm' }} />
            <col style={{ width: '13mm' }} />
            <col style={{ width: '13mm' }} />
            <col style={{ width: '13mm' }} />
            <col style={{ width: '14mm' }} />
            <col style={{ width: '16mm' }} />
            <col style={{ width: '7mm' }} />
            <col style={{ width: '13mm' }} />
            <col style={{ width: '13mm' }} />
            <col style={{ width: '13mm' }} />
            <col style={{ width: '13mm' }} />
          </colgroup>
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

                if (col.key === "pm") {
                  cellContent = "";
                } else if (col.key === "water") {
                  cellContent = "WATE";
                }

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
            <tr>
              <td colSpan={reportColumns.length} className="label-cell">Targets based on batchsize in</td>
            </tr>
            <tr className="targets-row border-bottom-thin">
              {reportColumns.map((col, i) => {
                const val = getTargetDisplay(col.key, targets);
                return (
                  <td
                    key={col.key}
                    className={`${i === 0 ? "rep-left-align target-kg-shift" : ""} ${col.key === "pm" ? "pm-col-shift" : ""} ${col.key === "moi" ? "moi-col-shift" : ""} ${col.key === "mm10" ? "mm10-col-shift" : ""}`}
                  >
                    {i === 0 && <span style={{ marginRight: "-1.5mm", fontFamily: '"Times New Roman", Times, serif', fontWeight: 'normal' }}>Kgs.</span>}
                    {col.key === "moi" && <span style={{ fontSize: '9.5pt', marginRight: '1mm', fontFamily: '"Times New Roman", Times, serif', fontWeight: 'normal' }}>in %</span>}
                    {col.key === "pm" && <span style={{ fontSize: '9.5pt', marginRight: '1mm', fontFamily: '"Times New Roman", Times, serif', fontWeight: 'normal' }}>+/-</span>}
                    {val}
                  </td>
                );
              })}
            </tr>

            <tr>
              <td colSpan={reportColumns.length} className="label-cell">Actual in Kgs.</td>
            </tr>
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

            <tr className="totals-section-top border-top">
              <td colSpan={reportColumns.length} className="label-cell">Total Set Weight in Kgs.</td>
            </tr>
            <tr className="totals-row">
              {reportColumns.map((col, i) => {
                const isPlaceholder = col.key === "moi" || col.key === "pm";
                const sw = isPlaceholder
                  ? null
                  : (reportData.setWeights?.[col.key] ?? ((Number(targets[col.key]) || 0) * (reportData.totalBatches || 0)));
                const display = isPlaceholder
                  ? null
                  : ((col.key === "admix1" || col.key === "admix2") ? Number(sw).toFixed(2) : Math.round(sw));

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

            <tr style={{ height: '1mm' }}>
              <td colSpan={reportColumns.length}></td>
            </tr>

            <tr className="total-actual-row">
              <td colSpan={reportColumns.length} className="label-cell">Total Actual in Kgs.</td>
            </tr>
            <tr className="totals-row border-bottom">
              {reportColumns.map((col, i) => {
                const isPlaceholder = col.key === "moi" || col.key === "pm";
                const val = isPlaceholder ? null : (reportData.totals[col.key] || 0);
                const act = isPlaceholder
                  ? null
                  : (col.key.includes("admix") ? Number(val).toFixed(2) : Math.round(val));

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

// ── MODERN SCREEN UI (REPORT TAB) ───────────────────────────────────────────

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
  const reconstructedData = useReportData(entry, targets, batchSize, entry?.differences || {});
  const safeReportData = reportData?.rows ? reportData : reconstructedData;

  const handleSave = () => {
    if (!entry.companyName || entry.companyName.trim() === "") {
      toast.error("Please enter a company name");
      return;
    }
    if (onSaveToHistory) onSaveToHistory();
  };

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="print:hidden">
        {/* Modern Sticky Header for Actions */}
        <div className="sticky top-0 z-30 mb-8 max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-border bg-white/80 p-4 shadow-sm backdrop-blur-md">
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
            <div className="hidden sm:block">
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
              <Button
                variant="primary"
                size="md"
                onClick={onPrint}
                icon={<Printer size={14} />}
                className="rounded-xl bg-brand-1 hover:bg-brand-1/90 shadow-lg shadow-brand-1/20 transition-all active:scale-95"
              >
                Print Report
              </Button>
            </div>
          )}
        </div>

        {/* Screen Preview — scaled down for display only, never bleeds into print */}
        <div className="flex justify-center p-2 sm:p-4 md:p-10 bg-stone-100/50 rounded-3xl border border-dashed border-stone-200 overflow-hidden">
          <div
            className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-stone-900/5 rounded-sm origin-top transition-transform duration-300"
            style={{ transform: 'scale(0.75)', transformOrigin: 'top center' }}
          >
            <ClassicReportLayout
              entry={entry}
              targets={targets}
              reportData={safeReportData}
              batchSize={batchSize}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── HIDDEN PRINT UI ──────────────────────────────────────────────────────────
// This is what actually prints. No transforms, no scaling — pure 1:1 A4 output.

export function HiddenPrintReport({ entry, targets, reportData, batchSize }) {
  const reconstructedData = useReportData(entry, targets, batchSize, entry?.differences || {});
  const safeReportData = reportData?.rows ? reportData : reconstructedData;

  return (
    <div
      className="hidden print:block"
      style={{
        transform: 'none',
        zoom: 1,
        margin: 0,
        padding: 0,
        width: '100%',
      }}
    >
      <ClassicReportLayout
        entry={entry}
        targets={targets}
        reportData={safeReportData}
        batchSize={batchSize}
      />
    </div>
  );
}