/**
 * User.js — Mongoose model for users.
 *
 * Stores login credentials, role, account status, and subscription details.
 * Admin creates operators; first admin is seeded via script.
 */
import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const UserSchema = new Schema(
  {
    // ── Credentials ─────────────────────────────
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },

    // ── Role ─────────────────────────────────────
    role: {
      type: String,
      enum: ["admin", "operator"],
      default: "operator",
    },

    // ── Account Status ───────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },

    // ── Profile ──────────────────────────────────
    displayName: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },

    // ── Subscription ─────────────────────────────
    subscriptionStart: {
      type: Date,
      default: null,
    },
    subscriptionDays: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      default: null, // null = no expiry (admins)
    },

    // ── Audit ────────────────────────────────────
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true, // auto createdAt, updatedAt
    toJSON:  { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Virtuals ──────────────────────────────────────
UserSchema.virtual("daysRemaining").get(function () {
  if (!this.expiresAt) return null; // no expiry
  const diff = this.expiresAt.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

UserSchema.virtual("isExpired").get(function () {
  if (!this.expiresAt) return false;
  return Date.now() > this.expiresAt.getTime();
});

// ── Prevent model re-registration on hot-reload ───
export default models.User || model("User", UserSchema);
