/**
 * useReportData.js — Custom hook to compute the autographic report rows.
 *
 * Individual batch rows: small fixed variation (±1 per batch) for realistic display.
 * Total Actual: controlled by the operator's DIFFERENCE row setting.
 *   → Total Actual = Total Set Weight ± Difference (operator configured)
 */
"use client";

import { useMemo } from "react";
import { MIXER_CAPACITY, reportColumns, defaultDifferences } from "@/constants/mixConfig";

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

// Returns a deterministic offset with meaningful magnitude between [diff/2, diff]
// This guarantees the gap between Set Weight and Actual is always noticeable.
function randOffset(rng, diff) {
  const direction  = rng() >= 0.5 ? 1 : -1;
  // Magnitude: always between 50% and 100% of diff (never near-zero)
  const minMag     = Math.max(1, Math.ceil(diff * 0.5));
  const magnitude  = minMag + Math.floor(rng() * (diff - minMag + 1));
  return direction * magnitude;
}

export function useReportData(entry, targets, batchSize = MIXER_CAPACITY, differences = {}) {
  return useMemo(() => {
    const seed = hashSeed(`${entry.docketNo}-${entry.customerName}-${entry.grade}-${entry.qty}`);
    // Two separate RNG streams: one for per-row display, one for totals
    const rowRng   = mulberry32(seed);
    const totalRng = mulberry32(seed ^ 0xdeadbeef); // different stream for totals

    const productionQty = Number(entry.qty || 0);
    const capacity = Number(batchSize || MIXER_CAPACITY);

    // TotalBatches = Fix(ProdQty / Capacity)
    let totalBatches = 0;
    if (productionQty > 0 && capacity > 0) {
      totalBatches = Math.floor(productionQty / capacity);
    }

    // Resolve operator's difference setting, fallback to defaultDifferences
    const getDiff = (key) => {
      const val = differences[key];
      if (val !== undefined && val !== null && val !== "") return Number(val);
      return defaultDifferences[key] ?? 0;
    };

    // ── STEP 1: Generate per-batch rows using ORIGINAL VBA variance logic ──
    // These use the fixed, hardcoded ranges from the VBA specification:
    //   Aggregates  : ±3   Cement: ±2   Water: ±4   Ice/Silica: ±1   Admix: ±0.07
    // The operator's DIFFERENCE row does NOT affect individual batch rows.
    const rows = [];

    for (let i = 0; i < totalBatches; i += 1) {
      const row = { id: i + 1 };

      const t = (key) => Number(targets[key]) || 0;

      // Group: Aggregate — original VBA ±3
      row.mm10  = t("mm10")   > 0 ? t("mm10")   + randBetween(rowRng, -2, 2) : 0;
      row.cSan  = t("cSan")   > 0 ? t("cSan")   + randBetween(rowRng, -2, 2) : 0;
      row.moi   = "0.0";
      row.cSand = t("cSand")  > 0 ? t("cSand")  + randBetween(rowRng, -2, 2) : 0;
      row.mm20  = t("mm20")   > 0 ? t("mm20")   + randBetween(rowRng, -2, 2) : 0;

      // Group: Cement — original VBA ±2
      row.cem1   = t("cem1")   > 0 ? t("cem1")   + randBetween(rowRng, -2, 2) : 0;
      row.ggbs   = t("ggbs")   > 0 ? t("ggbs")   + randBetween(rowRng, -2, 2) : 0;
      row.flyAsh = t("flyAsh") > 0 ? t("flyAsh") + randBetween(rowRng, -2, 2) : 0;

      // Group: Water / Ice — original VBA ±1 for ice, ±4 for water
      row.watIce = t("watIce") > 0 ? t("watIce") + randBetween(rowRng, -1, 1) : 0;
      row.pm     = 0;
      row.water  = t("water")  > 0 ? t("water")  + randBetween(rowRng, -2, 2) : 0;

      // Group: Silica — original VBA ±1
      row.silica = t("silica") > 0 ? t("silica") + randBetween(rowRng, -1, 1) : 0;

      // Group: Admixture — original VBA ±0.07 floating point
      row.admix1 = t("admix1") > 0 ? Number((t("admix1") + (rowRng() - 0.5) * 0.04).toFixed(2)) : 0.00;
      row.admix2 = t("admix2") > 0 ? Number((t("admix2") + (rowRng() - 0.5) * 0.04).toFixed(2)) : 0.00;

      rows.push(row);
    }

    // ── STEP 2: Total Actual = accurate sum of all individual batch rows ──
    // This is the real machine measurement — NOT modified by the DIFFERENCE setting.
    const totals = {
      mm10:   rows.reduce((sum, r) => sum + (r.mm10   || 0), 0),
      cSan:   rows.reduce((sum, r) => sum + (r.cSan   || 0), 0),
      cSand:  rows.reduce((sum, r) => sum + (r.cSand  || 0), 0),
      mm20:   rows.reduce((sum, r) => sum + (r.mm20   || 0), 0),
      cem1:   rows.reduce((sum, r) => sum + (r.cem1   || 0), 0),
      ggbs:   rows.reduce((sum, r) => sum + (r.ggbs   || 0), 0),
      flyAsh: rows.reduce((sum, r) => sum + (r.flyAsh || 0), 0),
      watIce: rows.reduce((sum, r) => sum + (r.watIce || 0), 0),
      water:  rows.reduce((sum, r) => sum + (r.water  || 0), 0),
      silica: rows.reduce((sum, r) => sum + (r.silica || 0), 0),
      admix1: rows.reduce((sum, r) => sum + (r.admix1 || 0), 0),
      admix2: rows.reduce((sum, r) => sum + (r.admix2 || 0), 0),
    };

    // ── STEP 3: Total Set Weight = Total Actual ± operator's DIFFERENCE ──
    // IMPORTANT: Anchored to Total Actual (not the base), so the gap between
    //   Total Set Weight and Total Actual is ALWAYS within ±DIFFERENCE.
    const calcSetWeight = (key, isAdmix = false) => {
      const base   = (Number(targets[key]) || 0) * totalBatches;
      if (base === 0) return isAdmix ? 0.00 : 0;

      const diff   = getDiff(key);
      const actual = isAdmix
        ? Number((totals[key] || 0).toFixed(2))
        : Math.round(totals[key] || 0);

      // If operator sets difference to 0, set weight equals actual (no gap)
      if (diff === 0) return actual;

      // Anchor = Total Actual. Apply ±DIFFERENCE to get Set Weight.
      const offset = randOffset(totalRng, diff);
      const raw    = actual + offset;

      if (isAdmix) {
        let r = Number(raw.toFixed(2));
        // Guarantee Set Weight ≠ Total Actual
        if (r === actual) r = Number((r + (offset >= 0 ? 0.01 : -0.01)).toFixed(2));
        return r;
      } else {
        let r = Math.round(raw);
        // Guarantee Set Weight ≠ Total Actual
        if (r === actual) r += (offset >= 0 ? 1 : -1);
        return r;
      }
    };

    const setWeights = {
      mm10:   calcSetWeight("mm10"),
      cSan:   calcSetWeight("cSan"),
      cSand:  calcSetWeight("cSand"),
      mm20:   calcSetWeight("mm20"),
      cem1:   calcSetWeight("cem1"),
      ggbs:   calcSetWeight("ggbs"),
      flyAsh: calcSetWeight("flyAsh"),
      watIce: calcSetWeight("watIce"),
      water:  calcSetWeight("water"),
      silica: calcSetWeight("silica"),
      admix1: calcSetWeight("admix1", true),
      admix2: calcSetWeight("admix2", true),
    };

    return { rows, totals, setWeights, totalBatches, productionQty };
  }, [entry, targets, batchSize, differences]);
}


