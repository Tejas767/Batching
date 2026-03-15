/**
 * BatchRecord.js — Mongoose model for batch history records.
 *
 * Each record is linked to the user who created it.
 * Records are NEVER deleted when a user's subscription expires — only isActive changes.
 */
import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const BatchRecordSchema = new Schema(
  {
    // ── Ownership ────────────────────────────────
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
    },

    // ── Batch Entry Fields ────────────────────────
    docketNo:     { type: String, default: "" },
    customerName: { type: String, default: "" },
    site:         { type: String, default: "" },
    grade:        { type: String, default: "" },
    qty:          { type: String, default: "" },
    truckDriver:  { type: String, default: "" },
    truckNumber:  { type: String, default: "" },
    batchStart:   { type: String, default: "" },
    batchStop:    { type: String, default: "" },

    // ── Report Snapshot (saved at print time) ─────
    mixDesign:  { type: Schema.Types.Mixed, default: {} },
    reportRows: { type: [Schema.Types.Mixed], default: [] },
    totals:     { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// ── Indexes for fast queries ───────────────────────
BatchRecordSchema.index({ userId: 1, createdAt: -1 });
BatchRecordSchema.index({ docketNo: 1 });
BatchRecordSchema.index({ customerName: 1 });
BatchRecordSchema.index({ site: 1 });
BatchRecordSchema.index({ truckNumber: 1 });
BatchRecordSchema.index({ createdAt: -1 });

export default models.BatchRecord || model("BatchRecord", BatchRecordSchema);
