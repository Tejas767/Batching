/**
 * useReportData.js — Custom hook to compute the autographic report rows.
 * Matches exact VBA logic provided by user.
 */
"use client";

import { useMemo } from "react";
import { MIXER_CAPACITY, reportColumns } from "@/constants/mixConfig";

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

export function useReportData(entry, targets) {
  return useMemo(() => {
    const seed = hashSeed(`${entry.docketNo}-${entry.customerName}-${entry.grade}-${entry.qty}`);
    const rng = mulberry32(seed);

    const productionQty = Number(entry.qty || 0);
    const capacity = MIXER_CAPACITY;
    
    // TotalBatches = Fix(ProdQty / Capacity)
    let totalBatches = 0;
    if (productionQty > 0 && capacity > 0) {
      totalBatches = Math.floor(productionQty / capacity);
    }

    const rows = [];

    for (let i = 0; i < totalBatches; i += 1) {
      const row = { id: i + 1 };
      
      // Parse targets safely
      const tRSan   = Number(targets.rSan) || 0;
      const tCSan   = Number(targets.cSan) || 0;
      const t20mm   = Number(targets.mm20) || 0;
      const t10mm   = Number(targets.mm10) || 0;
      const tCem1   = Number(targets.cem1) || 0;
      const tFlyAsh = Number(targets.flyAsh) || 0;
      const tWater  = Number(targets.water) || 0;
      const tAdmix1 = Number(targets.admix1) || 0;
      const tAdmix2 = Number(targets.admix2) || 0;

      // RSAN
      row.rSan = tRSan > 0 ? tRSan + randBetween(rng, -3, 3) : 0;
      // CSAN
      row.cSan = tCSan > 0 ? tCSan + randBetween(rng, -3, 3) : 0;
      // 20MM
      row.mm20 = t20mm > 0 ? t20mm + randBetween(rng, -3, 3) : 0;
      // 10MM
      row.mm10 = t10mm > 0 ? t10mm + randBetween(rng, -3, 3) : 0;
      // CEM1
      row.cem1 = tCem1 > 0 ? tCem1 + randBetween(rng, -2, 2) : 0;
      // FLYASH
      row.flyAsh = tFlyAsh > 0 ? tFlyAsh + randBetween(rng, -2, 2) : 0;
      // WATER
      row.water = tWater > 0 ? tWater + randBetween(rng, -4, 4) : 0;
      // ADMIX1
      row.admix1 = tAdmix1 > 0 ? Number((tAdmix1 + ((rng() - 0.5) * 0.14)).toFixed(2)) : 0.00;
      // ADMIX2
      row.admix2 = tAdmix2 > 0 ? Number((tAdmix2 + ((rng() - 0.5) * 0.14)).toFixed(2)) : 0.00;

      // Empty/zero columns
      row.moi = "";
      row.zero1 = 0;
      row.zero2 = 0;
      row.pm = 0;
      row.zero3 = 0;
      row.zero4 = 0;

      rows.push(row);
    }

    const totals = {
      rSan:   rows.reduce((sum, row) => sum + row.rSan, 0),
      cSan:   rows.reduce((sum, row) => sum + row.cSan, 0),
      mm20:   rows.reduce((sum, row) => sum + row.mm20, 0),
      mm10:   rows.reduce((sum, row) => sum + row.mm10, 0),
      cem1:   rows.reduce((sum, row) => sum + row.cem1, 0),
      flyAsh: rows.reduce((sum, row) => sum + row.flyAsh, 0),
      water:  rows.reduce((sum, row) => sum + row.water, 0),
      admix1: rows.reduce((sum, row) => sum + row.admix1, 0),
      admix2: rows.reduce((sum, row) => sum + row.admix2, 0),
    };

    return { rows, totals, totalBatches, productionQty };
  }, [entry, targets]);
}
