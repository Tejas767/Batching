/**
 * BatchEntryForm.jsx — Feature component.
 *
 * CDD Layer 3: Handles the batch entry form (fields, start/stop timers).
 * Receives state and handlers from hooks via the parent page.
 */
"use client";

import { useRef } from "react";
import { Input, DisplayField, Select, Combobox } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Play, StopCircle } from "lucide-react";
import { grades } from "@/constants/mixConfig";

// Form field definitions — matching the new layout
const FIELDS = [
  { label: "DOCKET NO",     key: "docketNo",      type: "text",   editable: true },
  { label: "CUSTOMER NAME", key: "customerName",  type: "text",   editable: true },
  { label: "SITE",          key: "site",          type: "text",   editable: false },
  { label: "GRADE",         key: "grade",         type: "text",   editable: true },
  { label: "QTY (M³)",      key: "qty",           type: "number", editable: true },
  { label: "TRUCK NUMBER",  key: "truckNumber",   type: "text",   editable: true },
  { label: "DRIVER",        key: "truckDriver",   type: "text",   editable: false },
];

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
  // ── Enter-to-focus navigation ──────────────────
  // We use refs for all editable fields. Site and Driver are skipped.
  const docketRef = useRef(null);
  const customerRef = useRef(null);
  const gradeRef = useRef(null);
  const qtyRef = useRef(null);
  const truckRef = useRef(null);
  const startRef = useRef(null);
  const stopRef = useRef(null);

  const fieldRefs = {
    docketNo:     docketRef,
    customerName: customerRef,
    grade:        gradeRef,
    qty:          qtyRef,
    truckNumber:  truckRef,
    batchStart:   startRef,
    batchStop:    stopRef,
  };

  const editableOrder = [
    "docketNo", "customerName", "grade", "qty", "truckNumber", "batchStart", "batchStop"
  ];

  const handleEnterKey = (e, currentKey) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const currentIndex = editableOrder.indexOf(currentKey);
      const nextKey = editableOrder[currentIndex + 1];
      if (nextKey && fieldRefs[nextKey].current) {
        fieldRefs[nextKey].current.focus();
      }
    }
  };

  return (
    <div className="grid gap-5 grid-cols-1 md:grid-cols-3">
      {FIELDS.map(({ label, key, type, editable }) => {
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
            <div key={key}>
              <Select
                ref={gradeRef}
                id={`entry-${key}`}
                label={label}
                options={["SELECT GRADE", ...grades]}
                value={value || "SELECT GRADE"}
                onChange={(e) => {
                  const val = e.target.value === "SELECT GRADE" ? "" : e.target.value;
                  onUpdateField(key, val);
                }}
                onKeyDown={(e) => handleEnterKey(e, "grade")}
                valid={isValid}
              />
            </div>
          );
        }

        if (key === "customerName") {
          return (
            <div key={key}>
              <Combobox
                ref={customerRef}
                id={`entry-${key}`}
                label={label}
                options={customers.map(c => c.name)}
                value={value || ""}
                placeholder="TYPE CUSTOMER..."
                onChange={(val) => {
                  onUpdateField("customerName", val);
                  // Auto-fill site if match found
                  const found = customers.find(c => c.name === val);
                  if (found) {
                    onUpdateField("site", found.defaultSite);
                  } else {
                    onUpdateField("site", "");
                  }
                }}
                onKeyDown={(e) => handleEnterKey(e, "customerName")}
                valid={isValid}
              />
            </div>
          );
        }

        if (key === "truckNumber") {
          return (
            <div key={key}>
              <Combobox
                ref={truckRef}
                id={`entry-${key}`}
                label={label}
                options={vehicles.map(v => v.truckNumber)}
                value={value || ""}
                placeholder="TYPE TRUCK..."
                onChange={(val) => {
                  onUpdateField("truckNumber", val);
                  // Auto-fill driver if match found
                  const found = vehicles.find(v => v.truckNumber === val);
                  if (found) {
                    onUpdateField("truckDriver", found.driverName);
                  } else {
                    onUpdateField("truckDriver", "");
                  }
                }}
                onKeyDown={(e) => handleEnterKey(e, "truckNumber")}
                valid={isValid}
              />
            </div>
          );
        }

        return (
          <div key={key}>
            <Input
              ref={fieldRefs[key]}
              id={`entry-${key}`}
              label={label}
              type={type}
              inputMode={type === "number" ? "decimal" : "text"}
              min={key === "qty" ? 0 : undefined}
              max={key === "qty" ? 100 : undefined}
              readOnly={!editable}
              className={!editable ? "bg-stone-50 opacity-80 cursor-not-allowed" : ""}
              value={value}
              onChange={(e) => {
                let val = e.target.value;
                if (key === "qty" && Number(val) > 100) val = "100";
                onUpdateField(key, val);
              }}
              onKeyDown={(e) => editable && handleEnterKey(e, key)}
              valid={isValid}
            />
            {key === "qty" && Number(value) > 100 && (
              <p className="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-tighter">
                ⚠️ Max limit 100m³ to prevent freeze
              </p>
            )}
          </div>
        );
      })}

      {/* Batch timing matching Row 3 */}
      <div>
        <Input 
          ref={startRef}
          id="entry-batchStart"
          label="START TIME" 
          placeholder="Auto"
          value={entry.batchStart} 
          onChange={(e) => onUpdateField("batchStart", e.target.value)}
          onKeyDown={(e) => handleEnterKey(e, "batchStart")}
        />
      </div>
      <div>
        <Input 
          ref={stopRef}
          id="entry-batchStop"
          label="STOP TIME" 
          placeholder="Auto"
          value={entry.batchStop} 
          onChange={(e) => onUpdateField("batchStop", e.target.value)}
          onKeyDown={(e) => handleEnterKey(e, "batchStop")}
        />
      </div>

      {/* Action buttons spanning full width */}
      <div className="col-span-full flex gap-3 pt-3">
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
      </div>

      <div className="col-span-full pt-2 flex flex-col gap-2">
        <Button
          variant="primary"
          size="lg"
          onClick={onPrint}
          className="w-full justify-center rounded-xl bg-brand-1 hover:bg-brand-1/90 border border-brand-1 shadow overflow-hidden py-4 text-sm font-bold uppercase tracking-widest text-[#e8c17b] transition-colors"
        >
          LAST REPORT
        </Button>
        <p className="text-center text-[11px] text-muted/70 leading-tight">
          💡 In the print dialog, uncheck <span className="font-semibold text-muted">"Headers and footers"</span> to remove the date, URL &amp; page number.
        </p>
      </div>
    </div>
  );
}
