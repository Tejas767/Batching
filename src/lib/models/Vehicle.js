import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const VehicleSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    truckNumber: {
      type: String,
      required: true,
      trim: true,
    },
    driverName: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default models.Vehicle || model("Vehicle", VehicleSchema);
