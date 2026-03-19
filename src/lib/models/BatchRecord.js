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
    plantSN:       { type: String, default: "" },
    companyName:   { type: String, default: "" },

    // ── Report Snapshot (saved at print time) ─────
    mixDesign:    { type: Schema.Types.Mixed, default: {} },
    reportRows:   { type: [Schema.Types.Mixed], default: [] },
    totals:       { type: Schema.Types.Mixed, default: {} },
    setWeights:   { type: Schema.Types.Mixed, default: {} },
    totalBatches: { type: Number, default: 0 },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// ── Indexes for fast queries ───────────────────────
// PRIMARY: Most queries are "get my records sorted newest first"
// This compound index covers the entire paginated query without scanning the collection
BatchRecordSchema.index({ userId: 1, createdAt: -1 });

// SEARCH: Text index for fast $regex searches across key fields
BatchRecordSchema.index({ docketNo: 1 });
BatchRecordSchema.index({ customerName: 1 });
BatchRecordSchema.index({ site: 1 });
BatchRecordSchema.index({ truckNumber: 1 });
BatchRecordSchema.index({ grade: 1 });

export default models.BatchRecord || model("BatchRecord", BatchRecordSchema);
