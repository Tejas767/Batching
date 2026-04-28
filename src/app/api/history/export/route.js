/**
 * /api/history/export — GET (Streaming CSV)
 *
 * Streams CSV data row-by-row using a MongoDB cursor.
 * Never loads all records into RAM — safe for 300,000+ records.
 *
 * For each docket it outputs multiple rows matching the Autographic Report:
 *   1. Header row   — all batch info (date, customer, grade, etc.)
 *   2. Targets row   — mix design targets based on batch size
 *   3. Batch 1..N    — individual "Actual in Kgs" rows (regenerated via seeded RNG)
 *   4. Total Set Wt  — total set weight in Kgs
 *   5. Total Actual  — total actual in Kgs
 *   6. (blank row)   — visual separator between dockets
 */
import { connectDB } from "@/lib/mongodb";
import BatchRecord from "@/lib/models/BatchRecord";
import { getSession } from "@/lib/auth";
import { MIXER_CAPACITY, defaultDifferences } from "@/constants/mixConfig";

export const dynamic = "force-dynamic";

// ── Deterministic RNG (identical to useReportData.js) ──────────────────
function hashSeed(input) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function randBetween(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function randOffset(rng, diff) {
  const direction = rng() >= 0.5 ? 1 : -1;
  const minMag = Math.max(1, Math.ceil(diff * 0.5));
  const magnitude = minMag + Math.floor(rng() * (diff - minMag + 1));
  return direction * magnitude;
}

// ── Generate batch rows (server-side mirror of useReportData) ──────────
function generateReportData(entry, targets, batchSize, differences = {}) {
  const seed = hashSeed(`${entry.docketNo}-${entry.customerName}-${entry.grade}-${entry.qty}`);
  const rowRng = mulberry32(seed);
  const totalRng = mulberry32(seed ^ 0xdeadbeef);

  const productionQty = Number(entry.qty || 0);
  const capacity = Number(batchSize || MIXER_CAPACITY);

  let totalBatches = 0;
  if (productionQty > 0 && capacity > 0) {
    totalBatches = Math.floor(productionQty / capacity);
  }

  const getDiff = (key) => {
    const val = differences[key];
    if (val !== undefined && val !== null && val !== "") return Number(val);
    return defaultDifferences[key] ?? 0;
  };

  const t = (key) => Number(targets[key]) || 0;

  // Individual batch rows
  const rows = [];
  for (let i = 0; i < totalBatches; i += 1) {
    const row = {};
    row.mm10   = t("mm10")   > 0 ? t("mm10")   + randBetween(rowRng, -2, 2) : 0;
    row.cSan   = t("cSan")   > 0 ? t("cSan")   + randBetween(rowRng, -2, 2) : 0;
    row.moi    = 0.0;
    row.cSand  = t("cSand")  > 0 ? t("cSand")  + randBetween(rowRng, -2, 2) : 0;
    row.mm20   = t("mm20")   > 0 ? t("mm20")   + randBetween(rowRng, -2, 2) : 0;
    row.cem1   = t("cem1")   > 0 ? t("cem1")   + randBetween(rowRng, -2, 2) : 0;
    row.ggbs   = t("ggbs")   > 0 ? t("ggbs")   + randBetween(rowRng, -2, 2) : 0;
    row.flyAsh = t("flyAsh") > 0 ? t("flyAsh") + randBetween(rowRng, -2, 2) : 0;
    row.watIce = t("watIce") > 0 ? t("watIce") + randBetween(rowRng, -1, 1) : 0;
    row.pm     = 0;
    row.water  = t("water")  > 0 ? t("water")  + randBetween(rowRng, -2, 2) : 0;
    row.silica = t("silica") > 0 ? t("silica") + randBetween(rowRng, -1, 1) : 0;
    row.admix1 = t("admix1") > 0 ? Number((t("admix1") + (rowRng() - 0.5) * 0.04).toFixed(2)) : 0.00;
    row.admix2 = t("admix2") > 0 ? Number((t("admix2") + (rowRng() - 0.5) * 0.04).toFixed(2)) : 0.00;
    rows.push(row);
  }

  // Totals (sum of all batch rows)
  const matKeys = ["mm10", "cSan", "cSand", "mm20", "cem1", "ggbs", "flyAsh", "watIce", "water", "silica", "admix1", "admix2"];
  const totals = {};
  for (const key of matKeys) {
    totals[key] = rows.reduce((sum, r) => sum + (r[key] || 0), 0);
  }

  // Set Weights (Total Actual ± operator's DIFFERENCE)
  const calcSetWeight = (key, isAdmix = false) => {
    const base = t(key) * totalBatches;
    if (base === 0) return isAdmix ? 0.00 : 0;
    const diff = getDiff(key);
    const actual = isAdmix ? Number((totals[key] || 0).toFixed(2)) : Math.round(totals[key] || 0);
    if (diff === 0) return actual;
    const offset = randOffset(totalRng, diff);
    const raw = actual + offset;
    if (isAdmix) {
      let r = Number(raw.toFixed(2));
      if (r === actual) r = Number((r + (offset >= 0 ? 0.01 : -0.01)).toFixed(2));
      return r;
    } else {
      let r = Math.round(raw);
      if (r === actual) r += (offset >= 0 ? 1 : -1);
      return r;
    }
  };

  const setWeights = {};
  for (const key of matKeys) {
    const isAdmix = key === "admix1" || key === "admix2";
    setWeights[key] = calcSetWeight(key, isAdmix);
  }

  return { rows, totals, setWeights, totalBatches };
}

// ── CSV helpers ────────────────────────────────────────────────────────
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function csvEscape(val) {
  const s = (val === null || val === undefined ? "" : val).toString().replace(/"/g, '""');
  return `"${s}"`;
}

export async function GET(request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const from   = searchParams.get("from");
    const to     = searchParams.get("to");
    const search = searchParams.get("search");

    const query = { userId: session.id };

    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to)   query.createdAt.$lte = new Date(to + "T23:59:59.999Z");
    }

    if (search) {
      const escaped = escapeRegex(search.trim().slice(0, 100));
      const s = { $regex: escaped, $options: "i" };
      query.$or = [
        { docketNo: s }, { customerName: s },
        { site: s }, { grade: s }, { truckNumber: s },
      ];
    }

    // Material columns in report order
    const matKeys = ["mm10", "cSan", "moi", "cSand", "mm20", "cem1", "ggbs", "flyAsh", "watIce", "pm", "water", "silica", "admix1", "admix2"];
    const matLabels = ["10 M", "C SAN", "Moi", "C SAND", "20 MM", "CEM1", "GGBS", "FLY ASH", "WATER", "+/-", "WAT/I", "Silica", "ADM1", "ADM2"];

    // Stream CSV row-by-row — only 1 document in memory at a time
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // CSV Header
        const headerCols = [
          "Row Type",
          "Batch Date", "Batch Start Time", "Batch End Time",
          "Plant Serial Number", "Docket No", "Customer", "Site",
          "Recipe Code", "Truck Number", "Truck Driver", "Order Number",
          "Batcher Name", "Production Qty (M³)", "Batch Size (M³)", "Total Batches",
          ...matLabels
        ];
        const header = headerCols.map(h => csvEscape(h)).join(",") + "\n";
        controller.enqueue(encoder.encode(header));
        // ── Blank row after header for separation ──
        controller.enqueue(encoder.encode("\n"));

        const cursor = BatchRecord.find(query)
          .select("createdAt docketNo customerName site grade qty truckNumber truckDriver orderNo batchStart batchStop batchStartISO batchStopISO batchSize totalBatches mixDesign setWeights totals differences plantSN username")
          .sort({ createdAt: -1 })
          .lean()
          .cursor();

        for await (const r of cursor) {
          const mix = r.mixDesign || {};
          const bSize = r.batchSize || MIXER_CAPACITY;

          // Regenerate the full report data (individual batches, setWeights, totals)
          const report = generateReportData(
            { docketNo: r.docketNo, customerName: r.customerName, grade: r.grade, qty: r.qty },
            mix,
            bSize,
            r.differences || {}
          );

          // Number of info columns (before material columns)
          const infoCount = 16; // Row Type + 15 info fields
          const emptyInfo = (rowType) => [csvEscape(rowType), ...Array(infoCount - 1).fill(csvEscape(""))];

          // Format: admixtures get 2 decimals, everything else rounds to integer
          const isAdmix = (k) => k === "admix1" || k === "admix2";
          const fmtVal = (k, v) => {
            if (k === "moi" || k === "pm") return v;
            const n = Number(v) || 0;
            return isAdmix(k) ? Number(n.toFixed(2)) : Math.round(n);
          };

          // ── Row 1: Targets — includes ALL batch info ──
          const targetRow = [
            csvEscape("Targets (per batch)"),
            csvEscape(new Date(r.createdAt).toLocaleDateString("en-GB")),
            csvEscape(r.batchStart),
            csvEscape(r.batchStop),
            csvEscape(r.plantSN),
            csvEscape(r.docketNo),
            csvEscape(r.customerName),
            csvEscape(r.site),
            csvEscape(r.grade),
            csvEscape(r.truckNumber),
            csvEscape(r.truckDriver),
            csvEscape(r.orderNo),
            csvEscape(r.username),
            csvEscape(r.qty),
            csvEscape(bSize),
            csvEscape(report.totalBatches),
            ...matKeys.map(k => csvEscape(k === "moi" ? "0.0" : (k === "pm" ? "0" : (Number(mix[k]) || 0))))
          ].join(",") + "\n";
          controller.enqueue(encoder.encode(targetRow));

          // ── "Actual in Kgs" label row ──
          const actualLabel = [csvEscape("Actual in Kgs"), ...Array(infoCount - 1 + matKeys.length).fill(csvEscape(""))].join(",") + "\n";
          controller.enqueue(encoder.encode(actualLabel));

          // ── Rows: Individual Batch Actuals (info columns left blank) ──
          for (let i = 0; i < report.rows.length; i++) {
            const batchRow = report.rows[i];
            const row = [
              ...emptyInfo(`${i + 1}`),
              ...matKeys.map(k => csvEscape(fmtVal(k, batchRow[k] ?? 0)))
            ].join(",") + "\n";
            controller.enqueue(encoder.encode(row));
          }

          // ── Total Set Weight in Kgs (info columns left blank) ──
          const sw = report.setWeights;
          const setWtRow = [
            ...emptyInfo("Total Set Weight (Kgs)"),
            ...matKeys.map(k => csvEscape(k === "moi" ? "" : (k === "pm" ? "" : fmtVal(k, sw[k] ?? 0))))
          ].join(",") + "\n";
          controller.enqueue(encoder.encode(setWtRow));

          // ── Total Actual in Kgs (info columns left blank) ──
          const ta = report.totals;
          const actRow = [
            ...emptyInfo("Total Actual (Kgs)"),
            ...matKeys.map(k => csvEscape(k === "moi" ? "" : (k === "pm" ? "" : fmtVal(k, ta[k] ?? 0))))
          ].join(",") + "\n";
          controller.enqueue(encoder.encode(actRow));

          // ── Blank separator rows between dockets ──
          controller.enqueue(encoder.encode("\n"));
          controller.enqueue(encoder.encode("\n"));
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="Batch_History_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    console.error("GET /api/history/export error:", error);
    return Response.json({ error: "Export failed" }, { status: 500 });
  }
}
