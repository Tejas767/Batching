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

export function useReportData(entry, targets, batchSize = 0.5, differences = {}) {
  return useMemo(() => {
    const seed = hashSeed(`${entry.docketNo}-${entry.customerName}-${entry.grade}-${entry.qty}`);
    const rng = mulberry32(seed);

    const productionQty = Number(entry.qty || 0);
    const capacity = Number(batchSize || 0.5);
    
    // TotalBatches = Fix(ProdQty / Capacity)
    let totalBatches = 0;
    if (productionQty > 0 && capacity > 0) {
      totalBatches = Math.floor(productionQty / capacity);
    }

    const rows = [];
    const diff = (key) => Number(differences[key] || 0);

    for (let i = 0; i < totalBatches; i += 1) {
      const row = { id: i + 1 };
      
      const tMM10   = Number(targets.mm10) || 0;
      const tCSAN   = Number(targets.cSan) || 0;
      const tCSAND  = Number(targets.cSand) || 0;
      const tMM20   = Number(targets.mm20) || 0;
      const tCEM1   = Number(targets.cem1) || 0;
      const tGGBS   = Number(targets.ggbs) || 0;
      const tFlyAsh = Number(targets.flyAsh) || 0;
      const tWatIce = Number(targets.watIce) || 0;
      const tWater  = Number(targets.water) || 0;
      const tSilica = Number(targets.silica) || 0;
      const tAdmix1 = Number(targets.admix1) || 0;
      const tAdmix2 = Number(targets.admix2) || 0;

      // Variance using dynamic Differences (±)
      row.mm10 = tMM10 > 0 ? tMM10 + randBetween(rng, -diff('mm10'), diff('mm10')) : 0;
      row.cSan = tCSAN > 0 ? tCSAN + randBetween(rng, -diff('cSan'), diff('cSan')) : 0;
      row.moi  = "0.0";
      row.cSand = tCSAND > 0 ? tCSAND + randBetween(rng, -diff('cSand'), diff('cSand')) : 0;
      row.mm20 = tMM20 > 0 ? tMM20 + randBetween(rng, -diff('mm20'), diff('mm20')) : 0;

      row.cem1   = tCEM1 > 0 ? tCEM1 + randBetween(rng, -diff('cem1'), diff('cem1')) : 0;
      row.ggbs   = tGGBS > 0 ? tGGBS + randBetween(rng, -diff('ggbs'), diff('ggbs')) : 0;
      row.flyAsh = tFlyAsh > 0 ? tFlyAsh + randBetween(rng, -diff('flyAsh'), diff('flyAsh')) : 0;

      row.watIce = tWatIce > 0 ? tWatIce + randBetween(rng, -diff('watIce'), diff('watIce')) : 0;
      row.pm     = 0;
      row.water  = tWater > 0 ? tWater + randBetween(rng, -diff('water'), diff('water')) : 0;

      row.silica = tSilica > 0 ? tSilica + randBetween(rng, -diff('silica'), diff('silica')) : 0;

      // Admixtures often have decimal tolerances (e.g. 0.10)
      const a1Var = diff('admix1');
      row.admix1 = tAdmix1 > 0 ? Number((tAdmix1 + ((rng() - 0.5) * a1Var * 2)).toFixed(2)) : 0.00;
      
      const a2Var = diff('admix2');
      row.admix2 = tAdmix2 > 0 ? Number((tAdmix2 + ((rng() - 0.5) * a2Var * 2)).toFixed(2)) : 0.00;

      rows.push(row);
    }

    const totals = {
      mm10:   rows.reduce((sum, row) => sum + row.mm10, 0),
      cSan:   rows.reduce((sum, row) => sum + row.cSan, 0),
      cSand:  rows.reduce((sum, row) => sum + row.cSand, 0),
      mm20:   rows.reduce((sum, row) => sum + row.mm20, 0),
      cem1:   rows.reduce((sum, row) => sum + row.cem1, 0),
      ggbs:   rows.reduce((sum, row) => sum + row.ggbs, 0),
      flyAsh: rows.reduce((sum, row) => sum + row.flyAsh, 0),
      watIce: rows.reduce((sum, row) => sum + row.watIce, 0),
      water:  rows.reduce((sum, row) => sum + row.water, 0),
      silica: rows.reduce((sum, row) => sum + row.silica, 0),
      admix1: rows.reduce((sum, row) => sum + row.admix1, 0),
      admix2: rows.reduce((sum, row) => sum + row.admix2, 0),
    };

    return { rows, totals, totalBatches, productionQty };
  }, [entry, targets, batchSize, differences]);
}
