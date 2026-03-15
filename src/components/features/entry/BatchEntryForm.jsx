/**
 * BatchEntryForm.jsx — Feature component.
 *
 * CDD Layer 3: Handles the batch entry form (fields, start/stop timers).
 * Receives state and handlers from hooks via the parent page.
 */
"use client";

import { motion } from "framer-motion";
import { Input, DisplayField, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Play, StopCircle } from "lucide-react";
import { grades } from "@/constants/mixConfig";

// Form field definitions — matching the new layout
const FIELDS = [
  { label: "DOCKET NO",     key: "docketNo",     type: "text" },
  { label: "CUSTOMER NAME", key: "customerName",  type: "text" },
  { label: "SITE",          key: "site",          type: "text" },
  { label: "GRADE",         key: "grade",         type: "text" },
  { label: "QTY (M³)",      key: "qty",           type: "number" },
  { label: "TRUCK NUMBER",  key: "truckNumber",   type: "text" },
  { label: "DRIVER",        key: "truckDriver",   type: "text" },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export function BatchEntryForm({ 
  entry, 
  customers = [], 
  vehicles = [],
  onUpdateField, 
  onStart, 
  onStop, 
  onPrint, 
  onSaveToHistory 
}) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid gap-4 grid-cols-1 md:grid-cols-3"
    >
      {FIELDS.map(({ label, key, type }) => {
        const value = entry[key];
        let isValid = value !== "" && value !== undefined && value !== null;
        
        // Custom validation for Customer Name: must contain at least one letter
        if (key === "customerName" && isValid) {
          isValid = /[a-zA-Z]/.test(value);
        }

        // Custom validation for Qty: cannot exceed 100
        if (key === "qty" && isValid) {
          isValid = Number(value) <= 100;
        }

        if (key === "grade") {
          return (
            <motion.div key={key} variants={fieldVariants}>
              <Select
                id={`entry-${key}`}
                label={label}
                options={grades}
                value={value}
                onChange={(e) => onUpdateField(key, e.target.value)}
                valid={isValid}
              />
            </motion.div>
          );
        }

        if (key === "customerName") {
          return (
            <motion.div key={key} variants={fieldVariants}>
              <Select
                id={`entry-${key}`}
                label={label}
                options={["SELECT CUSTOMER", ...customers.map(c => c.name)]}
                value={value || "SELECT CUSTOMER"}
                onChange={(e) => {
                  const val = e.target.value === "SELECT CUSTOMER" ? "" : e.target.value;
                  onUpdateField("customerName", val);
                  // Auto-fill site if match found
                  const found = customers.find(c => c.name === val);
                  if (found) {
                    onUpdateField("site", found.defaultSite);
                  } else {
                    onUpdateField("site", "");
                  }
                }}
                valid={isValid}
              />
            </motion.div>
          );
        }

        if (key === "truckNumber") {
          return (
            <motion.div key={key} variants={fieldVariants}>
              <Select
                id={`entry-${key}`}
                label={label}
                options={["SELECT TRUCK", ...vehicles.map(v => v.truckNumber)]}
                value={value || "SELECT TRUCK"}
                onChange={(e) => {
                  const val = e.target.value === "SELECT TRUCK" ? "" : e.target.value;
                  onUpdateField("truckNumber", val);
                  // Auto-fill driver if match found
                  const found = vehicles.find(v => v.truckNumber === val);
                  if (found) {
                    onUpdateField("truckDriver", found.driverName);
                  } else {
                    onUpdateField("truckDriver", "");
                  }
                }}
                valid={isValid}
              />
            </motion.div>
          );
        }

        return (
          <motion.div key={key} variants={fieldVariants}>
            <Input
              id={`entry-${key}`}
              label={label}
              type={type}
              inputMode={type === "number" ? "decimal" : "text"}
              min={key === "qty" ? 0 : undefined}
              max={key === "qty" ? 100 : undefined}
              readOnly={key === "site" || key === "truckDriver"}
              className={(key === "site" || key === "truckDriver") ? "bg-stone-100 opacity-80 cursor-not-allowed" : ""}
              value={value}
              onChange={(e) => {
                let val = e.target.value;
                if (key === "qty") {
                  // Prevent entering numbers > 100 to avoid freezing
                  if (Number(val) > 100) return;
                }
                onUpdateField(key, val);
              }}
              valid={isValid}
            />
            {key === "qty" && Number(value) > 100 && (
              <p className="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-tighter">
                ⚠️ Max limit 100m³ to prevent freeze
              </p>
            )}
          </motion.div>
        );
      })}

      {/* Batch timing matching Row 3 */}
      <motion.div variants={fieldVariants}>
        <Input 
          label="START TIME" 
          placeholder="Auto"
          value={entry.batchStart} 
          onChange={(e) => onUpdateField("batchStart", e.target.value)}
        />
      </motion.div>
      <motion.div variants={fieldVariants}>
        <Input 
          label="STOP TIME" 
          placeholder="Auto"
          value={entry.batchStop} 
          onChange={(e) => onUpdateField("batchStop", e.target.value)}
        />
      </motion.div>

      {/* Start / Stop buttons spanning full width */}
      <motion.div
        variants={fieldVariants}
        className="col-span-full flex gap-3 pt-3"
      >
        <Button
          variant="primary"
          size="lg"
          onClick={onStart}
          icon={<Play size={15} />}
          className="flex-1 justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 border-none shadow-sm text-sm font-semibold tracking-wide transition-colors"
        >
          START BATCH
        </Button>
        <Button
          variant="danger"
          size="lg"
          onClick={onStop}
          icon={<StopCircle size={15} />}
          className="flex-1 justify-center rounded-xl bg-rose-400 hover:bg-rose-500 border-none shadow-sm text-sm font-semibold tracking-wide transition-colors"
        >
          STOP BATCH
        </Button>
      </motion.div>

      {/* Action buttons spanning full width below Start/Stop */}
      <motion.div
        variants={fieldVariants}
        className="col-span-full pt-2 flex flex-col gap-2"
      >
        <Button
          variant="primary"
          size="lg"
          onClick={onPrint}
          className="w-full justify-center rounded-xl bg-brand-1 hover:bg-brand-1/90 border border-brand-1 shadow overflow-hidden py-4 text-sm font-bold uppercase tracking-widest text-[#e8c17b] transition-colors"
        >
          LAST REPORT
        </Button>
        {/* Tip: browser adds headers/footers — user must uncheck them */}
        <p className="text-center text-[11px] text-muted/70 leading-tight">
          💡 In the print dialog, uncheck <span className="font-semibold text-muted">"Headers and footers"</span> to remove the date, URL &amp; page number.
        </p>
      </motion.div>
    </motion.div>
  );
}
