import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const CustomerSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    defaultSite: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: fast "get my customers sorted by newest" queries
CustomerSchema.index({ userId: 1, createdAt: -1 });

export default models.Customer || model("Customer", CustomerSchema);
