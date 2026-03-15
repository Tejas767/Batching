import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const MixDesignSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One mix design object per user
    },
    design: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default models.MixDesign || model("MixDesign", MixDesignSchema);
