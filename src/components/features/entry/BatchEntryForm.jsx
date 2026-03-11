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

// Form field definitions — order matches the original UI
const FIELDS = [
  { label: "Docket No",     key: "docketNo",     type: "text" },
  { label: "Customer Name", key: "customerName",  type: "text" },
  { label: "Site",          key: "site",          type: "text" },
  { label: "Grade",         key: "grade",         type: "text" },
  { label: "Qty (m³)",      key: "qty",           type: "number" },
  { label: "Truck Driver",  key: "truckDriver",   type: "text" },
  { label: "Truck Number",  key: "truckNumber",   type: "text" },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export function BatchEntryForm({ entry, onUpdateField, onStart, onStop, onPrint, onSaveToHistory }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid gap-4 md:grid-cols-2"
    >
      {FIELDS.map(({ label, key, type }) => {
        const value = entry[key];
        let isValid = value !== "" && value !== undefined && value !== null;
        
        // Custom validation for Customer Name: must contain at least one letter
        if (key === "customerName" && isValid) {
          isValid = /[a-zA-Z]/.test(value);
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

        return (
          <motion.div key={key} variants={fieldVariants}>
            <Input
              id={`entry-${key}`}
              label={label}
              type={type}
              inputMode={type === "number" ? "decimal" : "text"}
              value={value}
              onChange={(e) => {
                let val = e.target.value;
                if (key === "customerName") {
                  val = val.replace(/[0-9]/g, ""); // Strictly remove digits
                }
                onUpdateField(key, val);
              }}
              valid={isValid}
            />
          </motion.div>
        );
      })}

      {/* Batch timing (now editable) */}
      <motion.div variants={fieldVariants}>
        <Input 
          label="Batch Start" 
          value={entry.batchStart} 
          onChange={(e) => onUpdateField("batchStart", e.target.value)}
        />
      </motion.div>
      <motion.div variants={fieldVariants}>
        <Input 
          label="Batch Stop" 
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
          Start Batch
        </Button>
        <Button
          variant="danger"
          size="lg"
          onClick={onStop}
          icon={<StopCircle size={15} />}
          className="flex-1 justify-center rounded-xl bg-rose-600 hover:bg-rose-700 border-none shadow-sm text-sm font-semibold tracking-wide transition-colors"
        >
          Stop Batch
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
          Print Report
        </Button>
        {/* Tip: browser adds headers/footers — user must uncheck them */}
        <p className="text-center text-[11px] text-muted/70 leading-tight">
          💡 In the print dialog, uncheck <span className="font-semibold text-muted">"Headers and footers"</span> to remove the date, URL &amp; page number.
        </p>
      </motion.div>
    </motion.div>
  );
}
