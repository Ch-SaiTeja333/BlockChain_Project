const mongoose = require("mongoose");

const MaintenanceRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    machineId: {
      type: String,
      required: true,
      index: true,
    },
    operatorAddress: {
      type: String,
      required: true,
      lowercase: true,
    },
    operatorName: {
      type: String,
      default: "Factory Operator",
    },
    urgency: {
      type: String,
      enum: ["Normal", "High", "Urgent", "Emergency Shutdown"],
      default: "Normal",
    },
    issueSummary: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Assigned", "Resolved", "Closed"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MaintenanceRequest", MaintenanceRequestSchema);
