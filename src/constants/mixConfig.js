/**
 * mixConfig.js — Shared constants for the concrete batching system.
 *
 * Updated to match SUPERTECH RMC CHARHOLI design.
 * Includes additional grades up to M50.
 */

// Available concrete grades
export const grades = [
  "M10", "M15", "M20", "M25", "M30", "M35", "M40", "M45", "M50"
];

// Default mix design values for each grade (empty string = not configured)
export const initialMixDesign = grades.reduce((acc, grade) => {
  acc[grade] = { 
    mm10: "", cSan: "", cSand: "", mm20: "", cem1: "", ggbs: "", 
    flyAsh: "", watIce: "", water: "", silica: "", admix1: "", admix2: "" 
  };
  return acc;
}, {});

// Default tolerances / differences (±)
export const initialDifferences = {
  mm10: 5, cSan: 5, cSand: 5, mm20: 5, cem1: 5, ggbs: 5, 
  flyAsh: 5, watIce: 5, water: 5, silica: 5, admix1: 0.1, admix2: 0.1
};

export const DEFAULT_BATCH_SIZE = 0.5;

// Columns shown in the editable MIX DESIGN tab
export const mixColumns = [
  { key: "mm10",   label: "10MM" },
  { key: "cSan",   label: "R SAN" },
  { key: "cSand",  label: "C SAN" },
  { key: "mm20",   label: "20MM" },
  { key: "cem1",   label: "CEM1" },
  { key: "ggbs",   label: "GGBS" },
  { key: "flyAsh", label: "FLY ASH" },
  { key: "water",  label: "WATER" },
  { key: "admix1", label: "ADMIX1" },
  { key: "admix2", label: "ADMIX2" },
];

// Columns for the autographic REPORT tab (includes zero/placeholder columns)
export const reportColumns = [
  // Aggregate
  { key: "mm10",   label: "10 M",   group: "Aggregate",     variance: 3 },
  { key: "cSan",   label: "C SAN",  group: "Aggregate",     variance: 3 },
  { key: "moi",    label: "Moi",    group: "Aggregate",     variance: 0 },
  { key: "cSand",  label: "C SAND", group: "Aggregate",     variance: 3 },
  { key: "mm20",   label: "20 MM",  group: "Aggregate",     variance: 3 },
  // Cement
  { key: "cem1",   label: "CEM1",   group: "Cement",        variance: 2 },
  { key: "ggbs",   label: "GGBS",   group: "Cement",        variance: 2 },
  { key: "flyAsh", label: "FLY ASH",group: "Cement",        variance: 2 },
  // Water / Ice
  { key: "watIce", label: "WAT/ICE",group: "Water / Ice",   variance: 1 },
  { key: "pm",     label: "+/-",    group: "Water / Ice",   variance: 0 },
  { key: "water",  label: "WATE",   group: "Water / Ice",   variance: 4 },
  // Silica
  { key: "silica", label: "Silica", group: "Silica",        variance: 1 },
  // Admixture
  { key: "admix1", label: "ADM1",   group: "Admixture",     variance: 0.07 },
  { key: "admix2", label: "ADM2",   group: "Admixture",     variance: 0.07 },
];

// Display order for column groups in the report header
export const groupOrder = ["Aggregate", "Cement", "Water / Ice", "Silica", "Admixture"];

// Mixer capacity in m³ per batch
export const MIXER_CAPACITY = 0.50;
