/**
 * mixConfig.js — Shared constants for the concrete batching system.
 *
 * CDD Note: All hard-coded domain data lives here.
 * Feature components import what they need so there's no duplication.
 */

// Available concrete grades
export const grades = ["M10", "M15", "M20", "M25", "M30"];

// Default mix design values for each grade (empty string = not configured)
export const initialMixDesign = {
  M10: { rSan: "", cSan: "", dash1: "", mm20: "", mm10: "", dash2: "", cem1: "", flyAsh: "", dash3: "", water: "", admix1: "", admix2: "" },
  M15: { rSan:"" , cSan: "", dash1: "", mm20: "", mm10: "", dash2: "", cem1: "", flyAsh: "", dash3: "", water: "", admix1: "", admix2: "" },
  M20: { rSan: "", cSan: "", dash1: "", mm20: "", mm10: "", dash2: "", cem1: "", flyAsh: "", dash3: "", water: "", admix1: "", admix2: "" },
  M25: { rSan: 5, cSan: 200, dash1: "", mm20: 300, mm10: 400, dash2: "", cem1: 140, flyAsh: 35, dash3: "", water: 90, admix1: 0.00, admix2: 1.60 },
  M30: { rSan: "", cSan: "", dash1: "", mm20: "", mm10: "", dash2: "", cem1: "", flyAsh: "", dash3: "", water: "", admix1: "", admix2: "" },
};

// Columns shown in the editable EDIT tab and read-only MAIN tab
export const mixColumns = [
  { key: "rSan",   label: "R SAN" },
  { key: "cSan",   label: "C SAN" },
  { key: "dash1",  label: "-" },
  { key: "mm20",   label: "20MM" },
  { key: "mm10",   label: "10MM" },
  { key: "dash2",  label: "-" },
  { key: "cem1",   label: "CEM1" },
  { key: "flyAsh", label: "FLY AS" },
  { key: "dash3",  label: "-" },
  { key: "water",  label: "Water" },
  { key: "admix1", label: "Admix-1" },
  { key: "admix2", label: "Admix-2" },
];

// Columns for the autographic REPORT tab (includes zero/placeholder columns)
export const reportColumns = [
  { key: "rSan",   label: "R SAN",  group: "Aggregate",  variance: 3 },
  { key: "cSan",   label: "C SAN",  group: "Aggregate",  variance: 3 },
  { key: "moi",    label: "Moi",    group: "Aggregate",  variance: 0 },
  { key: "mm20",   label: "20 MM",  group: "Aggregate",  variance: 3 },
  { key: "mm10",   label: "10 MM",  group: "Aggregate",  variance: 3 },
  { key: "zero1",  label: "0",      group: "Aggregate",  variance: 0 },
  { key: "cem1",   label: "CEM1",   group: "Cement",     variance: 2 },
  { key: "flyAsh", label: "FLY AS", group: "Cement",     variance: 2 },
  { key: "zero2",  label: "-",      group: "Cement",     variance: 0 },
  { key: "water",  label: "WATER",  group: "Water",      variance: 4 },
  { key: "pm",     label: "+/-",    group: "Water",      variance: 0 },
  { key: "zero3",  label: " ",      group: "MS / ICE",   variance: 0 },
  { key: "zero4",  label: "0",      group: "MS / ICE",   variance: 0 },
  { key: "admix1", label: "ADMIX1", group: "Admixture",  variance: 0.07 },
  { key: "admix2", label: "ADMIX2", group: "Admixture",  variance: 0.07 },
];

// Display order for column groups in the report header
export const groupOrder = ["Aggregate", "Cement", "Water", "MS / ICE", "Admixture"];

// Mixer capacity in m³ per batch
export const MIXER_CAPACITY = 0.5;
