const mongoose = require("mongoose");

const DocumentRecordSchema = new mongoose.Schema(
  {
    docId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      default: "application/octet-stream",
    },
    sizeBytes: {
      type: Number,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    sha256Hash: {
      type: String,
      required: true,
      index: true,
    },
    machineId: {
      type: String,
      required: true,
      index: true,
    },
    docType: {
      type: String,
      enum: [
        "Maintenance Calibration Certificate",
        "Maintenance Work Report",
        "ISO Safety Audit Evidence",
        "Vibration Analysis Data Sheet",
        "Component Replacement Invoice",
        "Operator Inspection Checklist",
        "Other",
      ],
      default: "Maintenance Work Report",
    },
    uploadedBy: {
      type: String,
      lowercase: true,
      default: "",
    },
    onChainTxHash: {
      type: String,
      default: "",
    },
    verifiedOnChain: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DocumentRecord", DocumentRecordSchema);
