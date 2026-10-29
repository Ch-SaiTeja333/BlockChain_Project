const mongoose = require("mongoose");

const MachineMetadataSchema = new mongoose.Schema(
  {
    machineId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
    },
    criticality: {
      type: String,
      enum: ["Low", "Medium", "High", "Mission Critical"],
      default: "High",
    },
    department: {
      type: String,
      default: "Precision Engineering",
    },
    operatorInCharge: {
      type: String,
      default: "Unassigned",
    },
    recommendedServiceIntervalDays: {
      type: Number,
      default: 90,
    },
    operatingHours: {
      type: Number,
      default: 1250,
    },
    manualUrl: {
      type: String,
      default: "",
    },
    schematicsUrl: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    additionalNotes: {
      type: String,
      default: "",
    },
    lastSyncTimestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MachineMetadata", MachineMetadataSchema);
