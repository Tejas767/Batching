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

// Columns shown in the editable MIX DESIGN tab
export const mixColumns = [
  { key: "mm10",   label: "10 M" },
  { key: "cSan",   label: "C SAN" },
  { key: "cSand",  label: "C SAND" },
  { key: "mm20",   label: "20 MM" },
  { key: "cem1",   label: "CEM1" },
  { key: "ggbs",   label: "GGBS" },
  { key: "flyAsh", label: "FLY ASH" },
  { key: "watIce", label: "WATER" },
  { key: "water",  label: "WAT/I" },
  { key: "silica", label: "SILICA" },
  { key: "admix1", label: "ADM1" },
  { key: "admix2", label: "ADM2" },
];

// Columns for the autographic REPORT tab (includes zero/placeholder columns)
export const reportColumns = [
  // Aggregate
  { key: "mm10",   label: "10 M",   group: "Aggregate",     variance: 2 },
  { key: "cSan",   label: "C SAN",  group: "Aggregate",     variance: 2 },
  { key: "moi",    label: "Moi",    group: "Aggregate",     variance: 0 },
  { key: "cSand",  label: "C SAND", group: "Aggregate",     variance: 2 },
  { key: "mm20",   label: "20 MM",  group: "Aggregate",     variance: 2 },
  // Cement
  { key: "cem1",   label: "CEM1",   group: "Cement",        variance: 2 },
  { key: "ggbs",   label: "GGBS",   group: "Cement",        variance: 2 },
  { key: "flyAsh", label: "FLY ASH",group: "Cement",        variance: 2 },
  // Water / Ice
  { key: "watIce", label: "WATER", group: "Water",   variance: 1 },
  { key: "pm",     label: "+/-",    group: "Water",   variance: 0 },
  { key: "water",  label: "WAT/I",   group: "Water",   variance: 2 },
  // Silica
  { key: "silica", label: "Silica", group: "Silica",        variance: 1 },
  // Admixture
  { key: "admix1", label: "ADM1", group: "Admixture",   variance: 0.02 },
  { key: "admix2", label: "ADM2", group: "Admixture",   variance: 0.02 },
];

// Display order for column groups in the report header
export const groupOrder = ["Aggregate", "Cement", "Water", "Silica", "Admixture"];

// Mixer capacity in m³ per batch
export const MIXER_CAPACITY = 0.50;

// Default variance (allowed difference ±) per material column
// Operator can edit these in the Mix Design DIFFERENCE row
export const defaultDifferences = {
  mm10:   2,
  cSan:   2,
  cSand:  2,
  mm20:   2,
  cem1:   2,
  ggbs:   2,
  flyAsh: 2,
  watIce: 1,
  water:  2,
  silica: 1,
  admix1: 0.02,
  admix2: 0.02,
};
